import { db, FieldValue } from './firebase.js';

/**
 * Record an admin/staff write into Firestore /auditLog.
 * Failures here must never break the request.
 */
export async function audit({ req, actor, action, entityType, entityId, before, after }) {
  try {
    await db().collection('auditLog').add({
      actorId: actor?.user?.uid ?? null,
      actorEmail: actor?.profile?.email ?? actor?.user?.email ?? null,
      action,
      entityType,
      entityId: entityId ? String(entityId) : null,
      before: before ?? null,
      after: after ?? null,
      ip: (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || null,
      userAgent: req.headers['user-agent'] ?? null,
      at: FieldValue.serverTimestamp(),
    });
  } catch (e) {
    console.error('[audit] failed', e);
  }
}
