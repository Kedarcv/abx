// View full user dossier across the app's per-uid subcollections.
import { applyCors } from '../../../_lib/cors.js';
import { methodGuard, ok, notFound, badReq, serverError } from '../../../_lib/response.js';
import { requireRole } from '../../../_lib/auth.js';
import { db, toJson } from '../../../_lib/firebase.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (!methodGuard(req, res, ['GET'])) return;
  const caller = await requireRole(req, res, 'admin');
  if (!caller) return;
  const id = req.query.id;
  if (!id) return badReq(res, 'id required');

  try {
    const userSnap = await db().collection('users').doc(id).get();
    if (!userSnap.exists) return notFound(res);

    const [xpSnap, walletSnap, runsSnap, ordersSnap, storeOrdersSnap] = await Promise.all([
      db().collection('userXp').doc(id).get(),
      db().collection('xt_wallets').doc(id).get(),
      db().collection('users').doc(id).collection('runs').orderBy('createdAt','desc').limit(20).get(),
      db().collection('users').doc(id).collection('orders').orderBy('createdAt','desc').limit(20).get(),
      db().collection('storeOrders').where('customerId','==',id).orderBy('createdAt','desc').limit(20).get(),
    ]);

    return ok(res, {
      user: toJson(userSnap),
      xp: xpSnap.exists ? toJson(xpSnap) : null,
      wallet: walletSnap.exists ? toJson(walletSnap) : null,
      runs: runsSnap.docs.map(d => toJson(d)),
      appOrders: ordersSnap.docs.map(d => toJson(d)),
      storeOrders: storeOrdersSnap.docs.map(d => toJson(d)),
    });
  } catch (e) {
    return serverError(res, e);
  }
}
