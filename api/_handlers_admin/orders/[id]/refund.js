import { applyCors } from '../../../_lib/cors.js';
import { methodGuard, readJson, ok, notFound, badReq, serverError } from '../../../_lib/response.js';
import { requireRole } from '../../../_lib/auth.js';
import { db, FieldValue, toJson } from '../../../_lib/firebase.js';
import { stripe } from '../../../_lib/stripe.js';
import { refundSchema } from '../../../_lib/schemas.js';
import { audit } from '../../../_lib/audit.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (!methodGuard(req, res, ['POST'])) return;
  const caller = await requireRole(req, res, 'admin');
  if (!caller) return;
  const id = req.query.id;
  if (!id) return badReq(res, 'id required');

  let body;
  try { body = refundSchema.parse(await readJson(req)); }
  catch (e) { return badReq(res, e.errors?.[0]?.message ?? 'Invalid request'); }

  try {
    const ref = db().collection('storeOrders').doc(id);
    const snap = await ref.get();
    if (!snap.exists) return notFound(res);
    const order = snap.data();
    if (!order.stripePaymentIntent) return badReq(res, 'order has no payment to refund');

    const refund = await stripe().refunds.create({
      payment_intent: order.stripePaymentIntent,
      amount: body.amountCents,
      reason: body.reason,
    });

    await ref.update({ status: 'refunded', updatedAt: FieldValue.serverTimestamp() });
    const after = await ref.get();
    await audit({ req, actor: caller, action: 'order.refund', entityType: 'order', entityId: id, before: order, after: { ...after.data(), refundId: refund.id } });
    return ok(res, { order: toJson(after), refund });
  } catch (e) {
    return serverError(res, e);
  }
}
