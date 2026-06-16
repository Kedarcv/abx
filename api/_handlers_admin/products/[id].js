import { applyCors } from '../../_lib/cors.js';
import { methodGuard, readJson, ok, notFound, badReq, serverError } from '../../_lib/response.js';
import { requireRole } from '../../_lib/auth.js';
import { db, FieldValue, toJson } from '../../_lib/firebase.js';
import { productUpdateSchema } from '../../_lib/schemas.js';
import { audit } from '../../_lib/audit.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (!methodGuard(req, res, ['GET','PATCH','DELETE'])) return;
  const caller = await requireRole(req, res, 'editor');
  if (!caller) return;

  const id = req.query.id;
  if (!id) return badReq(res, 'id required');

  try {
    const ref = db().collection('products').doc(id);
    const snap = await ref.get();
    if (!snap.exists) return notFound(res);
    const existing = snap.data();

    if (req.method === 'GET') {
      const variantsSnap = await ref.collection('variants').get();
      const imagesSnap = await ref.collection('images').orderBy('sortOrder').get();
      return ok(res, {
        product: {
          ...toJson(snap),
          variants: variantsSnap.docs.map(v => toJson(v)),
          images: imagesSnap.docs.map(i => toJson(i)),
        },
      });
    }

    if (req.method === 'PATCH') {
      let patch;
      try { patch = productUpdateSchema.parse(await readJson(req)); }
      catch (e) { return badReq(res, e.errors?.[0]?.message ?? 'Invalid request'); }
      await ref.update({ ...patch, updatedAt: FieldValue.serverTimestamp() });
      const after = await ref.get();
      await audit({ req, actor: caller, action: 'product.update', entityType: 'product', entityId: id, before: existing, after: after.data() });
      return ok(res, { product: toJson(after) });
    }

    // DELETE — soft archive (active=false). Hard delete only with ?hard=1 + admin role.
    if (req.query.hard === '1') {
      if (caller.profile.role !== 'admin' && caller.profile.role !== 'superAdmin') {
        return badReq(res, 'hard delete requires admin');
      }
      // Delete variants + images subcollections
      const subBatch = db().batch();
      const [vSnap, iSnap] = await Promise.all([
        ref.collection('variants').get(),
        ref.collection('images').get(),
      ]);
      vSnap.docs.forEach(d => subBatch.delete(d.ref));
      iSnap.docs.forEach(d => subBatch.delete(d.ref));
      await subBatch.commit();
      await ref.delete();
      await audit({ req, actor: caller, action: 'product.delete_hard', entityType: 'product', entityId: id, before: existing });
      return ok(res, { ok: true, hard: true });
    }

    await ref.update({ active: false, updatedAt: FieldValue.serverTimestamp() });
    const after = await ref.get();
    await audit({ req, actor: caller, action: 'product.archive', entityType: 'product', entityId: id, before: existing, after: after.data() });
    return ok(res, { product: toJson(after) });
  } catch (e) {
    return serverError(res, e);
  }
}
