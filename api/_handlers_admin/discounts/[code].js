import { applyCors } from '../../_lib/cors.js';
import { methodGuard, readJson, ok, notFound, badReq, serverError } from '../../_lib/response.js';
import { requireRole } from '../../_lib/auth.js';
import { db, toJson } from '../../_lib/firebase.js';
import { discountSchema } from '../../_lib/schemas.js';
import { audit } from '../../_lib/audit.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (!methodGuard(req, res, ['PATCH','DELETE'])) return;
  const caller = await requireRole(req, res, 'editor');
  if (!caller) return;
  const code = (req.query.code ?? '').toString().toUpperCase();
  if (!code) return badReq(res, 'code required');

  try {
    const ref = db().collection('discountCodes').doc(code);
    const snap = await ref.get();
    if (!snap.exists) return notFound(res);
    const existing = snap.data();

    if (req.method === 'DELETE') {
      await ref.update({ active: false });
      const after = await ref.get();
      await audit({ req, actor: caller, action: 'discount.archive', entityType: 'discount', entityId: code, before: existing, after: after.data() });
      return ok(res, { discount: toJson(after) });
    }

    let patch;
    try { patch = discountSchema.partial().parse(await readJson(req)); }
    catch (e) { return badReq(res, e.errors?.[0]?.message ?? 'Invalid request'); }
    await ref.update(patch);
    const after = await ref.get();
    await audit({ req, actor: caller, action: 'discount.update', entityType: 'discount', entityId: code, before: existing, after: after.data() });
    return ok(res, { discount: toJson(after) });
  } catch (e) {
    return serverError(res, e);
  }
}
