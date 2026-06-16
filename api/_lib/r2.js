// Storefront <-> R2 boundary.
//
// This server holds NO R2 credentials. All bucket I/O goes through the
// ABX-Motion Cloudflare Worker, which holds the R2 binding and
// verifies Firebase ID tokens itself.
//
//   Uploads — browser -> Worker POST /upload   (admin/editor role required)
//   Deletes — server  -> Worker DELETE /object?key=  (forwards caller's token)
//   Reads   — public CDN at R2_PUBLIC_BASE
import { env } from './env.js';

const ALLOWED_PREFIXES = [
  // Existing ABX-Motion prefixes
  'feed/', 'avatar/', 'club/',
  // ABX Motion storefront prefixes
  'product/', 'collection/', 'site/', 'lookbook/',
];

export function assertSafeKey(key) {
  if (!key || typeof key !== 'string') throw new Error('key required');
  if (key.length > 512) throw new Error('key too long');
  if (key.includes('..') || key.startsWith('/')) throw new Error('invalid key');
  if (!ALLOWED_PREFIXES.some(p => key.startsWith(p))) {
    throw new Error('key must start with: ' + ALLOWED_PREFIXES.join(', '));
  }
}

/**
 * Delete an R2 object by forwarding the caller's Firebase ID token to the
 * Worker, which re-verifies it and enforces the admin/editor role claim.
 *
 * Pass the original Vercel `req` so we can re-use its Authorization header.
 */
export async function deleteObject(key, req) {
  assertSafeKey(key);
  const auth = req?.headers?.authorization ?? '';
  if (!auth.startsWith('Bearer ')) {
    throw new Error('caller ID token required to delete R2 object');
  }

  const workerBase = env.R2_UPLOAD_ENDPOINT.replace(/\/upload$/, '');
  const res = await fetch(`${workerBase}/object?key=${encodeURIComponent(key)}`, {
    method: 'DELETE',
    headers: { Authorization: auth },
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`worker delete failed (${res.status}): ${t}`);
  }
}

export function publicUrl(key) {
  if (!key) return null;
  return `${env.R2_PUBLIC_BASE.replace(/\/$/, '')}/${key}`;
}
