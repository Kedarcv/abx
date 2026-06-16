// Delete every /products doc (and its variants/images subcollections), plus
// every /storeCollections doc, plus every /mediaAssets doc that's a 'legacy-*'
// id created by the prior migration. Used to clear seed data before re-running
// scripts/seed-products.mjs.
//
// Run: GOOGLE_APPLICATION_CREDENTIALS=... node scripts/wipe-products.js

import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.applicationDefault() });
}
const db = admin.firestore();

async function deleteCollection(colRef) {
  const snap = await colRef.get();
  await Promise.all(snap.docs.map(d => d.ref.delete()));
  return snap.size;
}

async function wipeProducts() {
  const snap = await db.collection('products').get();
  let total = 0, subDocs = 0;
  for (const doc of snap.docs) {
    subDocs += await deleteCollection(doc.ref.collection('images'));
    subDocs += await deleteCollection(doc.ref.collection('variants'));
    await doc.ref.delete();
    total += 1;
  }
  console.log(`products wiped: ${total} docs (${subDocs} subcollection docs)`);
}

async function wipeStoreCollections() {
  const snap = await db.collection('storeCollections').get();
  await Promise.all(snap.docs.map(d => d.ref.delete()));
  console.log(`storeCollections wiped: ${snap.size} docs`);
}

async function wipeLegacyMedia() {
  // Only delete the synthetic 'legacy-*' media entries the prior migration
  // created. Real R2-uploaded media keeps its hash id.
  const snap = await db.collection('mediaAssets').get();
  let n = 0;
  for (const d of snap.docs) {
    if (d.id.startsWith('legacy-')) { await d.ref.delete(); n += 1; }
  }
  console.log(`mediaAssets (legacy-*) wiped: ${n} docs`);
}

(async () => {
  await wipeProducts();
  await wipeStoreCollections();
  await wipeLegacyMedia();
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
