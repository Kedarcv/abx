import { applyCors } from '../../_lib/cors.js';
import { methodGuard, readJson, ok, badReq, notFound, serverError } from '../../_lib/response.js';
import { requireRole } from '../../_lib/auth.js';
import { db, toJson } from '../../_lib/firebase.js';
import { deleteObject } from '../../_lib/r2.js';
import { audit } from '../../_lib/audit.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (!methodGuard(req, res, ['PATCH','DELETE'])) return;
  const caller = await requireRole(req, res, 'editor');
  if (!caller) return;

  const id = req.query.id;
  if (!id) return badReq(res, 'id required');

  try {
    const ref = db().collection('mediaAssets').doc(id);
    const snap = await ref.get();
    if (!snap.exists) return notFound(res);
    const existing = snap.data();

    if (req.method === 'PATCH') {
      const body = await readJson(req);
      await ref.update({ alt: body.alt ?? existing.alt });
      const after = await ref.get();
      await audit({ req, actor: caller, action: 'media.update', entityType: 'media_asset', entityId: id, before: existing, after: after.data() });
      return ok(res, { asset: toJson(after) });
    }

    // DELETE — check references on product_images across all products
    const refs = await db().collectionGroup('images').where('mediaId', '==', id).limit(1).get();
    if (!refs.empty) return badReq(res, 'asset is in use by products');

    await deleteObject(existing.key, req).catch(e => console.warn('[r2 delete]', e));
    await ref.delete();
    await audit({ req, actor: caller, action: 'media.delete', entityType: 'media_asset', entityId: id, before: existing });
    return ok(res, { ok: true });
  } catch (e) {
    return serverError(res, e);
  }
}
