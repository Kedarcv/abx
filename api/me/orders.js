import { applyCors } from '../_lib/cors.js';
import { methodGuard, ok, unauth, serverError } from '../_lib/response.js';
import { getCaller } from '../_lib/auth.js';
import { db, toJson } from '../_lib/firebase.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (!methodGuard(req, res, ['GET'])) return;

  const caller = await getCaller(req);
  if (!caller) return unauth(res);

  try {
    const snap = await db().collection('storeOrders')
      .where('customerId', '==', caller.user.uid)
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();
    const orders = snap.docs.map(d => toJson(d));
    return ok(res, { orders });
  } catch (e) {
    return serverError(res, e);
  }
}
