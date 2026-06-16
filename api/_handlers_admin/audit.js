import { applyCors } from '../_lib/cors.js';
import { methodGuard, ok, serverError } from '../_lib/response.js';
import { requireRole } from '../_lib/auth.js';
import { db, toJson } from '../_lib/firebase.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (!methodGuard(req, res, ['GET'])) return;
  const caller = await requireRole(req, res, 'admin');
  if (!caller) return;

  try {
    const limit = Math.min(parseInt(req.query.limit || '100', 10), 500);
    let q = db().collection('auditLog').orderBy('at', 'desc').limit(limit);
    if (req.query.entity_type) q = q.where('entityType', '==', req.query.entity_type);
    if (req.query.entity_id)   q = q.where('entityId', '==', req.query.entity_id);
    if (req.query.actor)       q = q.where('actorId', '==', req.query.actor);
    let snap = await q.get();
    if (snap.empty) {
      // Fallback: include legacy entries that lack the `at` field.
      snap = await db().collection('auditLog').limit(limit).get();
    }
    return ok(res, { items: snap.docs.map(d => toJson(d)) });
  } catch (e) {
    return serverError(res, e);
  }
}
