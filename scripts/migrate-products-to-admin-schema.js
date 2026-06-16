// Bring seeded /products docs onto the admin schema so both the admin panel
// and the storefront read them correctly.
//
//   Seed shape (legacy):  { name, priceCents, imageUrl, category, inStock, stockQuantity }
//   Admin shape (canon):  { name, slug, basePriceCents, currency, collectionId,
//                           active, featured, sortOrder, createdAt, updatedAt,
//                           description, imageUrl }
//
// Also:
//   • Creates /storeCollections docs from the set of distinct `category` values.
//   • Creates one /products/{id}/images/{auto} doc per legacy imageUrl (so the
//     mobile app's image resolver finds it) plus the matching /mediaAssets doc.
//
// Run: GOOGLE_APPLICATION_CREDENTIALS=... node scripts/migrate-products-to-admin-schema.js
// Idempotent: re-running only fills in what's missing.

import admin from 'firebase-admin';
import crypto from 'node:crypto';

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.applicationDefault() });
}
const db = admin.firestore();
const FV = admin.firestore.FieldValue;

function slugify(s = '') {
  return String(s).toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

async function migrateCollections() {
  // Collect distinct categories from /products
  const snap = await db.collection('products').get();
  const cats = new Map(); // slug -> name
  for (const d of snap.docs) {
    const cat = d.data().category;
    if (!cat) continue;
    const slug = slugify(cat);
    if (!cats.has(slug)) cats.set(slug, cat);
  }

  let i = 0, created = 0;
  for (const [slug, name] of cats.entries()) {
    const ref = db.collection('storeCollections').doc(slug);
    const cur = await ref.get();
    if (!cur.exists) {
      await ref.set({
        name,
        slug,
        active: true,
        sortOrder: i,
        createdAt: FV.serverTimestamp(),
        updatedAt: FV.serverTimestamp(),
      });
      created += 1;
    } else if (cur.data().active !== true || cur.data().sortOrder === undefined) {
      await ref.update({
        active: cur.data().active ?? true,
        sortOrder: cur.data().sortOrder ?? i,
        updatedAt: FV.serverTimestamp(),
      });
    }
    i += 1;
  }
  console.log(`storeCollections: ${cats.size} distinct categories, ${created} created`);
  return cats;
}

async function migrateProducts(collectionsBySlug) {
  const snap = await db.collection('products').get();
  let updated = 0, imagesCreated = 0, mediaCreated = 0, sort = 0;

  for (const doc of snap.docs) {
    const d = doc.data();
    const patch = {};

    if (!d.slug) patch.slug = slugify(d.name ?? doc.id) || doc.id;
    if (d.basePriceCents === undefined || d.basePriceCents === null) {
      patch.basePriceCents = Number(d.priceCents ?? d.price ?? 0);
    }
    if (!d.currency) patch.currency = 'USD';
    if (d.collectionId === undefined || d.collectionId === null) {
      patch.collectionId = d.category ? slugify(d.category) : null;
    }
    if (d.active === undefined) {
      patch.active = d.inStock === false ? false : true;
    }
    if (d.featured === undefined) patch.featured = false;
    if (d.sortOrder === undefined) patch.sortOrder = sort;
    if (!d.seoTitle) patch.seoTitle = d.name ?? '';
    if (!d.seoDescription) patch.seoDescription = d.description ?? '';

    if (Object.keys(patch).length) {
      await doc.ref.update({ ...patch, updatedAt: FV.serverTimestamp() });
      updated += 1;
    }

    // Ensure a /mediaAssets + /products/{id}/images entry exists so the
    // front-image resolver finds the picture. Skipped if the product already
    // has at least one image row.
    const imgsSnap = await doc.ref.collection('images').limit(1).get();
    const imageUrl = d.imageUrl;
    if (imgsSnap.empty && imageUrl) {
      // Deterministic media id so re-runs don't duplicate
      const mediaId = `legacy-${doc.id}`;
      const mediaRef = db.collection('mediaAssets').doc(mediaId);
      if (!(await mediaRef.get()).exists) {
        await mediaRef.set({
          url: imageUrl,
          alt: d.name ?? '',
          kind: 'image',
          source: 'r2',
          createdAt: FV.serverTimestamp(),
        });
        mediaCreated += 1;
      }
      await doc.ref.collection('images').add({
        mediaId,
        side: 'front',
        sortOrder: 0,
        createdAt: FV.serverTimestamp(),
      });
      imagesCreated += 1;
    }

    sort += 1;
  }

  console.log(`products: ${snap.size} docs · ${updated} patched · ${imagesCreated} images · ${mediaCreated} media assets`);
}

(async () => {
  console.log('Migrating legacy /products to admin schema…');
  const cats = await migrateCollections();
  await migrateProducts(cats);
  console.log('Done.');
  process.exit(0);
})().catch(e => {
  console.error(e);
  process.exit(1);
});
