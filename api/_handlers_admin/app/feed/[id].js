// Feed moderation: DELETE removes a feed post (and its comments).
import { applyCors } from '../../../_lib/cors.js';
import { methodGuard, ok, notFound, badReq, serverError } from '../../../_lib/response.js';
import { requireRole } from '../../../_lib/auth.js';
import { db } from '../../../_lib/firebase.js';
import { audit } from '../../../_lib/audit.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (!methodGuard(req, res, ['DELETE'])) return;
  const caller = await requireRole(req, res, 'editor');
  if (!caller) return;
  const id = req.query.id;
  if (!id) return badReq(res, 'id required');

  try {
    const ref = db().collection('feed').doc(id);
    const snap = await ref.get();
    if (!snap.exists) return notFound(res);
    const existing = snap.data();

    // Delete comments subcollection
    const comments = await ref.collection('comments').get();
    const batch = db().batch();
    comments.docs.forEach(c => batch.delete(c.ref));
    batch.delete(ref);
    await batch.commit();

    await audit({ req, actor: caller, action: 'feed.delete', entityType: 'feed_post', entityId: id, before: existing });
    return ok(res, { ok: true });
  } catch (e) {
    return serverError(res, e);
  }
}
