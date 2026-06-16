import { applyCors } from '../_lib/cors.js';
import { methodGuard, readJson, badReq, ok, serverError } from '../_lib/response.js';
import { rateLimit } from '../_lib/rateLimit.js';
import { db, FieldValue, nextOrderNumber } from '../_lib/firebase.js';
import { stripe } from '../_lib/stripe.js';
import { getCaller } from '../_lib/auth.js';
import { checkoutSessionSchema } from '../_lib/schemas.js';
import { env } from '../_lib/env.js';
import { publicUrl } from '../_lib/r2.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (!methodGuard(req, res, ['POST'])) return;

  const rl = await rateLimit(req, { key: 'checkout', limit: 20, windowSec: 60 });
  if (!rl.success) return res.status(429).json({ error: 'Too many requests' });

  let body;
  try { body = checkoutSessionSchema.parse(await readJson(req)); }
  catch (e) { return badReq(res, e.errors?.[0]?.message ?? 'Invalid request'); }

  try {
    const caller = await getCaller(req); // guest checkout allowed

    // ---- 1. Load store settings -----------------------------------------
    const settingsSnap = await db().collection('storeSettings').doc('global').get();
    const settings = settingsSnap.exists ? settingsSnap.data() : {};
    const storeCurrency = (settings.currency ?? 'USD').toUpperCase();
    const allowedMethods = Array.isArray(settings.paymentMethods) && settings.paymentMethods.length
      ? settings.paymentMethods
      : ['card'];
    const taxRateBps = Number(settings.defaultTaxRateBps ?? 0);
    const taxInclusive = !!settings.taxInclusive;
    const freeShippingThreshold = Number(settings.freeShippingThresholdCents ?? 0);

    // ---- 2. Re-price every line on the server ---------------------------
    let subtotal = 0;
    let totalWeightGrams = 0;
    const stripeLines = [];
    const orderItems = [];

    for (const item of body.items) {
      const productSnap = await db().collection('products').doc(item.productId).get();
      if (!productSnap.exists) return badReq(res, `Unknown product ${item.productId}`);
      const product = productSnap.data();
      if (!product.active) return badReq(res, `Product unavailable: ${product.name}`);

      const variantSnap = await productSnap.ref.collection('variants').doc(item.variantId).get();
      if (!variantSnap.exists) return badReq(res, 'Unknown variant');
      const variant = variantSnap.data();
      if (!variant.active) return badReq(res, `Variant unavailable: ${product.name}`);
      if ((variant.stock ?? 0) < item.quantity) {
        return badReq(res, `Insufficient stock for ${product.name}`);
      }

      const currency = (product.currency ?? storeCurrency).toUpperCase();
      if (currency !== storeCurrency) return badReq(res, 'Currency mismatch');

      const unit = variant.priceCents;
      const lineTotal = unit * item.quantity;
      subtotal += lineTotal;
      totalWeightGrams += (variant.weightGrams ?? 0) * item.quantity;

      // First image for Stripe display
      const imageSnap = await productSnap.ref.collection('images')
        .orderBy('sortOrder', 'asc').limit(1).get();
      let imageUrl = null;
      if (!imageSnap.empty) {
        const mediaId = imageSnap.docs[0].data().mediaId;
        if (mediaId) {
          const mSnap = await db().collection('mediaAssets').doc(mediaId).get();
          if (mSnap.exists) {
            const m = mSnap.data();
            imageUrl = m.url ?? publicUrl(m.key);
          }
        }
      }

      const name = `${product.name}${variant.size ? ` — ${variant.size}` : ''}${variant.color ? ` / ${variant.color}` : ''}`;

      stripeLines.push({
        quantity: item.quantity,
        price_data: {
          currency: currency.toLowerCase(),
          unit_amount: unit,
          product_data: {
            name,
            images: imageUrl ? [imageUrl] : undefined,
            metadata: { productId: productSnap.id, variantId: variantSnap.id, sku: variant.sku ?? '' },
          },
        },
      });

      orderItems.push({
        productId: productSnap.id,
        variantId: variantSnap.id,
        nameSnapshot: name,
        skuSnapshot: variant.sku ?? null,
        unitPriceCents: unit,
        quantity: item.quantity,
        totalCents: lineTotal,
      });
    }

    // ---- 3. Discount (server-validated) ---------------------------------
    let discountCents = 0;
    let discountCodeId = null;
    if (body.discountCode) {
      const codeUpper = body.discountCode.toUpperCase();
      const dSnap = await db().collection('discountCodes').doc(codeUpper).get();
      if (dSnap.exists) {
        const d = dSnap.data();
        const now = new Date();
        const startsOk = !d.startsAt || new Date(d.startsAt) <= now;
        const expiresOk = !d.expiresAt || new Date(d.expiresAt) > now;
        const limitOk = !d.usageLimit || (d.usedCount ?? 0) < d.usageLimit;
        if (d.active && startsOk && expiresOk && limitOk
            && subtotal >= (d.minSubtotalCents ?? 0)) {
          discountCodeId = codeUpper;
          if (d.kind === 'percent') {
            discountCents = Math.round(subtotal * Number(d.percentOff ?? 0) / 100);
          } else {
            discountCents = Math.min(subtotal, d.amountOffCents ?? 0);
          }
        }
      }
    }

    // ---- 4. Shipping ----------------------------------------------------
    let shippingCents = 0;
    let shippingRate = null;
    if (body.shippingRateId) {
      // Find the rate inside the zones tree
      const zonesSnap = await db().collection('shippingZones').get();
      for (const zone of zonesSnap.docs) {
        const r = await zone.ref.collection('rates').doc(body.shippingRateId).get();
        if (r.exists) { shippingRate = { id: r.id, ...r.data(), zoneId: zone.id }; break; }
      }
      if (shippingRate?.active !== false && shippingRate) {
        const weightKg = totalWeightGrams / 1000;
        shippingCents = (shippingRate.flatCents ?? 0)
          + Math.round((shippingRate.perKgCents ?? 0) * weightKg);
        const freeAbove = shippingRate.freeAboveCents ?? freeShippingThreshold;
        if (freeAbove && subtotal - discountCents >= freeAbove) shippingCents = 0;
      }
    }

    // ---- 5. Tax ---------------------------------------------------------
    const taxedSubtotal = Math.max(0, subtotal - discountCents);
    const taxCents = taxInclusive ? 0 : Math.round(taxedSubtotal * taxRateBps / 10000);
    const totalCents = taxedSubtotal + shippingCents + taxCents;

    // ---- 6. Persist pending order ---------------------------------------
    const orderRef = db().collection('storeOrders').doc();
    const number = await nextOrderNumber();
    const customerId = caller?.user?.uid ?? null;

    await orderRef.set({
      number,
      customerId,
      email: body.email,
      status: 'pending',
      currency: storeCurrency,
      subtotalCents: subtotal,
      discountCents,
      shippingCents,
      taxCents,
      totalCents,
      discountCode: discountCodeId,
      shippingAddress: body.shippingAddress,
      billingAddress: body.billingAddress ?? null,
      shippingRateId: shippingRate?.id ?? null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Save items as a subcollection
    const itemsBatch = db().batch();
    for (const it of orderItems) {
      const ref = orderRef.collection('items').doc();
      itemsBatch.set(ref, it);
    }
    await itemsBatch.commit();

    // ---- 7. Stripe Checkout session -------------------------------------
    const finalLines = [...stripeLines];
    if (taxCents > 0) {
      finalLines.push({
        quantity: 1,
        price_data: {
          currency: storeCurrency.toLowerCase(),
          unit_amount: taxCents,
          product_data: { name: 'Tax' },
        },
      });
    }

    const session = await stripe().checkout.sessions.create({
      mode: 'payment',
      payment_method_types: allowedMethods,
      customer_email: body.email,
      line_items: finalLines,
      success_url: `${env.APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${env.APP_URL}/checkout/cancel?session_id={CHECKOUT_SESSION_ID}`,
      metadata: { orderId: orderRef.id },
      payment_intent_data: { metadata: { orderId: orderRef.id } },
      shipping_address_collection: {
        allowed_countries: settings.allowedCountries?.length
          ? settings.allowedCountries
          : ['US','CA','GB','AU','DE','FR','NL','SE','NO','DK','FI','ZA'],
      },
      discounts: discountCents ? [{ coupon: await ensureStripeCoupon(discountCents, storeCurrency) }] : undefined,
      shipping_options: shippingCents
        ? [{
            shipping_rate_data: {
              type: 'fixed_amount',
              display_name: shippingRate?.name ?? 'Shipping',
              fixed_amount: { amount: shippingCents, currency: storeCurrency.toLowerCase() },
            },
          }]
        : undefined,
    });

    await orderRef.update({ stripeSessionId: session.id });

    return ok(res, { url: session.url, orderId: orderRef.id });
  } catch (e) {
    return serverError(res, e);
  }
}

async function ensureStripeCoupon(amountCents, currency) {
  const id = `abx_${currency.toLowerCase()}_${amountCents}`;
  try {
    const existing = await stripe().coupons.retrieve(id);
    if (existing && !existing.deleted) return id;
  } catch (_) { /* not found */ }
  await stripe().coupons.create({
    id, amount_off: amountCents, currency: currency.toLowerCase(),
    duration: 'once', name: 'Discount',
  });
  return id;
}
