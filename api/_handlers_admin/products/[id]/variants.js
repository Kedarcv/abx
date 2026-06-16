// POST /api/admin/products/[id]/variants — create a variant
import { applyCors } from '../../../_lib/cors.js';
import { methodGuard, readJson, badReq, created, serverError } from '../../../_lib/response.js';
import { requireRole } from '../../../_lib/auth.js';
import { db, FieldValue, toJson } from '../../../_lib/firebase.js';
import { variantSchema } from '../../../_lib/schemas.js';
import { audit } from '../../../_lib/audit.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (!methodGuard(req, res, ['POST'])) return;
  const caller = await requireRole(req, res, 'editor');
  if (!caller) return;
  const productId = req.query.id;
  if (!productId) return badReq(res, 'product id required');

  let body;
  try { body = variantSchema.parse(await readJson(req)); }
  catch (e) { return badReq(res, e.errors?.[0]?.message ?? 'Invalid request'); }

  try {
    const productRef = db().collection('products').doc(productId);
    const productSnap = await productRef.get();
    if (!productSnap.exists) return badReq(res, 'product not found');

    const ref = await productRef.collection('variants').add({
      ...body,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    const saved = await ref.get();
    await audit({ req, actor: caller, action: 'variant.create', entityType: 'variant', entityId: ref.id, after: body });
    return created(res, { variant: toJson(saved) });
  } catch (e) {
    return serverError(res, e);
  }
}
