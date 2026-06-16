import { applyCors } from '../../_lib/cors.js';
import { methodGuard, readJson, ok, notFound, badReq, serverError } from '../../_lib/response.js';
import { requireRole } from '../../_lib/auth.js';
import { db, FieldValue, toJson } from '../../_lib/firebase.js';
import { orderUpdateSchema } from '../../_lib/schemas.js';
import { audit } from '../../_lib/audit.js';
import { Emails } from '../../_lib/email.js';

// Carriers we know how to deep-link tracking for.
function trackingUrlFor(carrier, number) {
  if (!carrier || !number) return null;
  const c = carrier.toLowerCase();
  if (c.includes('ups'))    return `https://www.ups.com/track?tracknum=${encodeURIComponent(number)}`;
  if (c.includes('fedex'))  return `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(number)}`;
  if (c.includes('usps'))   return `https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1=${encodeURIComponent(number)}`;
  if (c.includes('dhl'))    return `https://www.dhl.com/global-en/home/tracking.html?tracking-id=${encodeURIComponent(number)}`;
  if (c.includes('aramex')) return `https://www.aramex.com/track/results?ShipmentNumber=${encodeURIComponent(number)}`;
  return null;
}

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (!methodGuard(req, res, ['GET','PATCH'])) return;
  const caller = await requireRole(req, res, 'fulfillment');
  if (!caller) return;
  const id = req.query.id;
  if (!id) return badReq(res, 'id required');

  try {
    const ref = db().collection('storeOrders').doc(id);
    const snap = await ref.get();
    if (!snap.exists) return notFound(res);
    const existing = snap.data();

    if (req.method === 'GET') {
      const itemsSnap = await ref.collection('items').get();
      return ok(res, {
        order: { ...toJson(snap), items: itemsSnap.docs.map(d => toJson(d)) },
      });
    }

    let patch;
    try { patch = orderUpdateSchema.parse(await readJson(req)); }
    catch (e) { return badReq(res, e.errors?.[0]?.message ?? 'Invalid request'); }

    const update = { ...patch, updatedAt: FieldValue.serverTimestamp() };
    if (patch.status === 'fulfilled' && !existing.fulfilledAt) update.fulfilledAt = FieldValue.serverTimestamp();
    if (patch.status === 'canceled' && !existing.canceledAt)   update.canceledAt   = FieldValue.serverTimestamp();

    await ref.update(update);
    const after = await ref.get();
    const data = after.data();

    // Fire the shipped email when the order transitions into 'shipped'.
    if (patch.status === 'shipped' && existing.status !== 'shipped' && data.email) {
      try {
        await Emails.sendOrderShipped(data, {
          carrier: data.trackingCarrier ?? null,
          trackingNumber: data.trackingNumber ?? null,
          trackingUrl: trackingUrlFor(data.trackingCarrier, data.trackingNumber),
        });
      } catch (e) {
        console.error('[email] shipped notice failed', e);
      }
    }

    await audit({ req, actor: caller, action: 'order.update', entityType: 'order', entityId: id, before: existing, after: data });
    return ok(res, { order: toJson(after) });
  } catch (e) {
    return serverError(res, e);
  }
}
