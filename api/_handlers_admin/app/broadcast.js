// Send a push notification to a user segment via FCM.
// POST { title, body, segment: 'all'|'admins'|'restaurant', topic?, restaurantId?, data? }
import { applyCors } from '../../_lib/cors.js';
import { methodGuard, readJson, ok, badReq, serverError } from '../../_lib/response.js';
import { requireRole } from '../../_lib/auth.js';
import { db, FieldValue } from '../../_lib/firebase.js';
import { getMessaging } from 'firebase-admin/messaging';
import { firebaseApp } from '../../_lib/firebase.js';
import { audit } from '../../_lib/audit.js';
import { z } from 'zod';

const schema = z.object({
  title: z.string().min(1).max(120),
  body: z.string().min(1).max(500),
  segment: z.enum(['all','admins','restaurant','topic']).default('topic'),
  topic: z.string().max(120).optional(),
  restaurantId: z.string().max(120).optional(),
  data: z.record(z.string()).optional(),
});

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (!methodGuard(req, res, ['POST'])) return;
  const caller = await requireRole(req, res, 'admin');
  if (!caller) return;

  let body;
  try { body = schema.parse(await readJson(req)); }
  catch (e) { return badReq(res, e.errors?.[0]?.message ?? 'Invalid request'); }

  try {
    const messaging = getMessaging(firebaseApp());
    const message = {
      notification: { title: body.title, body: body.body },
      data: body.data,
    };

    let resp;
    if (body.segment === 'all') {
      resp = await messaging.send({ ...message, topic: 'all' });
    } else if (body.segment === 'admins') {
      resp = await messaging.send({ ...message, topic: 'admins' });
    } else if (body.segment === 'restaurant' && body.restaurantId) {
      resp = await messaging.send({ ...message, topic: `restaurant_${body.restaurantId}` });
    } else if (body.segment === 'topic' && body.topic) {
      resp = await messaging.send({ ...message, topic: body.topic });
    } else {
      return badReq(res, 'invalid segment/topic combination');
    }

    await db().collection('notifications').add({
      title: body.title,
      body: body.body,
      segment: body.segment,
      topic: body.topic ?? null,
      restaurantId: body.restaurantId ?? null,
      data: body.data ?? null,
      sentBy: caller.user.uid,
      sentAt: FieldValue.serverTimestamp(),
      fcmMessageId: resp,
    });

    await audit({ req, actor: caller, action: 'notification.broadcast', entityType: 'notification', entityId: resp, after: body });
    return ok(res, { messageId: resp });
  } catch (e) {
    return serverError(res, e);
  }
}
