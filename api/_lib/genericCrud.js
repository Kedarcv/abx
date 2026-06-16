// Reusable generic CRUD over a single top-level Firestore collection.
// Used by the ABX-Motion app-admin endpoints where Firestore docs
// are simple JSON. The mobile app's repositories already validate their
// own data shapes; this layer just enforces auth, audit, and timestamps.
import { applyCors } from './cors.js';
import { methodGuard, readJson, ok, created, badReq, notFound, serverError } from './response.js';
import { requireRole } from './auth.js';
import { db, FieldValue, toJson } from './firebase.js';
import { audit } from './audit.js';

const MAX_BODY_FIELDS = 80;
const FORBIDDEN_FIELDS = new Set(['__proto__', 'constructor', 'prototype']);

function sanitize(value, depth = 0) {
  if (depth > 6) throw new Error('payload too deeply nested');
  if (value === null) return null;
  if (Array.isArray(value)) return value.map(v => sanitize(v, depth + 1));
  if (typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length > MAX_BODY_FIELDS) throw new Error('too many fields');
    const out = {};
    for (const k of keys) {
      if (FORBIDDEN_FIELDS.has(k)) continue;
      if (k.startsWith('$')) continue; // disallow operator-like keys
      out[k] = sanitize(value[k], depth + 1);
    }
    return out;
  }
  if (typeof value === 'string' && value.length > 50_000) {
    throw new Error('string field too long');
  }
  return value;
}

export function genericCrud({ collection, role = 'editor', entityType, maxList = 200, transform }) {
  return async function handler(req, res) {
    if (applyCors(req, res)) return;
    if (!methodGuard(req, res, ['GET','POST','PATCH','DELETE'])) return;
    const caller = await requireRole(req, res, role);
    if (!caller) return;

    const id = req.query.id;
    try {
      const col = db().collection(collection);

      // ---- LIST ---------------------------------------------------------
      if (req.method === 'GET' && !id) {
        const limit = Math.min(parseInt(req.query.limit || '50', 10), maxList);
        const orderBy = req.query.orderBy || 'createdAt';
        const dir = req.query.dir === 'asc' ? 'asc' : 'desc';

        // Build base query (with optional where=…&eq=…).
        const baseQ = (req.query.where && req.query.eq)
          ? col.where(String(req.query.where), '==', req.query.eq)
          : col;

        // Try ordered first; if empty (likely because docs lack the field),
        // fall back to an unordered list so legacy seed data still shows up.
        let snap = await baseQ.orderBy(orderBy, dir).limit(limit).get();
        if (snap.empty) {
          snap = await baseQ.limit(limit).get();
        }
        return ok(res, { items: snap.docs.map(d => toJson(d)) });
      }

      // ---- READ ---------------------------------------------------------
      if (req.method === 'GET' && id) {
        const snap = await col.doc(id).get();
        if (!snap.exists) return notFound(res);
        return ok(res, { item: toJson(snap) });
      }

      // ---- CREATE -------------------------------------------------------
      if (req.method === 'POST') {
        let body;
        try { body = sanitize(await readJson(req)); }
        catch (e) { return badReq(res, e.message); }
        if (!body || typeof body !== 'object') return badReq(res, 'object body required');
        if (transform) body = transform({ body, isNew: true, caller }) ?? body;

        const doc = {
          ...body,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
          createdBy: caller.user.uid,
        };
        const ref = id ? col.doc(id) : col.doc();
        if (id && (await ref.get()).exists) return badReq(res, 'doc already exists');
        await ref.set(doc);
        const saved = await ref.get();
        await audit({ req, actor: caller, action: `${entityType}.create`, entityType, entityId: ref.id, after: body });
        return created(res, { item: toJson(saved) });
      }

      // mutations from here on need an id
      if (!id) return badReq(res, 'id required');
      const ref = col.doc(id);
      const snap = await ref.get();
      if (!snap.exists) return notFound(res);
      const existing = snap.data();

      // ---- UPDATE -------------------------------------------------------
      if (req.method === 'PATCH') {
        let body;
        try { body = sanitize(await readJson(req)); }
        catch (e) { return badReq(res, e.message); }
        if (!body || typeof body !== 'object') return badReq(res, 'object body required');
        if (transform) body = transform({ body, isNew: false, caller, existing }) ?? body;
        await ref.update({
          ...body,
          updatedAt: FieldValue.serverTimestamp(),
          updatedBy: caller.user.uid,
        });
        const after = await ref.get();
        await audit({ req, actor: caller, action: `${entityType}.update`, entityType, entityId: id, before: existing, after: after.data() });
        return ok(res, { item: toJson(after) });
      }

      // ---- DELETE -------------------------------------------------------
      const hard = req.query.hard === '1';
      if (hard) {
        await ref.delete();
        await audit({ req, actor: caller, action: `${entityType}.delete_hard`, entityType, entityId: id, before: existing });
        return ok(res, { ok: true, hard: true });
      }
      await ref.update({
        active: false,
        archivedAt: FieldValue.serverTimestamp(),
        updatedBy: caller.user.uid,
      });
      const after = await ref.get();
      await audit({ req, actor: caller, action: `${entityType}.archive`, entityType, entityId: id, before: existing, after: after.data() });
      return ok(res, { item: toJson(after) });
    } catch (e) {
      return serverError(res, e);
    }
  };
}
