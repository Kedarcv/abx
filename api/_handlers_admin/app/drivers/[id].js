import { applyCors } from '../../../_lib/cors.js';
import { methodGuard, readJson, ok, notFound, badReq, serverError } from '../../../_lib/response.js';
import { requireRole } from '../../../_lib/auth.js';
import { authAdmin, db, FieldValue, toJson } from '../../../_lib/firebase.js';
import { audit } from '../../../_lib/audit.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (!methodGuard(req, res, ['GET','PATCH'])) return;
  const caller = await requireRole(req, res, 'admin');
  if (!caller) return;
  const id = req.query.id;
  if (!id) return badReq(res, 'id required');

  try {
    const ref = db().collection('driver_profiles').doc(id);
    const snap = await ref.get();
    if (!snap.exists) return notFound(res);
    const existing = snap.data();

    if (req.method === 'GET') {
      const [statsSnap, locSnap] = await Promise.all([
        db().collection('driver_stats').doc(id).get(),
        db().collection('driver_locations').doc(id).get(),
      ]);
      return ok(res, {
        driver: toJson(snap),
        stats:  statsSnap.exists ? toJson(statsSnap) : null,
        location: locSnap.exists ? toJson(locSnap) : null,
      });
    }

    const body = await readJson(req);
    await ref.update({ ...body, updatedAt: FieldValue.serverTimestamp() });
    if (body.approved === true || body.approved === false) {
      try { await authAdmin().setCustomUserClaims(id, { role: 'driver', approved: !!body.approved }); }
      catch (e) { console.warn('[driver claim]', e); }
    }
    if (body.banned !== undefined) {
      try { await authAdmin().updateUser(id, { disabled: !!body.banned }); }
      catch (e) { console.warn('[driver disable]', e); }
    }
    const after = await ref.get();
    await audit({ req, actor: caller, action: 'driver.update', entityType: 'driver', entityId: id, before: existing, after: after.data() });
    return ok(res, { driver: toJson(after) });
  } catch (e) {
    return serverError(res, e);
  }
}
