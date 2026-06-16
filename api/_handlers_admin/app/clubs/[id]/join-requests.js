// GET    /api/admin/app/clubs/[id]/join-requests
// POST   /api/admin/app/clubs/[id]/join-requests?requestId={uid}&action=approve|deny
import { applyCors } from '../../../../_lib/cors.js';
import { methodGuard, ok, notFound, badReq, serverError } from '../../../../_lib/response.js';
import { requireRole } from '../../../../_lib/auth.js';
import { db, FieldValue, toJson } from '../../../../_lib/firebase.js';
import { audit } from '../../../../_lib/audit.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (!methodGuard(req, res, ['GET','POST'])) return;
  const caller = await requireRole(req, res, 'editor');
  if (!caller) return;
  const clubId = req.query.id;
  if (!clubId) return badReq(res, 'club id required');

  try {
    const clubRef = db().collection('clubs').doc(clubId);
    if (!(await clubRef.get()).exists) return notFound(res);
    const reqsCol = clubRef.collection('joinRequests');

    if (req.method === 'GET') {
      const snap = await reqsCol.get();
      return ok(res, { items: snap.docs.map(d => toJson(d)) });
    }

    const requestId = req.query.requestId;
    const action = req.query.action;
    if (!requestId) return badReq(res, 'requestId required');
    if (!['approve','deny'].includes(action)) return badReq(res, 'action must be approve | deny');

    const ref = reqsCol.doc(requestId);
    const snap = await ref.get();
    if (!snap.exists) return notFound(res);

    if (action === 'approve') {
      await clubRef.collection('members').doc(requestId).set({
        userId: requestId,
        role: 'member',
        joinedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
      await clubRef.update({
        memberCount: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
    await ref.delete();

    await audit({
      req, actor: caller,
      action: `club_join_request.${action}`,
      entityType: 'club_join_request',
      entityId: `${clubId}/${requestId}`,
      before: snap.data(),
    });
    return ok(res, { ok: true, action });
  } catch (e) {
    return serverError(res, e);
  }
}
