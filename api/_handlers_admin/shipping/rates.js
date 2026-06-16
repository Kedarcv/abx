// POST   /api/admin/shipping/rates                — create rate under a zone
// PATCH  /api/admin/shipping/rates?zoneId=&id=    — update
// DELETE /api/admin/shipping/rates?zoneId=&id=    — delete
import { applyCors } from '../../_lib/cors.js';
import { methodGuard, readJson, ok, created, badReq, notFound, serverError } from '../../_lib/response.js';
import { requireRole } from '../../_lib/auth.js';
import { db, FieldValue, toJson } from '../../_lib/firebase.js';
import { shippingRateSchema } from '../../_lib/schemas.js';
import { audit } from '../../_lib/audit.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (!methodGuard(req, res, ['POST','PATCH','DELETE'])) return;
  const caller = await requireRole(req, res, 'editor');
  if (!caller) return;

  try {
    if (req.method === 'POST') {
      let body;
      try { body = shippingRateSchema.parse(await readJson(req)); }
      catch (e) { return badReq(res, e.errors?.[0]?.message ?? 'Invalid request'); }
      const ref = await db().collection('shippingZones').doc(body.zoneId)
        .collection('rates').add({
          ...body, createdAt: FieldValue.serverTimestamp(),
        });
      const saved = await ref.get();
      await audit({ req, actor: caller, action: 'shipping_rate.create', entityType: 'shipping_rate', entityId: ref.id, after: body });
      return created(res, { rate: toJson(saved) });
    }

    const zoneId = req.query.zoneId;
    const id = req.query.id;
    if (!zoneId || !id) return badReq(res, 'zoneId and id required');
    const ref = db().collection('shippingZones').doc(zoneId).collection('rates').doc(id);
    const snap = await ref.get();
    if (!snap.exists) return notFound(res);
    const existing = snap.data();

    if (req.method === 'DELETE') {
      await ref.delete();
      await audit({ req, actor: caller, action: 'shipping_rate.delete', entityType: 'shipping_rate', entityId: id, before: existing });
      return ok(res, { ok: true });
    }

    let patch;
    try { patch = shippingRateSchema.partial().parse(await readJson(req)); }
    catch (e) { return badReq(res, e.errors?.[0]?.message ?? 'Invalid request'); }
    await ref.update(patch);
    const after = await ref.get();
    await audit({ req, actor: caller, action: 'shipping_rate.update', entityType: 'shipping_rate', entityId: id, before: existing, after: after.data() });
    return ok(res, { rate: toJson(after) });
  } catch (e) {
    return serverError(res, e);
  }
}
