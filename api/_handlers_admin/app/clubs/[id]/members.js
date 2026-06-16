// GET    /api/admin/app/clubs/[id]/members
// PATCH  /api/admin/app/clubs/[id]/members?memberId={uid}  { role: owner|moderator|member|banned }
// DELETE /api/admin/app/clubs/[id]/members?memberId={uid}
import { applyCors } from '../../../../_lib/cors.js';
import { methodGuard, readJson, ok, notFound, badReq, serverError } from '../../../../_lib/response.js';
import { requireRole } from '../../../../_lib/auth.js';
import { db, FieldValue, toJson } from '../../../../_lib/firebase.js';
import { audit } from '../../../../_lib/audit.js';

const ALLOWED_ROLES = new Set(['owner', 'moderator', 'member', 'banned']);

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (!methodGuard(req, res, ['GET','PATCH','DELETE'])) return;
  const caller = await requireRole(req, res, 'editor');
  if (!caller) return;
  const clubId = req.query.id;
  if (!clubId) return badReq(res, 'club id required');

  try {
    const clubRef = db().collection('clubs').doc(clubId);
    if (!(await clubRef.get()).exists) return notFound(res);
    const membersCol = clubRef.collection('members');

    if (req.method === 'GET') {
      const snap = await membersCol.orderBy('joinedAt', 'asc').get().catch(() => membersCol.get());
      return ok(res, { items: snap.docs.map(d => toJson(d)) });
    }

    const memberId = req.query.memberId;
    if (!memberId) return badReq(res, 'memberId required');
    const ref = membersCol.doc(memberId);
    const existing = await ref.get();
    if (!existing.exists) return notFound(res);

    if (req.method === 'DELETE') {
      await ref.delete();
      await clubRef.update({
        memberCount: FieldValue.increment(-1),
        updatedAt: FieldValue.serverTimestamp(),
      });
      await audit({ req, actor: caller, action: 'club_member.remove', entityType: 'club_member', entityId: `${clubId}/${memberId}`, before: existing.data() });
      return ok(res, { ok: true });
    }

    // PATCH — change role (owner/moderator/member/banned)
    const body = await readJson(req);
    if (body.role && !ALLOWED_ROLES.has(body.role)) return badReq(res, 'invalid role');
    await ref.update({ ...body, updatedAt: FieldValue.serverTimestamp() });
    const after = await ref.get();

    // Mirror moderator changes onto the parent club doc so mobile app reads
    // the right ids without paging the subcollection.
    if (body.role) {
      const allMembers = await membersCol.get();
      const moderatorIds = allMembers.docs
        .filter(d => d.data().role === 'moderator')
        .map(d => d.id);
      await clubRef.update({ moderatorIds, updatedAt: FieldValue.serverTimestamp() });
    }

    await audit({ req, actor: caller, action: 'club_member.update', entityType: 'club_member', entityId: `${clubId}/${memberId}`, before: existing.data(), after: after.data() });
    return ok(res, { item: toJson(after) });
  } catch (e) {
    return serverError(res, e);
  }
}
