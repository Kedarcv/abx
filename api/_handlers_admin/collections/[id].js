import { applyCors } from '../../_lib/cors.js';
import { methodGuard, readJson, ok, notFound, badReq, serverError } from '../../_lib/response.js';
import { requireRole } from '../../_lib/auth.js';
import { db, FieldValue, toJson } from '../../_lib/firebase.js';
import { collectionSchema } from '../../_lib/schemas.js';
import { audit } from '../../_lib/audit.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (!methodGuard(req, res, ['PATCH','DELETE'])) return;
  const caller = await requireRole(req, res, 'editor');
  if (!caller) return;
  const id = req.query.id;
  if (!id) return badReq(res, 'id required');

  try {
    const ref = db().collection('storeCollections').doc(id);
    const snap = await ref.get();
    if (!snap.exists) return notFound(res);
    const existing = snap.data();

    if (req.method === 'DELETE') {
      await ref.update({ active: false, updatedAt: FieldValue.serverTimestamp() });
      const after = await ref.get();
      await audit({ req, actor: caller, action: 'collection.archive', entityType: 'collection', entityId: id, before: existing, after: after.data() });
      return ok(res, { collection: toJson(after) });
    }

    let patch;
    try { patch = collectionSchema.partial().parse(await readJson(req)); }
    catch (e) { return badReq(res, e.errors?.[0]?.message ?? 'Invalid request'); }
    await ref.update({ ...patch, updatedAt: FieldValue.serverTimestamp() });
    const after = await ref.get();
    await audit({ req, actor: caller, action: 'collection.update', entityType: 'collection', entityId: id, before: existing, after: after.data() });
    return ok(res, { collection: toJson(after) });
  } catch (e) {
    return serverError(res, e);
  }
}
