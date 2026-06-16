import { authAdmin, db, FieldValue } from './firebase.js';
import { unauth, forbid } from './response.js';

const ROLE_RANK = {
  customer: 0,
  restaurant: 1,
  fulfillment: 1,
  editor: 2,
  admin: 3,
  superAdmin: 4,
};

// Bootstrap admin allowlist — these Google accounts are ALWAYS superAdmin,
// independent of Firestore content. The first time one of them signs in,
// the server promotes their /users doc + Firebase custom claim so the
// mobile app sees the role too. Keep in sync with
// src/data/adminAllowlist.js on the client.
const ADMIN_BOOTSTRAP_EMAILS = new Set([
  'r245142r@students.msu.ac.zw',
  'ntonya16pm@gmail.com',
].map(e => e.toLowerCase()));

function isBootstrapAdmin(email) {
  return !!email && ADMIN_BOOTSTRAP_EMAILS.has(String(email).trim().toLowerCase());
}

/**
 * Verifies the Firebase ID token from the Authorization header.
 * Reads role from either the custom claim or /users/{uid}.role, matching
 * ABX-Motion's firestore.rules.
 *
 * Returns { user, profile } or null if anonymous/invalid.
 */
export async function getCaller(req) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : null;
  if (!token) return null;

  let decoded;
  try {
    decoded = await authAdmin().verifyIdToken(token);
  } catch (_) {
    return null;
  }

  const uid = decoded.uid;
  const email = decoded.email ?? null;
  let role = decoded.role ?? null;
  let profile = null;

  try {
    const userRef = db().collection('users').doc(uid);
    const userSnap = await userRef.get();
    if (userSnap.exists) {
      profile = userSnap.data();
      if (!role && profile?.role) role = profile.role;
      if (profile?.isBlocked || profile?.is_blocked) return null;
    }

    // Bootstrap allowlist — always promote to superAdmin and persist it so
    // the mobile app + Firestore rules also recognise them.
    if (isBootstrapAdmin(email)) {
      role = 'superAdmin';
      if (!profile || profile.role !== 'superAdmin') {
        await userRef.set({
          email,
          displayName: profile?.displayName ?? decoded.name ?? null,
          role: 'superAdmin',
          updatedAt: FieldValue.serverTimestamp(),
          ...(profile ? {} : { createdAt: FieldValue.serverTimestamp() }),
        }, { merge: true });
        profile = { ...(profile ?? {}), role: 'superAdmin', email };
      }
      if (decoded.role !== 'superAdmin') {
        // Don't await — best-effort, takes effect on next token refresh.
        authAdmin().setCustomUserClaims(uid, { ...(decoded || {}), role: 'superAdmin' })
          .catch(e => console.warn('[auth] bootstrap claim set failed', e));
      }
    }
  } catch (e) {
    console.warn('[auth] profile load failed', e);
  }

  return {
    user: { uid, email },
    profile: { id: uid, ...profile, role: role ?? 'customer' },
  };
}

export function hasRole(profile, required) {
  if (!profile) return false;
  const have = ROLE_RANK[profile.role] ?? 0;
  const need = ROLE_RANK[required] ?? 0;
  return have >= need;
}

export async function requireRole(req, res, required) {
  const caller = await getCaller(req);
  if (!caller) { unauth(res); return null; }
  if (!hasRole(caller.profile, required)) { forbid(res); return null; }
  return caller;
}
