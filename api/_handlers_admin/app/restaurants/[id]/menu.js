// CRUD on /restaurants/{restaurantId}/menu items
import { applyCors } from '../../../../_lib/cors.js';
import { methodGuard, readJson, ok, created, badReq, notFound, serverError } from '../../../../_lib/response.js';
import { requireRole } from '../../../../_lib/auth.js';
import { db, FieldValue, toJson } from '../../../../_lib/firebase.js';
import { audit } from '../../../../_lib/audit.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (!methodGuard(req, res, ['GET','POST','PATCH','DELETE'])) return;
  const caller = await requireRole(req, res, 'editor');
  if (!caller) return;
  const restaurantId = req.query.id;
  if (!restaurantId) return badReq(res, 'restaurant id required');
  const itemId = req.query.itemId;

  try {
    const menu = db().collection('restaurants').doc(restaurantId).collection('menu');

    if (req.method === 'GET') {
      const snap = await menu.get();
      return ok(res, { items: snap.docs.map(d => toJson(d)) });
    }

    if (req.method === 'POST') {
      const body = await readJson(req);
      if (!body || typeof body !== 'object') return badReq(res, 'object body required');
      const ref = await menu.add({
        ...body,
        restaurantId,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      const saved = await ref.get();
      await audit({ req, actor: caller, action: 'menu_item.create', entityType: 'menu_item', entityId: ref.id, after: body });
      return created(res, { item: toJson(saved) });
    }

    if (!itemId) return badReq(res, 'itemId required');
    const ref = menu.doc(itemId);
    const snap = await ref.get();
    if (!snap.exists) return notFound(res);
    const existing = snap.data();

    if (req.method === 'DELETE') {
      await ref.delete();
      await audit({ req, actor: caller, action: 'menu_item.delete', entityType: 'menu_item', entityId: itemId, before: existing });
      return ok(res, { ok: true });
    }

    const body = await readJson(req);
    await ref.update({ ...body, updatedAt: FieldValue.serverTimestamp() });
    const after = await ref.get();
    await audit({ req, actor: caller, action: 'menu_item.update', entityType: 'menu_item', entityId: itemId, before: existing, after: after.data() });
    return ok(res, { item: toJson(after) });
  } catch (e) {
    return serverError(res, e);
  }
}
