// POST /api/auth/welcome
//
// Called by the browser right after a new sign-up (email or Google) to send
// a one-time welcome email. Idempotent — if /users/{uid}.welcomeSentAt is
// already set we do nothing.
import { applyCors } from '../_lib/cors.js';
import { methodGuard, ok, unauth, serverError } from '../_lib/response.js';
import { getCaller } from '../_lib/auth.js';
import { db, FieldValue } from '../_lib/firebase.js';
import { Emails } from '../_lib/email.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (!methodGuard(req, res, ['POST'])) return;

  const caller = await getCaller(req);
  if (!caller) return unauth(res);

  try {
    const ref = db().collection('users').doc(caller.user.uid);
    const snap = await ref.get();
    const data = snap.exists ? snap.data() : null;
    if (data?.welcomeSentAt) return ok(res, { skipped: true });

    if (caller.user.email) {
      await Emails.sendWelcome(caller.user.email, data?.displayName ?? null);
    }

    await ref.set({ welcomeSentAt: FieldValue.serverTimestamp() }, { merge: true });
    return ok(res, { ok: true });
  } catch (e) {
    return serverError(res, e);
  }
}
