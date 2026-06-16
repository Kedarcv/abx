// Denormalize each product's front + back image URLs onto the parent /products/{id}
// doc as imageUrlFront/imageUrlBack. The Flutter app can then render the back-
// image toggle without a second Firestore round-trip per product.
//
// Run: GOOGLE_APPLICATION_CREDENTIALS=... node scripts/denormalize-image-urls.js
// Idempotent.

import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.applicationDefault() });
}
const db = admin.firestore();
const FV = admin.firestore.FieldValue;

(async () => {
  const snap = await db.collection('products').get();
  let updated = 0;

  for (const doc of snap.docs) {
    const data = doc.data();
    const imgs = await doc.ref.collection('images').orderBy('sortOrder').get();
    if (imgs.empty) continue;

    let frontUrl = null, backUrl = null;
    for (const i of imgs.docs) {
      const { mediaId, side } = i.data();
      if (!mediaId) continue;
      const m = await db.collection('mediaAssets').doc(mediaId).get();
      if (!m.exists) continue;
      const url = m.data().url;
      if (!url) continue;
      if (side === 'back' && !backUrl) backUrl = url;
      else if (!frontUrl) frontUrl = url;
    }
    if (!frontUrl && !backUrl) continue;

    const patch = {};
    if (frontUrl && data.imageUrlFront !== frontUrl) patch.imageUrlFront = frontUrl;
    if (backUrl && data.imageUrlBack !== backUrl) patch.imageUrlBack = backUrl;
    // Also keep legacy imageUrl pointing at the front so older clients work.
    if (frontUrl && data.imageUrl !== frontUrl) patch.imageUrl = frontUrl;

    if (Object.keys(patch).length) {
      await doc.ref.update({ ...patch, updatedAt: FV.serverTimestamp() });
      updated += 1;
      console.log(` patched ${data.slug ?? doc.id}: front=${!!frontUrl} back=${!!backUrl}`);
    }
  }

  console.log(`\nDone. ${updated}/${snap.size} docs updated.`);
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
