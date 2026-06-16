import { applyCors } from '../../_lib/cors.js';
import { methodGuard, readJson, ok, created, badReq, serverError } from '../../_lib/response.js';
import { requireRole } from '../../_lib/auth.js';
import { db, FieldValue, toJson } from '../../_lib/firebase.js';
import { collectionSchema } from '../../_lib/schemas.js';
import { audit } from '../../_lib/audit.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (!methodGuard(req, res, ['GET','POST'])) return;
  const caller = await requireRole(req, res, 'editor');
  if (!caller) return;

  try {
    if (req.method === 'GET') {
      const snap = await db().collection('storeCollections').orderBy('sortOrder').get();
      return ok(res, { items: snap.docs.map(d => toJson(d)) });
    }

    let body;
    try { body = collectionSchema.parse(await readJson(req)); }
    catch (e) { return badReq(res, e.errors?.[0]?.message ?? 'Invalid request'); }

    const dup = await db().collection('storeCollections').where('slug', '==', body.slug).limit(1).get();
    if (!dup.empty) return badReq(res, 'slug already in use');

    const ref = await db().collection('storeCollections').add({
      ...body,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    const saved = await ref.get();
    await audit({ req, actor: caller, action: 'collection.create', entityType: 'collection', entityId: ref.id, after: body });
    return created(res, { collection: toJson(saved) });
  } catch (e) {
    return serverError(res, e);
  }
}
