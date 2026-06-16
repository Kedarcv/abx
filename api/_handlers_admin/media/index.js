// POST /api/admin/media       — confirm an upload that already happened
//                               via the tyw-upload-image Worker.
// GET  /api/admin/media       — list recent media assets.
//
// Note: the actual byte upload is done from the browser directly to
//   https://tyw-upload-image.r245142r.workers.dev/upload
// using the same Firebase ID token. The Worker writes to R2 and returns
// { url, key }. We then call this endpoint to record metadata in
// /mediaAssets so it can be picked from the media library.
import { applyCors } from '../../_lib/cors.js';
import { methodGuard, readJson, badReq, ok, created, serverError } from '../../_lib/response.js';
import { requireRole } from '../../_lib/auth.js';
import { db, FieldValue, toJson } from '../../_lib/firebase.js';
import { mediaCreateSchema } from '../../_lib/schemas.js';
import { audit } from '../../_lib/audit.js';
import { assertSafeKey, publicUrl } from '../../_lib/r2.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (!methodGuard(req, res, ['GET','POST'])) return;
  const caller = await requireRole(req, res, 'editor');
  if (!caller) return;

  try {
    if (req.method === 'GET') {
      const limit = Math.min(parseInt(req.query.limit || '50', 10), 200);
      const snap = await db().collection('mediaAssets')
        .orderBy('createdAt', 'desc').limit(limit).get();
      return ok(res, { items: snap.docs.map(d => toJson(d)) });
    }

    let body;
    try { body = mediaCreateSchema.parse(await readJson(req)); }
    catch (e) { return badReq(res, e.errors?.[0]?.message ?? 'Invalid request'); }

    // Sanity-check the key shape. We trust the Worker upload to have
    // actually written the object — confirm via the workerUrl returned
    // from the upload response.
    try { assertSafeKey(body.key); }
    catch (e) { return badReq(res, e.message); }

    const doc = {
      bucket: 'ABX-Motion-uploads',
      key: body.key,
      url: body.workerUrl ?? publicUrl(body.key),
      mime: body.mime,
      sizeBytes: body.sizeBytes,
      width: body.width ?? null,
      height: body.height ?? null,
      alt: body.alt ?? null,
      checksum: body.checksum ?? null,
      uploadedBy: caller.user.uid,
      createdAt: FieldValue.serverTimestamp(),
    };
    const ref = await db().collection('mediaAssets').add(doc);
    const saved = await ref.get();
    await audit({ req, actor: caller, action: 'media.create', entityType: 'media_asset', entityId: ref.id, after: doc });
    return created(res, { asset: toJson(saved) });
  } catch (e) {
    return serverError(res, e);
  }
}
