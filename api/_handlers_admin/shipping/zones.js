import { applyCors } from '../../_lib/cors.js';
import { methodGuard, readJson, ok, created, badReq, notFound, serverError } from '../../_lib/response.js';
import { requireRole } from '../../_lib/auth.js';
import { db, FieldValue, toJson } from '../../_lib/firebase.js';
import { shippingZoneSchema } from '../../_lib/schemas.js';
import { audit } from '../../_lib/audit.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (!methodGuard(req, res, ['GET','POST','PATCH','DELETE'])) return;
  const caller = await requireRole(req, res, 'editor');
  if (!caller) return;

  try {
    if (req.method === 'GET') {
      const snap = await db().collection('shippingZones').orderBy('sortOrder').get();
      const items = await Promise.all(snap.docs.map(async z => {
        const ratesSnap = await z.ref.collection('rates').get();
        return { ...toJson(z), rates: ratesSnap.docs.map(r => toJson(r)) };
      }));
      return ok(res, { items });
    }

    if (req.method === 'POST') {
      let body;
      try { body = shippingZoneSchema.parse(await readJson(req)); }
      catch (e) { return badReq(res, e.errors?.[0]?.message ?? 'Invalid request'); }
      const ref = await db().collection('shippingZones').add({
        ...body, createdAt: FieldValue.serverTimestamp(),
      });
      const saved = await ref.get();
      await audit({ req, actor: caller, action: 'shipping_zone.create', entityType: 'shipping_zone', entityId: ref.id, after: body });
      return created(res, { zone: toJson(saved) });
    }

    const id = req.query.id;
    if (!id) return badReq(res, 'id required');
    const ref = db().collection('shippingZones').doc(id);
    const snap = await ref.get();
    if (!snap.exists) return notFound(res);
    const existing = snap.data();

    if (req.method === 'DELETE') {
      // also delete subcollection rates
      const ratesSnap = await ref.collection('rates').get();
      const batch = db().batch();
      ratesSnap.docs.forEach(d => batch.delete(d.ref));
      batch.delete(ref);
      await batch.commit();
      await audit({ req, actor: caller, action: 'shipping_zone.delete', entityType: 'shipping_zone', entityId: id, before: existing });
      return ok(res, { ok: true });
    }

    let patch;
    try { patch = shippingZoneSchema.partial().parse(await readJson(req)); }
    catch (e) { return badReq(res, e.errors?.[0]?.message ?? 'Invalid request'); }
    await ref.update(patch);
    const after = await ref.get();
    await audit({ req, actor: caller, action: 'shipping_zone.update', entityType: 'shipping_zone', entityId: id, before: existing, after: after.data() });
    return ok(res, { zone: toJson(after) });
  } catch (e) {
    return serverError(res, e);
  }
}
