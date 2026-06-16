import { applyCors } from '../../_lib/cors.js';
import { methodGuard, readJson, ok, badReq, serverError } from '../../_lib/response.js';
import { requireRole } from '../../_lib/auth.js';
import { db, FieldValue, toJson } from '../../_lib/firebase.js';
import { contentBlockSchema } from '../../_lib/schemas.js';
import { audit } from '../../_lib/audit.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (!methodGuard(req, res, ['GET','PUT'])) return;
  const caller = await requireRole(req, res, 'editor');
  if (!caller) return;
  const key = (req.query.key ?? '').toString();
  if (!key) return badReq(res, 'key required');

  try {
    const ref = db().collection('contentBlocks').doc(key);

    if (req.method === 'GET') {
      const snap = await ref.get();
      return ok(res, { block: snap.exists ? toJson(snap) : null });
    }

    let body;
    try { body = contentBlockSchema.parse(await readJson(req)); }
    catch (e) { return badReq(res, e.errors?.[0]?.message ?? 'Invalid request'); }

    const before = (await ref.get()).data() ?? null;
    await ref.set({
      value: body.value,
      updatedBy: caller.user.uid,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    const after = await ref.get();
    await audit({ req, actor: caller, action: 'content.update', entityType: 'content_block', entityId: key, before, after: after.data() });
    return ok(res, { block: toJson(after) });
  } catch (e) {
    return serverError(res, e);
  }
}
