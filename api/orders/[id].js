import { applyCors } from '../_lib/cors.js';
import { methodGuard, ok, notFound, serverError, badReq } from '../_lib/response.js';
import { getCaller, hasRole } from '../_lib/auth.js';
import { db, toJson } from '../_lib/firebase.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (!methodGuard(req, res, ['GET'])) return;

  const id = req.query.id;
  if (!id) return badReq(res, 'id required');

  try {
    const caller = await getCaller(req);
    const ref = db().collection('storeOrders').doc(id);
    const snap = await ref.get();
    if (!snap.exists) return notFound(res);
    const order = snap.data();

    const sessionId = req.query.session_id;
    const isOwner = caller?.user?.uid && order.customerId === caller.user.uid;
    const isStaff = caller && (hasRole(caller.profile, 'fulfillment') || hasRole(caller.profile, 'admin'));
    const isSessionMatch = sessionId && order.stripeSessionId === sessionId;

    if (!isOwner && !isStaff && !isSessionMatch) return notFound(res);

    const itemsSnap = await ref.collection('items').get();
    const items = itemsSnap.docs.map(d => toJson(d));
    return ok(res, { order: { id, ...order, items } });
  } catch (e) {
    return serverError(res, e);
  }
}
