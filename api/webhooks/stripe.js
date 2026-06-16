import { stripe } from '../_lib/stripe.js';
import { db, FieldValue } from '../_lib/firebase.js';
import { env } from '../_lib/env.js';
import { Emails } from '../_lib/email.js';

export const config = { api: { bodyParser: false } };

function readRaw(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }

  let event;
  try {
    const raw = await readRaw(req);
    const sig = req.headers['stripe-signature'];
    event = stripe().webhooks.constructEvent(raw, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[stripe] signature verification failed', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const orderId = session.metadata?.orderId;
        if (!orderId) break;

        const orderRef = db().collection('storeOrders').doc(orderId);
        const itemsCol = orderRef.collection('items');

        // Transaction: only mark paid once, decrement stock atomically.
        const result = await db().runTransaction(async (tx) => {
          const orderSnap = await tx.get(orderRef);
          if (!orderSnap.exists) return { skip: true };
          const order = orderSnap.data();
          if (order.status !== 'pending') return { skip: true };

          const itemsSnap = await tx.get(itemsCol);
          const items = itemsSnap.docs.map(d => d.data());

          // Snapshot stock levels
          const variantRefs = items.map(it =>
            db().collection('products').doc(it.productId).collection('variants').doc(it.variantId));
          const variantSnaps = [];
          for (const ref of variantRefs) variantSnaps.push(await tx.get(ref));

          // Decrement each
          for (let i = 0; i < items.length; i++) {
            const it = items[i];
            const vSnap = variantSnaps[i];
            if (!vSnap.exists) continue;
            const newStock = Math.max(0, (vSnap.data().stock ?? 0) - it.quantity);
            tx.update(vSnap.ref, { stock: newStock });
          }

          const paidAt = FieldValue.serverTimestamp();
          const paymentIntent = typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id ?? null;

          tx.update(orderRef, {
            status: 'paid',
            paidAt,
            stripePaymentIntent: paymentIntent,
            updatedAt: paidAt,
          });

          return { skip: false, order, items, paidAt };
        });

        if (result.skip) break;

        // After the transaction commits, write inventory ledger and (best-effort) increment discount.
        const ledger = db().batch();
        for (const it of result.items) {
          ledger.set(db().collection('inventoryMovements').doc(), {
            variantId: it.variantId,
            productId: it.productId,
            delta: -it.quantity,
            reason: 'order',
            orderId,
            at: FieldValue.serverTimestamp(),
          });
        }
        await ledger.commit().catch(e => console.error('[ledger]', e));

        if (result.order.discountCode) {
          db().collection('discountCodes').doc(result.order.discountCode)
            .update({ usedCount: FieldValue.increment(1) })
            .catch(e => console.warn('[discount increment]', e));
        }

        // Receipt
        try {
          await Emails.sendOrderReceipt(
            { ...result.order, id: orderId },
            result.items,
          );
        } catch (e) {
          console.error('[email] receipt failed', e);
        }
        break;
      }

      case 'checkout.session.expired':
      case 'checkout.session.async_payment_failed': {
        const session = event.data.object;
        const orderId = session.metadata?.orderId;
        if (orderId) {
          await db().collection('storeOrders').doc(orderId)
            .update({ status: 'failed', updatedAt: FieldValue.serverTimestamp() });
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object;
        const pi = typeof charge.payment_intent === 'string'
          ? charge.payment_intent : charge.payment_intent?.id;
        if (pi) {
          const snap = await db().collection('storeOrders')
            .where('stripePaymentIntent', '==', pi).limit(1).get();
          if (!snap.empty) {
            await snap.docs[0].ref.update({
              status: 'refunded', updatedAt: FieldValue.serverTimestamp(),
            });
          }
        }
        break;
      }

      default: break;
    }
  } catch (e) {
    console.error('[stripe webhook] handler error', e);
    return res.status(500).send('handler error');
  }

  res.status(200).json({ received: true });
}
