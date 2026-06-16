// POST /api/admin/app/restaurants/[id]/assign-admin  { uid }
// Sets the user's role to 'restaurant' and a custom claim with restaurantId,
// matching firestore.rules helper isRestaurantOwner(restaurantId).
import { applyCors } from '../../../../_lib/cors.js';
import { methodGuard, readJson, ok, badReq, notFound, serverError } from '../../../../_lib/response.js';
import { requireRole } from '../../../../_lib/auth.js';
import { authAdmin, db, FieldValue } from '../../../../_lib/firebase.js';
import { audit } from '../../../../_lib/audit.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (!methodGuard(req, res, ['POST'])) return;
  const caller = await requireRole(req, res, 'admin');
  if (!caller) return;
  const restaurantId = req.query.id;
  if (!restaurantId) return badReq(res, 'restaurant id required');

  try {
    const { uid } = await readJson(req);
    if (!uid) return badReq(res, 'uid required');

    const restSnap = await db().collection('restaurants').doc(restaurantId).get();
    if (!restSnap.exists) return notFound(res);

    await db().collection('users').doc(uid).set({
      role: 'restaurant',
      restaurantId,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    // Match ABX-Motion's `restaurant_admin_profiles` convention
    await db().collection('restaurant_admin_profiles').doc(uid).set({
      uid, restaurantId,
      assignedBy: caller.user.uid,
      assignedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    await authAdmin().setCustomUserClaims(uid, { role: 'restaurantAdmin', restaurantId });

    await audit({ req, actor: caller, action: 'restaurant.assign_admin', entityType: 'restaurant', entityId: restaurantId, after: { uid } });
    return ok(res, { ok: true });
  } catch (e) {
    return serverError(res, e);
  }
}
