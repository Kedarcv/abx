// Drivers live under multiple collections in the existing app:
// /riders, /driver_profiles, /driver_stats, /driver_locations.
// We expose a unified read here.
import { applyCors } from '../../../_lib/cors.js';
import { methodGuard, ok, serverError } from '../../../_lib/response.js';
import { requireRole } from '../../../_lib/auth.js';
import { db, toJson } from '../../../_lib/firebase.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (!methodGuard(req, res, ['GET'])) return;
  const caller = await requireRole(req, res, 'admin');
  if (!caller) return;

  try {
    const limit = Math.min(parseInt(req.query.limit || '50', 10), 200);
    const snap = await db().collection('driver_profiles')
      .orderBy('createdAt', 'desc').limit(limit).get();
    return ok(res, { items: snap.docs.map(d => toJson(d)) });
  } catch (e) {
    return serverError(res, e);
  }
}
