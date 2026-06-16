// Centralised env access so every endpoint fails fast on missing config.
function need(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}
function optional(name, fallback = undefined) {
  return process.env[name] ?? fallback;
}

export const env = {
  // Firebase Admin
  get FIREBASE_PROJECT_ID() { return optional('FIREBASE_PROJECT_ID', 'docucraft-cd41b'); },
  get FIREBASE_SERVICE_ACCOUNT_BASE64() { return optional('FIREBASE_SERVICE_ACCOUNT_BASE64'); },
  get FIREBASE_SERVICE_ACCOUNT_JSON()   { return optional('FIREBASE_SERVICE_ACCOUNT_JSON'); },

  // Cloudflare R2 — the server holds NO bucket credentials.
  // All uploads + deletes go through the ABX-Motion Worker, which
  // already has the R2 binding and verifies Firebase ID tokens.
  get R2_PUBLIC_BASE()       {
    return optional('R2_PUBLIC_BASE',
      'https://pub-d9633fd2667448538cf6d2f18f8ed07d.r2.dev');
  },
  get R2_UPLOAD_ENDPOINT()   {
    return optional('R2_UPLOAD_ENDPOINT',
      'https://tyw-upload-image.r245142r.workers.dev/upload');
  },

  // Stripe
  get STRIPE_SECRET_KEY()    { return need('STRIPE_SECRET_KEY'); },
  get STRIPE_WEBHOOK_SECRET(){ return need('STRIPE_WEBHOOK_SECRET'); },

  // Email
  get RESEND_API_KEY()       { return optional('RESEND_API_KEY'); },
  get RESEND_FROM()          { return optional('RESEND_FROM', 'ABX Motion <orders@abxmotion.io>'); },
  // Used when RESEND_FROM is rejected as an unverified domain (e.g. while DNS
  // is still propagating). `onboarding@resend.dev` works for every Resend
  // account but only sends to addresses on the same Resend account.
  get RESEND_FROM_FALLBACK() { return optional('RESEND_FROM_FALLBACK', 'ABX Motion <onboarding@resend.dev>'); },

  // Upstash (rate limiting) — optional
  get UPSTASH_REDIS_REST_URL()   { return optional('UPSTASH_REDIS_REST_URL'); },
  get UPSTASH_REDIS_REST_TOKEN() { return optional('UPSTASH_REDIS_REST_TOKEN'); },

  // App
  get APP_URL()              { return need('APP_URL'); },
  get ALLOWED_ORIGINS()      {
    return (optional('ALLOWED_ORIGINS', '') || '')
      .split(',').map(s => s.trim()).filter(Boolean);
  },
};
