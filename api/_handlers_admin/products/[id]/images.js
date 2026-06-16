// POST   /api/admin/products/[id]/images          — attach a media asset
// DELETE /api/admin/products/[id]/images?imageId= — remove an attachment
import { applyCors } from '../../../_lib/cors.js';
import { methodGuard, readJson, ok, created, badReq, serverError } from '../../../_lib/response.js';
import { requireRole } from '../../../_lib/auth.js';
import { db, FieldValue, toJson } from '../../../_lib/firebase.js';
import { productImageSchema } from '../../../_lib/schemas.js';
import { audit } from '../../../_lib/audit.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (!methodGuard(req, res, ['POST','DELETE'])) return;
  const caller = await requireRole(req, res, 'editor');
  if (!caller) return;

  const productId = req.query.id;
  if (!productId) return badReq(res, 'product id required');

  try {
    const productRef = db().collection('products').doc(productId);
    const snap = await productRef.get();
    if (!snap.exists) return badReq(res, 'product not found');

    if (req.method === 'DELETE') {
      const imageId = req.query.imageId;
      if (!imageId) return badReq(res, 'imageId required');
      const ref = productRef.collection('images').doc(imageId);
      const existing = await ref.get();
      if (!existing.exists) return badReq(res, 'image not found');
      await ref.delete();
      await audit({ req, actor: caller, action: 'product_image.delete', entityType: 'product_image', entityId: imageId, before: existing.data() });
      return ok(res, { ok: true });
    }

    let body;
    try { body = productImageSchema.parse(await readJson(req)); }
    catch (e) { return badReq(res, e.errors?.[0]?.message ?? 'Invalid request'); }

    const ref = await productRef.collection('images').add({
      ...body,
      createdAt: FieldValue.serverTimestamp(),
    });
    const saved = await ref.get();
    await audit({ req, actor: caller, action: 'product_image.create', entityType: 'product_image', entityId: ref.id, after: body });
    return created(res, { image: toJson(saved) });
  } catch (e) {
    return serverError(res, e);
  }
}
