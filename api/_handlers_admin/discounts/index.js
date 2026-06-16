import { applyCors } from '../../_lib/cors.js';
import { methodGuard, readJson, ok, created, badReq, serverError } from '../../_lib/response.js';
import { requireRole } from '../../_lib/auth.js';
import { db, FieldValue, toJson } from '../../_lib/firebase.js';
import { discountSchema } from '../../_lib/schemas.js';
import { audit } from '../../_lib/audit.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (!methodGuard(req, res, ['GET','POST'])) return;
  const caller = await requireRole(req, res, 'editor');
  if (!caller) return;

  try {
    if (req.method === 'GET') {
      const snap = await db().collection('discountCodes').get();
      return ok(res, { items: snap.docs.map(d => toJson(d)) });
    }

    let body;
    try { body = discountSchema.parse(await readJson(req)); }
    catch (e) { return badReq(res, e.errors?.[0]?.message ?? 'Invalid request'); }
    const code = body.code.toUpperCase();

    const ref = db().collection('discountCodes').doc(code);
    if ((await ref.get()).exists) return badReq(res, 'code already exists');

    await ref.set({
      ...body,
      code,
      usedCount: 0,
      createdAt: FieldValue.serverTimestamp(),
    });
    const saved = await ref.get();
    await audit({ req, actor: caller, action: 'discount.create', entityType: 'discount', entityId: code, after: body });
    return created(res, { discount: toJson(saved) });
  } catch (e) {
    return serverError(res, e);
  }
}
