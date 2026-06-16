const BASE = (import.meta.env.VITE_R2_PUBLIC_BASE ?? '').replace(/\/$/, '');

/**
 * Build a public URL for an R2 object key. `variant` is reserved for future
 * Cloudflare Images transformations (e.g. ?w=600&f=avif).
 */
export function buildImageUrl(key, variant) {
  if (!key) return '';
  const base = `${BASE}/${key}`;
  if (!variant) return base;
  // Placeholder for Cloudflare Image Resizing query params
  const params = new URLSearchParams();
  if (variant === 'thumb')  params.set('w', '240');
  if (variant === 'card')   params.set('w', '600');
  if (variant === 'detail') params.set('w', '1200');
  if (variant === 'full')   params.set('w', '2000');
  return `${base}?${params.toString()}`;
}
