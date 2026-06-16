// GET /api/admin/stats — KPIs for the admin dashboard.
import { applyCors } from '../_lib/cors.js';
import { methodGuard, ok, serverError } from '../_lib/response.js';
import { requireRole } from '../_lib/auth.js';
import { db, toJson } from '../_lib/firebase.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (!methodGuard(req, res, ['GET'])) return;
  const caller = await requireRole(req, res, 'fulfillment');
  if (!caller) return;

  try {
    const admin = db();

    // Counts (use COUNT aggregations to avoid pulling docs).
    const [activeProducts, users, paid, pending, recent] = await Promise.all([
      admin.collection('products').where('active', '==', true).count().get(),
      admin.collection('users').count().get(),
      admin.collection('storeOrders').where('status', '==', 'paid').count().get(),
      admin.collection('storeOrders').where('status', '==', 'pending').count().get(),
      admin.collection('storeOrders').orderBy('createdAt', 'desc').limit(8).get(),
    ]);

    return ok(res, {
      stats: {
        activeProducts: activeProducts.data().count,
        users: users.data().count,
        paid: paid.data().count,
        pending: pending.data().count,
      },
      recent: recent.docs.map(d => toJson(d)),
    });
  } catch (e) {
    return serverError(res, e);
  }
}
