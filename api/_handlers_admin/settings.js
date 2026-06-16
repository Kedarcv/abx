import { applyCors } from '../_lib/cors.js';
import { methodGuard, readJson, ok, badReq, serverError } from '../_lib/response.js';
import { requireRole } from '../_lib/auth.js';
import { db, FieldValue, toJson } from '../_lib/firebase.js';
import { settingsUpdateSchema } from '../_lib/schemas.js';
import { audit } from '../_lib/audit.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (!methodGuard(req, res, ['GET','PATCH'])) return;
  const caller = await requireRole(req, res, req.method === 'GET' ? 'editor' : 'admin');
  if (!caller) return;

  try {
    const ref = db().collection('storeSettings').doc('global');

    if (req.method === 'GET') {
      const snap = await ref.get();
      return ok(res, { settings: snap.exists ? toJson(snap) : { id: 'global' } });
    }

    let patch;
    try { patch = settingsUpdateSchema.parse(await readJson(req)); }
    catch (e) { return badReq(res, e.errors?.[0]?.message ?? 'Invalid request'); }
    if (!Object.keys(patch).length) return badReq(res, 'no fields to update');

    const before = (await ref.get()).data() ?? {};
    await ref.set({
      ...patch,
      updatedBy: caller.user.uid,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    const after = await ref.get();
    await audit({ req, actor: caller, action: 'settings.update', entityType: 'settings', entityId: 'global', before, after: after.data() });
    return ok(res, { settings: toJson(after) });
  } catch (e) {
    return serverError(res, e);
  }
}
