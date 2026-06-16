// Helper for the admin UI: upload an image straight to the existing
// tyw-upload-image Cloudflare Worker, then POST the metadata to
// /api/admin/media to register it in /mediaAssets.
import { firebaseAuth } from './firebase.js';
import { api } from './api.js';

const WORKER_URL = import.meta.env.VITE_R2_UPLOAD_ENDPOINT
  ?? 'https://tyw-upload-image.r245142r.workers.dev/upload';

/**
 * Upload a File/Blob to R2 via the Worker and register the asset.
 *
 * @param {File|Blob} file
 * @param {Object} opts
 * @param {'product'|'collection'|'site'|'lookbook'|'feed'|'avatar'|'club'} opts.kind
 * @param {string} [opts.refId]  e.g. productId or collectionId
 * @param {string} [opts.alt]
 * @returns {Promise<{ id, key, url, asset }>}
 */
export async function uploadImage(file, { kind, refId, alt } = {}) {
  if (!file) throw new Error('file required');
  if (!kind) throw new Error('kind required');

  if (!firebaseAuth) throw new Error('Auth not configured');
  const user = firebaseAuth.currentUser;
  if (!user) throw new Error('sign in first');
  const idToken = await user.getIdToken();

  const form = new FormData();
  form.append('file', file);
  form.append('kind', kind);
  form.append('ownerId', user.uid);
  if (refId) form.append('refId', refId);

  const res = await fetch(WORKER_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${idToken}` },
    body: form,
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`upload failed (${res.status}): ${t}`);
  }
  const { url, key } = await res.json();

  // Register in /mediaAssets
  const { asset } = await api('/api/admin/media', {
    method: 'POST',
    body: {
      key,
      workerUrl: url,
      mime: file.type,
      sizeBytes: file.size,
      alt: alt ?? null,
    },
  });

  return { id: asset.id, key, url, asset };
}
