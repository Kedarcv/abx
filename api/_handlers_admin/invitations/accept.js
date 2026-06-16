import { applyCors } from '../../_lib/cors.js';
import { methodGuard, readJson, ok, badReq, serverError } from '../../_lib/response.js';
import { getCaller } from '../../_lib/auth.js';
import { authAdmin, db, FieldValue } from '../../_lib/firebase.js';
import { audit } from '../../_lib/audit.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (!methodGuard(req, res, ['POST'])) return;
  const caller = await getCaller(req);
  if (!caller) return res.status(401).json({ error: 'sign in first' });

  const { token } = await readJson(req);
  if (!token) return badReq(res, 'token required');

  try {
    const snap = await db().collection('invitations').where('token', '==', token).limit(1).get();
    if (snap.empty) return badReq(res, 'invalid token');
    const ref = snap.docs[0].ref;
    const inv = snap.docs[0].data();
    if (inv.acceptedAt) return badReq(res, 'already accepted');
    if (new Date(inv.expiresAt) < new Date()) return badReq(res, 'token expired');
    if (inv.email.toLowerCase() !== (caller.user.email ?? '').toLowerCase()) {
      return badReq(res, 'token does not match this account');
    }

    // Set both the Firestore profile field AND the Firebase custom claim
    await db().collection('users').doc(caller.user.uid).set({
      role: inv.role,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    await authAdmin().setCustomUserClaims(caller.user.uid, { role: inv.role });
    await ref.update({ acceptedAt: FieldValue.serverTimestamp(), acceptedBy: caller.user.uid });

    await audit({ req, actor: caller, action: 'invitation.accept', entityType: 'invitation', entityId: ref.id, after: { role: inv.role } });
    return ok(res, { ok: true, role: inv.role });
  } catch (e) {
    return serverError(res, e);
  }
}
