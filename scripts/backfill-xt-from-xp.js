// Backfill XT for every user who already has XP but no wallet/xt doc.
// Conservative rule: 1 XT per 50 XP earned. Writes wallet/xt + a single
// ledger entry tagged 'backfill_from_xp' so admins can trace it.
//
// Run: GOOGLE_APPLICATION_CREDENTIALS=... node scripts/backfill-xt-from-xp.js
// Re-running is safe — the script skips users who already have a wallet.

import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.applicationDefault() });
}
const db = admin.firestore();
const FV = admin.firestore.FieldValue;

const XP_PER_XT = 50;

(async () => {
  const xpSnap = await db.collection('userXp').get();
  let credited = 0, skipped = 0;

  for (const xpDoc of xpSnap.docs) {
    const uid = xpDoc.id;
    const xp = Number(xpDoc.data()?.xp ?? 0);
    if (xp <= 0) { skipped++; continue; }
    const credit = Math.floor(xp / XP_PER_XT);
    if (credit <= 0) { skipped++; continue; }

    const walletRef = db.collection('users').doc(uid).collection('wallet').doc('xt');
    const existing = await walletRef.get();
    if (existing.exists && (existing.data()?.balance ?? 0) > 0) {
      skipped++;
      continue;
    }

    await db.runTransaction(async (tx) => {
      tx.set(walletRef, {
        balance: credit,
        lifetimeEarned: credit,
        updatedAt: FV.serverTimestamp(),
      }, { merge: true });
      const ledgerDoc = db
        .collection('users').doc(uid).collection('xtLedger').doc();
      tx.set(ledgerDoc, {
        delta: credit,
        source: 'backfill_from_xp',
        note: `Backfill: ${xp} XP × (1 XT / ${XP_PER_XT} XP) = ${credit} XT`,
        at: FV.serverTimestamp(),
      });
    });

    console.log(`  ${uid.slice(0, 12)}… +${credit} XT (from ${xp} XP)`);
    credited++;
  }

  console.log(`\nDone. ${credited} users credited, ${skipped} skipped.`);
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
