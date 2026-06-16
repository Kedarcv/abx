import { applyCors } from '../../_lib/cors.js';
import { methodGuard, readJson, badReq, ok, created, serverError } from '../../_lib/response.js';
import { requireRole } from '../../_lib/auth.js';
import { db, FieldValue, toJson } from '../../_lib/firebase.js';
import { productCreateSchema } from '../../_lib/schemas.js';
import { audit } from '../../_lib/audit.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (!methodGuard(req, res, ['GET','POST'])) return;
  const caller = await requireRole(req, res, 'editor');
  if (!caller) return;

  try {
    if (req.method === 'GET') {
      const limit = Math.min(parseInt(req.query.limit || '100', 10), 500);
      // Try ordering by sortOrder; fall back to an unordered list so docs
      // missing the field still show up in the admin.
      let snap;
      try {
        snap = await db().collection('products')
          .orderBy('sortOrder', 'asc').limit(limit).get();
        if (snap.empty) {
          snap = await db().collection('products').limit(limit).get();
        }
      } catch {
        snap = await db().collection('products').limit(limit).get();
      }
      const items = await Promise.all(snap.docs.map(async d => {
        const variantsSnap = await d.ref.collection('variants').get();
        const imagesSnap = await d.ref.collection('images').orderBy('sortOrder').get();
        return {
          ...toJson(d),
          variants: variantsSnap.docs.map(v => toJson(v)),
          images: imagesSnap.docs.map(i => toJson(i)),
        };
      }));
      return ok(res, { items });
    }

    let body;
    try { body = productCreateSchema.parse(await readJson(req)); }
    catch (e) { return badReq(res, e.errors?.[0]?.message ?? 'Invalid request'); }

    // Slug uniqueness
    const dup = await db().collection('products').where('slug', '==', body.slug).limit(1).get();
    if (!dup.empty) return badReq(res, 'slug already in use');

    const doc = {
      ...body,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    const ref = await db().collection('products').add(doc);
    const saved = await ref.get();
    await audit({ req, actor: caller, action: 'product.create', entityType: 'product', entityId: ref.id, after: doc });
    return created(res, { product: toJson(saved) });
  } catch (e) {
    return serverError(res, e);
  }
}
