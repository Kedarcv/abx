// GET   /api/admin/app/xt-wallets/[uid]              — read wallet
// PATCH /api/admin/app/xt-wallets/[uid]   { delta, reason } — atomic adjust
//
// Uses the SAME Firestore layout the mobile app reads:
//   /users/{uid}/wallet/xt           → { balance, lifetimeEarned, updatedAt }
//   /users/{uid}/xtLedger/{txId}     → { delta, source, note, at }
import { applyCors } from '../../../_lib/cors.js';
import { methodGuard, readJson, ok, notFound, badReq, serverError } from '../../../_lib/response.js';
import { requireRole } from '../../../_lib/auth.js';
import { db, FieldValue, toJson } from '../../../_lib/firebase.js';
import { audit } from '../../../_lib/audit.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (!methodGuard(req, res, ['GET','PATCH'])) return;
  const caller = await requireRole(req, res, 'admin');
  if (!caller) return;
  const uid = req.query.uid;
  if (!uid) return badReq(res, 'uid required');

  try {
    const walletRef = db().collection('users').doc(uid).collection('wallet').doc('xt');
    const ledgerCol = db().collection('users').doc(uid).collection('xtLedger');

    if (req.method === 'GET') {
      const snap = await walletRef.get();
      if (!snap.exists) {
        // Surface an empty wallet so the admin can credit a user who has
        // never earned XT yet.
        return ok(res, { wallet: { id: 'xt', balance: 0, lifetimeEarned: 0 } });
      }
      return ok(res, { wallet: toJson(snap) });
    }

    const { delta, reason } = await readJson(req);
    if (!Number.isFinite(delta) || delta === 0) return badReq(res, 'delta must be a non-zero number');
    if (Math.abs(delta) > 1_000_000) return badReq(res, 'delta out of range');

    let before = 0, lifetimeBefore = 0;
    const result = await db().runTransaction(async (tx) => {
      const snap = await tx.get(walletRef);
      const current = (snap.exists ? snap.data().balance : 0) || 0;
      const lifetime = (snap.exists ? snap.data().lifetimeEarned : 0) || 0;
      before = current;
      lifetimeBefore = lifetime;
      const next = current + delta;
      if (next < 0) throw new Error('insufficient balance');
      tx.set(
        walletRef,
        {
          balance: next,
          // Only count positive credits toward lifetimeEarned.
          lifetimeEarned: lifetime + (delta > 0 ? delta : 0),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
      return next;
    });

    await ledgerCol.add({
      delta,
      source: reason ?? 'admin_adjust',
      note: reason ?? 'admin_adjust',
      actorId: caller.user.uid,
      at: FieldValue.serverTimestamp(),
    });

    await audit({
      req, actor: caller, action: 'xt_wallet.adjust',
      entityType: 'xt_wallet', entityId: uid,
      before: { balance: before, lifetimeEarned: lifetimeBefore },
      after: { balance: result, delta, reason },
    });
    return ok(res, { balance: result, delta });
  } catch (e) {
    return serverError(res, e);
  }
}
