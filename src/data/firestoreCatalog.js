// Firestore-backed catalog loader.
//
// Reads /products + /storeCollections from the same Firebase project the
// mobile app uses, normalises into the same shape `data/catalog.js`
// exposes, and resolves front/back images via the /products/{id}/images
// subcollection (linked to /mediaAssets).
//
// If Firestore is unconfigured or returns empty, the caller can fall back
// to the bundled static catalog so the storefront always renders.

import {
  collection, getDocs, query, where, limit, documentId,
} from 'firebase/firestore';
import { firestore } from '../lib/firebase.js';

const COLLECTIONS_COLLECTION = 'storeCollections';
const PRODUCTS_COLLECTION    = 'products';
const MEDIA_COLLECTION       = 'mediaAssets';

/**
 * Returns { collections, products } in the same shape as data/catalog.js.
 * Products always carry .front and .back URLs (resolved from mediaAssets).
 */
export async function loadCatalogFromFirestore() {
  if (!firestore) return null;

  // 1) Collections — fetch by `active`, sort client-side to avoid needing
  // a composite index on (active, sortOrder).
  const colSnap = await getDocs(
    query(collection(firestore, COLLECTIONS_COLLECTION), where('active', '==', true))
  );
  const collections = colSnap.docs
    .map(d => ({
      id: d.id, slug: d.data().slug ?? d.id, name: d.data().name, sortOrder: d.data().sortOrder ?? 0,
    }))
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  // 2) Active products — same approach
  const prodSnap = await getDocs(
    query(collection(firestore, PRODUCTS_COLLECTION), where('active', '==', true))
  );
  if (prodSnap.empty) return { collections, products: [] };

  // 3) Pull each product's images subcollection in parallel
  const sortedProductDocs = [...prodSnap.docs].sort((a, b) =>
    (a.data().sortOrder ?? 0) - (b.data().sortOrder ?? 0)
  );
  const products = await Promise.all(sortedProductDocs.map(async d => {
    const data = d.data();
    let front = null, back = null;
    try {
      const imgs = await getDocs(
        collection(firestore, PRODUCTS_COLLECTION, d.id, 'images')
      );
      imgs.docs.sort((a, b) => (a.data().sortOrder ?? 0) - (b.data().sortOrder ?? 0));
      const mediaIds = imgs.docs.map(im => im.data().mediaId).filter(Boolean);
      const mediaById = await loadMediaBatch(mediaIds);
      for (const im of imgs.docs) {
        const m = mediaById.get(im.data().mediaId);
        if (!m) continue;
        const url = m.url ?? null;
        if (!url) continue;
        if (im.data().side === 'back' && !back) back = url;
        else if (!front) front = url;
      }
    } catch (e) {
      console.warn('[catalog] image load failed for', d.id, e?.message);
    }

    // Fall back to denormalised imageUrl (the field the mobile app reads)
    if (!front && data.imageUrl) front = data.imageUrl;

    return {
      id: d.id,
      slug: data.slug ?? d.id,
      name: data.name ?? '',
      tagline: data.description ?? '',
      priceCents: data.basePriceCents ?? 0,
      currency: data.currency ?? 'USD',
      collectionId: data.collectionId ?? null,
      front, back: back ?? front,
      featured: !!data.featured,
    };
  }));

  return { collections, products: products.filter(p => p.front) };
}

async function loadMediaBatch(ids) {
  const map = new Map();
  const unique = [...new Set(ids)];
  if (!unique.length) return map;

  // Firestore `in` query is capped at 30 — chunk if needed.
  const chunks = [];
  for (let i = 0; i < unique.length; i += 30) chunks.push(unique.slice(i, i + 30));

  await Promise.all(chunks.map(async chunk => {
    const snap = await getDocs(
      query(collection(firestore, MEDIA_COLLECTION), where(documentId(), 'in', chunk))
    );
    for (const d of snap.docs) map.set(d.id, d.data());
  }));
  return map;
}

/** Look up a single product by slug, with images resolved. */
export async function loadProductBySlug(slug) {
  if (!firestore || !slug) return null;
  const snap = await getDocs(
    query(collection(firestore, PRODUCTS_COLLECTION), where('slug', '==', slug), limit(1))
  );
  if (snap.empty) return null;
  const d = snap.docs[0];
  const data = d.data();

  let front = null, back = null;
  const imgs = await getDocs(
    collection(firestore, PRODUCTS_COLLECTION, d.id, 'images')
  );
  // Sort client-side by sortOrder
  imgs.docs.sort((a, b) => (a.data().sortOrder ?? 0) - (b.data().sortOrder ?? 0));
  const mediaIds = imgs.docs.map(im => im.data().mediaId).filter(Boolean);
  const mediaById = await loadMediaBatch(mediaIds);
  for (const im of imgs.docs) {
    const m = mediaById.get(im.data().mediaId);
    if (!m?.url) continue;
    if (im.data().side === 'back' && !back) back = m.url;
    else if (!front) front = m.url;
  }
  if (!front && data.imageUrl) front = data.imageUrl;

  return {
    id: d.id,
    slug: data.slug ?? d.id,
    name: data.name ?? '',
    tagline: data.description ?? '',
    priceCents: data.basePriceCents ?? 0,
    currency: data.currency ?? 'USD',
    collectionId: data.collectionId ?? null,
    front, back: back ?? front,
  };
}
