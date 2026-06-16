// /orders — delivery orders for ABX-Motion (NOT storefront orders).
// Storefront orders live under /storeOrders.
import { applyCors } from '../../../_lib/cors.js';
import { methodGuard, ok, serverError } from '../../../_lib/response.js';
import { requireRole } from '../../../_lib/auth.js';
import { db, toJson } from '../../../_lib/firebase.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (!methodGuard(req, res, ['GET'])) return;
  const caller = await requireRole(req, res, 'fulfillment');
  if (!caller) return;

  try {
    const limit = Math.min(parseInt(req.query.limit || '50', 10), 200);
    const restaurantId = req.query.restaurantId;
    const status = req.query.status;
    let q = db().collection('orders');
    if (restaurantId) q = q.where('restaurantId', '==', restaurantId);
    if (status)       q = q.where('status', '==', status);
    q = q.orderBy('createdAt', 'desc').limit(limit);
    const snap = await q.get();
    return ok(res, { items: snap.docs.map(d => toJson(d)) });
  } catch (e) {
    return serverError(res, e);
  }
}
