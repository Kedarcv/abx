import { applyCors } from '../../../../_lib/cors.js';
import { methodGuard, readJson, ok, notFound, badReq, serverError } from '../../../../_lib/response.js';
import { requireRole } from '../../../../_lib/auth.js';
import { db, FieldValue, toJson } from '../../../../_lib/firebase.js';
import { variantSchema } from '../../../../_lib/schemas.js';
import { audit } from '../../../../_lib/audit.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (!methodGuard(req, res, ['PATCH','DELETE'])) return;
  const caller = await requireRole(req, res, 'editor');
  if (!caller) return;

  const productId = req.query.id;
  const variantId = req.query.variantId;
  if (!productId || !variantId) return badReq(res, 'ids required');

  try {
    const ref = db().collection('products').doc(productId).collection('variants').doc(variantId);
    const snap = await ref.get();
    if (!snap.exists) return notFound(res);
    const existing = snap.data();

    if (req.method === 'DELETE') {
      await ref.update({ active: false, updatedAt: FieldValue.serverTimestamp() });
      const after = await ref.get();
      await audit({ req, actor: caller, action: 'variant.archive', entityType: 'variant', entityId: variantId, before: existing, after: after.data() });
      return ok(res, { variant: toJson(after) });
    }

    let patch;
    try { patch = variantSchema.partial().parse(await readJson(req)); }
    catch (e) { return badReq(res, e.errors?.[0]?.message ?? 'Invalid request'); }

    const oldStock = existing.stock ?? 0;
    await ref.update({ ...patch, updatedAt: FieldValue.serverTimestamp() });

    if (patch.stock !== undefined && patch.stock !== oldStock) {
      await db().collection('inventoryMovements').add({
        productId, variantId,
        delta: patch.stock - oldStock,
        reason: 'manual',
        actorId: caller.user.uid,
        at: FieldValue.serverTimestamp(),
      });
    }

    const after = await ref.get();
    await audit({ req, actor: caller, action: 'variant.update', entityType: 'variant', entityId: variantId, before: existing, after: after.data() });
    return ok(res, { variant: toJson(after) });
  } catch (e) {
    return serverError(res, e);
  }
}
