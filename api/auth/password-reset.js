// POST /api/auth/password-reset  { email }
//
// Generates a Firebase password-reset link using the Admin SDK, then sends
// the email through Resend so it matches the rest of our branded comms.
// Always returns 200 (whether or not the email exists) to avoid leaking
// account existence.
import { applyCors } from '../_lib/cors.js';
import { methodGuard, readJson, ok, badReq, serverError } from '../_lib/response.js';
import { rateLimit } from '../_lib/rateLimit.js';
import { authAdmin } from '../_lib/firebase.js';
import { Emails } from '../_lib/email.js';
import { env } from '../_lib/env.js';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
});

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (!methodGuard(req, res, ['POST'])) return;

  const rl = await rateLimit(req, { key: 'pw-reset', limit: 5, windowSec: 60 });
  if (!rl.success) return res.status(429).json({ error: 'Too many requests' });

  let body;
  try { body = schema.parse(await readJson(req)); }
  catch (e) { return badReq(res, e.errors?.[0]?.message ?? 'Invalid request'); }

  try {
    const link = await authAdmin().generatePasswordResetLink(body.email, {
      url: `${env.APP_URL}/login`,
      handleCodeInApp: false,
    });
    // Best-effort email send — never reveal whether the account exists.
    await Emails.sendPasswordReset(body.email, link).catch((e) => {
      console.error('[password-reset] send failed', e);
    });
  } catch (e) {
    // Most likely user-not-found. Swallow to avoid email enumeration.
    if (!String(e?.code ?? e?.message).includes('user-not-found')) {
      console.warn('[password-reset]', e?.message);
    }
  }

  return ok(res, { ok: true });
}
