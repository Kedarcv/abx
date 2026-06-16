// Rename "ABX V2 Biker Jacket" -> "Abili-T V00.2 BykR" and reprice to $400.
// Keeps the slug stable so existing carts/orders still resolve.
//
// Run: GOOGLE_APPLICATION_CREDENTIALS=... node scripts/update-v2-jacket.js

import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.applicationDefault() });
}
const db = admin.firestore();
const FV = admin.firestore.FieldValue;

(async () => {
  const snap = await db.collection('products')
    .where('slug', '==', 'abx-v2-biker-jacket').limit(1).get();
  if (snap.empty) { console.error('not found'); process.exit(1); }
  const doc = snap.docs[0];
  const ref = doc.ref;

  await ref.update({
    name: 'Abili-T V00.2 BykR',
    basePriceCents: 40000,
    priceCents: 40000,
    seoTitle: 'Abili-T V00.2 BykR',
    updatedAt: FV.serverTimestamp(),
  });
  // Also reprice any variants
  const vars = await ref.collection('variants').get();
  for (const v of vars.docs) {
    await v.ref.update({
      priceCents: 40000,
      updatedAt: FV.serverTimestamp(),
    });
  }
  console.log('✓ updated', doc.id, '→ Abili-T V00.2 BykR @ $400');
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
