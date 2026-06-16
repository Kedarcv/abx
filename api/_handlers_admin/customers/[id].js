import { applyCors } from '../../_lib/cors.js';
import { methodGuard, readJson, ok, notFound, badReq, serverError } from '../../_lib/response.js';
import { requireRole } from '../../_lib/auth.js';
import { authAdmin, db, FieldValue, toJson } from '../../_lib/firebase.js';
import { customerPatchSchema } from '../../_lib/schemas.js';
import { audit } from '../../_lib/audit.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (!methodGuard(req, res, ['GET','PATCH'])) return;
  const caller = await requireRole(req, res, 'admin');
  if (!caller) return;
  const id = req.query.id;
  if (!id) return badReq(res, 'id required');

  try {
    const ref = db().collection('users').doc(id);
    const snap = await ref.get();

    if (req.method === 'GET') {
      if (!snap.exists) return notFound(res);
      return ok(res, { user: toJson(snap) });
    }

    let patch;
    try { patch = customerPatchSchema.parse(await readJson(req)); }
    catch (e) { return badReq(res, e.errors?.[0]?.message ?? 'Invalid request'); }

    const existing = snap.exists ? snap.data() : null;
    await ref.set({ ...patch, updatedAt: FieldValue.serverTimestamp() }, { merge: true });

    // If role changed, mirror it onto the Firebase custom claim so both
    // web and the mobile app pick it up on next token refresh.
    if (patch.role) {
      try { await authAdmin().setCustomUserClaims(id, { role: patch.role }); }
      catch (e) { console.warn('[setCustomUserClaims]', e); }
    }
    if (patch.isBlocked !== undefined) {
      try { await authAdmin().updateUser(id, { disabled: !!patch.isBlocked }); }
      catch (e) { console.warn('[updateUser disable]', e); }
    }

    const after = await ref.get();
    await audit({ req, actor: caller, action: 'profile.update', entityType: 'profile', entityId: id, before: existing, after: after.data() });
    return ok(res, { user: toJson(after) });
  } catch (e) {
    return serverError(res, e);
  }
}
