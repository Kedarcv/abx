import crypto from 'node:crypto';
import { applyCors } from '../../_lib/cors.js';
import { methodGuard, readJson, ok, created, badReq, serverError } from '../../_lib/response.js';
import { requireRole } from '../../_lib/auth.js';
import { db, FieldValue, toJson } from '../../_lib/firebase.js';
import { invitationSchema } from '../../_lib/schemas.js';
import { sendEmail, brandedHtml } from '../../_lib/email.js';
import { audit } from '../../_lib/audit.js';
import { env } from '../../_lib/env.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (!methodGuard(req, res, ['GET','POST'])) return;
  const caller = await requireRole(req, res, 'admin');
  if (!caller) return;

  try {
    if (req.method === 'GET') {
      const snap = await db().collection('invitations')
        .orderBy('createdAt', 'desc').limit(200).get();
      return ok(res, { items: snap.docs.map(d => toJson(d)) });
    }

    let body;
    try { body = invitationSchema.parse(await readJson(req)); }
    catch (e) { return badReq(res, e.errors?.[0]?.message ?? 'Invalid request'); }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000);
    const ref = await db().collection('invitations').add({
      email: body.email.toLowerCase(),
      role: body.role,
      token,
      invitedBy: caller.user.uid,
      expiresAt: expiresAt.toISOString(),
      createdAt: FieldValue.serverTimestamp(),
    });

    const acceptUrl = `${env.APP_URL}/admin/accept-invite?token=${token}`;
    const emailResult = await sendEmail({
      to: body.email,
      subject: `You've been invited to ABX Motion admin`,
      html: brandedHtml({
        preview: `You've been invited to ABX Motion admin (${body.role})`,
        title: `You're invited`,
        body: `
          <p>You've been added to the ABX Motion control room as <strong style="color:#FF7A00;">${body.role}</strong>.</p>
          <p>Sign in with this email address (<strong>${body.email}</strong>) and click below to claim the role. This invitation expires in 7 days.</p>`,
        ctaLabel: 'Accept invitation',
        ctaHref: acceptUrl,
        footerNote: `If you weren't expecting this, you can ignore it.`,
      }),
    });

    // Persist the send-status so the UI can warn if delivery failed.
    const emailStatus = emailResult?.skipped ? 'skipped'
      : emailResult?.ok ? 'sent'
      : 'failed';
    await ref.update({
      emailStatus,
      emailFrom: emailResult?.from ?? null,
      emailError: emailResult?.ok ? null : (emailResult?.error ?? null),
      acceptUrl,
    });

    const saved = await ref.get();
    await audit({ req, actor: caller, action: 'invitation.create', entityType: 'invitation', entityId: ref.id, after: { email: body.email, role: body.role, emailStatus } });
    return created(res, {
      invitation: { id: ref.id, email: body.email, role: body.role, expiresAt: saved.data().expiresAt },
      email: { status: emailStatus, from: emailResult?.from ?? null, error: emailResult?.ok ? null : (emailResult?.error ?? null) },
      acceptUrl,
    });
  } catch (e) {
    return serverError(res, e);
  }
}
