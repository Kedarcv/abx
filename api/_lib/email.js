// Single email gateway for the storefront + ABX-Motion admin.
// Everything goes through Resend so we get one sender identity, one set of
// templates, and centralized retries. If RESEND_API_KEY is missing the
// senders no-op (useful for local dev).
import { Resend } from 'resend';
import { env } from './env.js';

let _resend;
function client() {
  if (_resend) return _resend;
  if (!env.RESEND_API_KEY) return null;
  _resend = new Resend(env.RESEND_API_KEY);
  return _resend;
}

const BRAND = {
  name: 'ABX Motion',
  accent: '#FF7A00',
  yellow: '#F4EC47',
  dark: '#0a0a0a',
  contactEmail: 'hello@abxmotion.io',
  appUrl: env.APP_URL ?? 'https://abxmotion.io',
};

/**
 * Low-level send. Returns one of:
 *   { ok: true, id, from }       — Resend accepted the message
 *   { ok: false, error, status } — Resend rejected (e.g. unverified domain)
 *   { skipped: true }            — RESEND_API_KEY not configured
 *
 * If the configured `RESEND_FROM` is rejected as an unverified domain and
 * `RESEND_FROM_FALLBACK` is set (default `onboarding@resend.dev`), the send
 * is retried once with the fallback so admin/transactional emails keep
 * working while a new sending domain is propagating.
 */
export async function sendEmail({ to, subject, html, text, replyTo, headers }) {
  const c = client();
  if (!c) {
    console.warn('[email] RESEND_API_KEY not set; skipping send to', to);
    return { skipped: true };
  }
  const fallbackFrom = env.RESEND_FROM_FALLBACK || 'onboarding@resend.dev';
  const primary = env.RESEND_FROM;

  async function attempt(from) {
    return c.emails.send({
      from,
      to,
      subject,
      html,
      text: text ?? htmlToText(html),
      reply_to: replyTo,
      headers,
    });
  }

  try {
    const r = await attempt(primary);
    if (r?.error) {
      // Resend SDK returns { data, error } shape; surface error explicitly.
      const isUnverified =
        r.error?.statusCode === 403 ||
        /not verified/i.test(r.error?.message ?? '');
      if (isUnverified && fallbackFrom && fallbackFrom !== primary) {
        console.warn(
          `[email] ${primary} unverified, retrying with ${fallbackFrom}`,
        );
        const r2 = await attempt(fallbackFrom);
        if (r2?.error) {
          return {
            ok: false,
            error: r2.error.message ?? String(r2.error),
            status: r2.error.statusCode ?? 500,
          };
        }
        return { ok: true, id: r2?.data?.id, from: fallbackFrom };
      }
      return {
        ok: false,
        error: r.error.message ?? String(r.error),
        status: r.error.statusCode ?? 500,
      };
    }
    return { ok: true, id: r?.data?.id, from: primary };
  } catch (e) {
    return { ok: false, error: e?.message ?? String(e), status: 500 };
  }
}

// ============================================================
// Template builders
// ============================================================

function shell({ preview = '', title = '', body = '', cta, footerNote }) {
  const ctaBlock = cta
    ? `<table role="presentation" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
         <tr><td>
           <a href="${escape(cta.href)}"
              style="background:${BRAND.accent};color:#000;text-decoration:none;
                     padding:14px 28px;border-radius:999px;font-weight:600;
                     font-family:Inter,Arial,sans-serif;font-size:14px;
                     letter-spacing:0.05em;text-transform:uppercase;display:inline-block;">
             ${escape(cta.label)}
           </a>
         </td></tr>
       </table>` : '';

  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escape(title)}</title></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Inter,Arial,sans-serif;">
  <span style="display:none;color:#0a0a0a;visibility:hidden;opacity:0;font-size:1px;line-height:1px;">${escape(preview)}</span>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#111;border-radius:24px;border:1px solid rgba(255,255,255,0.08);padding:40px;">
        <tr><td>
          <p style="margin:0 0 4px;color:rgba(255,255,255,0.45);font-size:11px;letter-spacing:0.3em;text-transform:uppercase;font-family:'Orbitron',Inter,Arial,sans-serif;">
            ABX <span style="color:${BRAND.accent};">Motion</span>
          </p>
          <h1 style="margin:0 0 24px;color:#fff;font-size:24px;line-height:1.25;font-family:'Orbitron',Inter,Arial,sans-serif;font-weight:700;">
            ${escape(title)}
          </h1>
          <div style="color:rgba(255,255,255,0.78);font-size:15px;line-height:1.6;">
            ${body}
          </div>
          ${ctaBlock}
          ${footerNote ? `<p style="margin:24px 0 0;color:rgba(255,255,255,0.45);font-size:12px;line-height:1.6;">${footerNote}</p>` : ''}
          <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:28px 0;">
          <p style="margin:0;color:rgba(255,255,255,0.35);font-size:11px;line-height:1.6;">
            ${BRAND.name} · <a href="${BRAND.appUrl}" style="color:rgba(255,255,255,0.55);text-decoration:none;">${BRAND.appUrl.replace(/^https?:\/\//,'')}</a> · <a href="mailto:${BRAND.contactEmail}" style="color:rgba(255,255,255,0.55);text-decoration:none;">${BRAND.contactEmail}</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

// ---- Order receipt ----
export function orderReceiptHtml(order, items) {
  const rows = items.map(it => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);">${escape(it.nameSnapshot ?? it.name_snapshot)}${(it.skuSnapshot ?? it.sku_snapshot) ? ` <small style="color:rgba(255,255,255,0.45);">(${escape(it.skuSnapshot ?? it.sku_snapshot)})</small>` : ''}</td>
      <td align="right" style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);color:rgba(255,255,255,0.55);">${it.quantity}</td>
      <td align="right" style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);font-family:'JetBrains Mono',monospace;">${money(it.unitPriceCents ?? it.unit_price_cents, order.currency)}</td>
      <td align="right" style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);font-family:'JetBrains Mono',monospace;">${money(it.totalCents ?? it.total_cents, order.currency)}</td>
    </tr>`).join('');

  const totals = [
    ['Subtotal', money(order.subtotalCents ?? order.subtotal_cents, order.currency)],
    (order.discountCents ?? order.discount_cents)
      ? ['Discount', '-' + money(order.discountCents ?? order.discount_cents, order.currency)] : null,
    ['Shipping', money(order.shippingCents ?? order.shipping_cents ?? 0, order.currency)],
    ['Tax', money(order.taxCents ?? order.tax_cents ?? 0, order.currency)],
  ].filter(Boolean).map(([l, v]) =>
    `<tr><td style="color:rgba(255,255,255,0.55);padding:4px 0;">${l}</td><td align="right" style="font-family:'JetBrains Mono',monospace;">${v}</td></tr>`).join('');

  return shell({
    preview: `Order #${order.number} confirmed`,
    title: `Order #${order.number} confirmed`,
    body: `
      <p>Thanks for your order — here's the receipt for your records.</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
        <thead>
          <tr style="color:rgba(255,255,255,0.45);font-size:11px;text-transform:uppercase;letter-spacing:0.15em;">
            <th align="left" style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.1);">Item</th>
            <th align="right" style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.1);">Qty</th>
            <th align="right" style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.1);">Price</th>
            <th align="right" style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.1);">Total</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
        ${totals}
        <tr><td style="padding:12px 0 0;border-top:1px solid rgba(255,255,255,0.15);color:#fff;font-weight:600;">Total</td><td align="right" style="padding:12px 0 0;border-top:1px solid rgba(255,255,255,0.15);font-family:'JetBrains Mono',monospace;color:#fff;font-size:18px;">${money(order.totalCents ?? order.total_cents, order.currency)}</td></tr>
      </table>`,
    cta: { label: 'View order', href: `${BRAND.appUrl}/account/orders` },
    footerNote: `If anything looks wrong, just reply to this email and we'll sort it out.`,
  });
}

// ---- Password reset (matches Firebase's link format but goes through Resend) ----
export function passwordResetHtml({ resetUrl }) {
  return shell({
    preview: 'Reset your ABX Motion password',
    title: 'Reset your password',
    body: `
      <p>We got a request to reset the password on your ABX Motion account. Click the button below to choose a new one. The link expires in 1 hour.</p>
      <p>If you didn't request this, you can safely ignore this email — your account stays as is.</p>`,
    cta: { label: 'Reset password', href: resetUrl },
    footerNote: `Or paste this URL in your browser: <br><span style="word-break:break-all;color:rgba(255,255,255,0.55);">${escape(resetUrl)}</span>`,
  });
}

// ---- Welcome email (first sign-up) ----
export function welcomeHtml({ name }) {
  return shell({
    preview: `Welcome to ${BRAND.name}`,
    title: `Welcome${name ? ', ' + escape(name) : ''}`,
    body: `
      <p>Your account is ready. The shop, your run dashboard, and everything in the ABX Motion ecosystem now run from one login.</p>
      <ul style="padding-left:20px;color:rgba(255,255,255,0.7);">
        <li>Track your runs, workouts, and XP.</li>
        <li>Shop the storefront — discounts and order history live in your account.</li>
        <li>Join community challenges and unlock rewards.</li>
      </ul>`,
    cta: { label: 'Explore the store', href: `${BRAND.appUrl}/shop` },
  });
}

// ---- Order shipped ----
export function orderShippedHtml({ order, carrier, trackingNumber, trackingUrl }) {
  const tracking = trackingUrl
    ? `<a href="${escape(trackingUrl)}" style="color:${BRAND.accent};">${escape(trackingNumber)}</a>`
    : escape(trackingNumber ?? '—');
  return shell({
    preview: `Your order #${order.number} is on the way`,
    title: `Your order is on the way`,
    body: `
      <p>Great news — order <strong>#${order.number}</strong> has shipped.</p>
      <p>${carrier ? `Carrier: <strong>${escape(carrier)}</strong><br>` : ''}Tracking: ${tracking}</p>`,
    cta: { label: 'Track shipment', href: trackingUrl ?? `${BRAND.appUrl}/account/orders` },
  });
}

// ---- Generic transactional template (kept exportable so other endpoints can use it) ----
export function brandedHtml({ title, body, ctaLabel, ctaHref, preview, footerNote }) {
  return shell({
    title, body, preview, footerNote,
    cta: ctaLabel && ctaHref ? { label: ctaLabel, href: ctaHref } : null,
  });
}

// ---- Convenience wrappers ----
export const Emails = {
  async sendOrderReceipt(order, items) {
    if (!order?.email) return { skipped: true };
    return sendEmail({
      to: order.email,
      subject: `ABX Motion — order #${order.number} confirmed`,
      html: orderReceiptHtml(order, items),
    });
  },
  async sendOrderShipped(order, { carrier, trackingNumber, trackingUrl }) {
    if (!order?.email) return { skipped: true };
    return sendEmail({
      to: order.email,
      subject: `ABX Motion — order #${order.number} shipped`,
      html: orderShippedHtml({ order, carrier, trackingNumber, trackingUrl }),
    });
  },
  async sendPasswordReset(email, resetUrl) {
    return sendEmail({
      to: email,
      subject: 'Reset your ABX Motion password',
      html: passwordResetHtml({ resetUrl }),
    });
  },
  async sendWelcome(email, name) {
    return sendEmail({
      to: email,
      subject: `Welcome to ABX Motion`,
      html: welcomeHtml({ name }),
    });
  },
};

// ============================================================
// helpers
// ============================================================
function money(cents, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format((cents ?? 0) / 100);
}
function escape(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function htmlToText(html) {
  return String(html ?? '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
