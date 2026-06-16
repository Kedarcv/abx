import { applyCors } from '../../_lib/cors.js';
import { methodGuard, ok, serverError } from '../../_lib/response.js';
import { requireRole } from '../../_lib/auth.js';
import { db, toJson } from '../../_lib/firebase.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (!methodGuard(req, res, ['GET'])) return;
  const caller = await requireRole(req, res, 'admin');
  if (!caller) return;

  try {
    const limit = Math.min(parseInt(req.query.limit || '100', 10), 500);
    const q = (req.query.q ?? '').toString().trim();
    let snap;
    if (q) {
      snap = await db().collection('users')
        .where('email', '>=', q).where('email', '<=', q + '\uf8ff').limit(limit).get();
    } else {
      // Prefer ordered by createdAt; fall back to unordered for legacy docs
      // that pre-date the createdAt field being written.
      snap = await db().collection('users')
        .orderBy('createdAt', 'desc').limit(limit).get();
      if (snap.empty) {
        snap = await db().collection('users').limit(limit).get();
      }
    }
    return ok(res, { items: snap.docs.map(d => toJson(d)) });
  } catch (e) {
    return serverError(res, e);
  }
}
