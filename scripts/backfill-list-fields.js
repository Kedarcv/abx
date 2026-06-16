// One-time backfill so admin list pages (which orderBy createdAt / sortOrder
// and filter by active) don't silently exclude docs missing those fields.
//
// Run: GOOGLE_APPLICATION_CREDENTIALS=... node scripts/backfill-list-fields.js
//
// Idempotent: only writes the fields that are missing on each doc.

import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.applicationDefault() });
}
const db = admin.firestore();
const FV = admin.firestore.FieldValue;

const COLLECTIONS = [
  // storefront
  'products',
  // mobile app
  'promos', 'promoCodes', 'challenges', 'workouts', 'clubs',
  'volunteerEvents', 'announcements', 'rewards', 'badges', 'districts',
  'marketplace', 'prizeDraws', 'coinPackages', 'heatmapZones', 'peakPay',
  'categories', 'restaurants', 'drivers',
];

let totalUpdates = 0;

async function backfillCollection(name) {
  const snap = await db.collection(name).get();
  if (snap.empty) {
    console.log(`  ${name.padEnd(20)} (empty, skipped)`);
    return;
  }
  let updated = 0;
  let i = 0;
  const batch = db.batch();
  const writes = [];

  for (const doc of snap.docs) {
    const d = doc.data();
    const patch = {};

    if (d.createdAt === undefined || d.createdAt === null) {
      patch.createdAt = FV.serverTimestamp();
    }
    if (d.updatedAt === undefined || d.updatedAt === null) {
      patch.updatedAt = FV.serverTimestamp();
    }
    if (d.sortOrder === undefined || d.sortOrder === null) {
      patch.sortOrder = i;
    }
    // products: many admin queries filter by active==true. Mirror inStock if
    // present, otherwise default to true so the doc is visible.
    if (name === 'products' && d.active === undefined) {
      patch.active = d.inStock === false ? false : true;
    }

    if (Object.keys(patch).length) {
      writes.push(doc.ref.update(patch));
      updated += 1;
    }
    i += 1;
  }

  await Promise.all(writes);
  totalUpdates += updated;
  console.log(`  ${name.padEnd(20)} ${snap.size.toString().padStart(4)} docs · ${updated} patched`);
}

async function backfillUsers() {
  // Users come from auth, not seed data. Most lack createdAt because they
  // were created by Firebase Auth before we started writing /users docs.
  const snap = await db.collection('users').get();
  if (snap.empty) return;
  let updated = 0;
  const writes = [];

  for (const doc of snap.docs) {
    const d = doc.data();
    const patch = {};
    if (!d.createdAt) {
      // Use auth creationTime if available; fallback to now.
      try {
        const u = await admin.auth().getUser(doc.id);
        const created = u.metadata?.creationTime
          ? admin.firestore.Timestamp.fromDate(new Date(u.metadata.creationTime))
          : FV.serverTimestamp();
        patch.createdAt = created;
        if (u.email && !d.email) patch.email = u.email;
        if (u.displayName && !d.displayName && !d.name) patch.displayName = u.displayName;
      } catch {
        patch.createdAt = FV.serverTimestamp();
      }
    }
    if (Object.keys(patch).length) {
      writes.push(doc.ref.update(patch));
      updated += 1;
    }
  }
  await Promise.all(writes);
  totalUpdates += updated;
  console.log(`  ${'users'.padEnd(20)} ${snap.size.toString().padStart(4)} docs · ${updated} patched`);
}

(async () => {
  console.log('Backfilling admin list fields…');
  for (const c of COLLECTIONS) await backfillCollection(c);
  await backfillUsers();
  console.log(`\nDone. ${totalUpdates} doc(s) updated.`);
  process.exit(0);
})().catch(e => {
  console.error(e);
  process.exit(1);
});
