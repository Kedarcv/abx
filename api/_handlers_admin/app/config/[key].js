// /config/{key} — app-level feature flags + settings shared with mobile app
import { applyCors } from '../../../_lib/cors.js';
import { methodGuard, readJson, ok, badReq, serverError } from '../../../_lib/response.js';
import { requireRole } from '../../../_lib/auth.js';
import { db, FieldValue, toJson } from '../../../_lib/firebase.js';
import { audit } from '../../../_lib/audit.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (!methodGuard(req, res, ['GET','PUT'])) return;
  const caller = await requireRole(req, res, req.method === 'GET' ? 'editor' : 'admin');
  if (!caller) return;
  const key = (req.query.key ?? '').toString();
  if (!key || key.length > 80) return badReq(res, 'key required');

  try {
    const ref = db().collection('config').doc(key);

    if (req.method === 'GET') {
      const snap = await ref.get();
      return ok(res, { config: snap.exists ? toJson(snap) : null });
    }

    const body = await readJson(req);
    const before = (await ref.get()).data() ?? null;
    await ref.set({
      ...body,
      updatedBy: caller.user.uid,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    const after = await ref.get();
    await audit({ req, actor: caller, action: 'app_config.update', entityType: 'app_config', entityId: key, before, after: after.data() });
    return ok(res, { config: toJson(after) });
  } catch (e) {
    return serverError(res, e);
  }
}
