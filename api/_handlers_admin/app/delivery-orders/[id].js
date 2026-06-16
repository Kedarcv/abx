import { applyCors } from '../../../_lib/cors.js';
import { methodGuard, readJson, ok, notFound, badReq, serverError } from '../../../_lib/response.js';
import { requireRole } from '../../../_lib/auth.js';
import { db, FieldValue, toJson } from '../../../_lib/firebase.js';
import { audit } from '../../../_lib/audit.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (!methodGuard(req, res, ['GET','PATCH'])) return;
  const caller = await requireRole(req, res, 'fulfillment');
  if (!caller) return;
  const id = req.query.id;
  if (!id) return badReq(res, 'id required');

  try {
    const ref = db().collection('orders').doc(id);
    const snap = await ref.get();
    if (!snap.exists) return notFound(res);
    const existing = snap.data();

    if (req.method === 'GET') {
      const statusSnap = await ref.collection('status_updates').orderBy('at','desc').limit(50).get();
      return ok(res, {
        order: { ...toJson(snap), statusUpdates: statusSnap.docs.map(d => toJson(d)) },
      });
    }

    const body = await readJson(req);
    if (!body || typeof body !== 'object') return badReq(res, 'object body required');
    await ref.update({ ...body, updatedAt: FieldValue.serverTimestamp() });
    if (body.status) {
      await ref.collection('status_updates').add({
        status: body.status,
        actorId: caller.user.uid,
        at: FieldValue.serverTimestamp(),
      });
    }
    const after = await ref.get();
    await audit({ req, actor: caller, action: 'delivery_order.update', entityType: 'delivery_order', entityId: id, before: existing, after: after.data() });
    return ok(res, { order: toJson(after) });
  } catch (e) {
    return serverError(res, e);
  }
}
