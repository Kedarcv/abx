import { create } from 'zustand';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseAuth, firestore } from '../lib/firebase.js';
import { isBootstrapAdmin } from '../data/adminAllowlist.js';

/** Role rank — keep in sync with api/_lib/auth.js */
const ROLE_RANK = {
  customer: 0,
  restaurant: 1,
  fulfillment: 1,
  editor: 2,
  admin: 3,
  superAdmin: 4,
};

function hasRoleFn(role, required) {
  return (ROLE_RANK[role] ?? 0) >= (ROLE_RANK[required] ?? 0);
}

export const useAuth = create((set, get) => ({
  user: null,
  profile: null,
  role: 'customer',
  loading: true,

  hasRole: (required) => hasRoleFn(get().role, required),
  isStaff: () => hasRoleFn(get().role, 'fulfillment'),
  isAdmin: () => hasRoleFn(get().role, 'admin'),

  init: () => {
    if (!firebaseAuth) {
      set({ loading: false });
      return () => {};
    }
    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user) {
        set({ user: null, profile: null, role: 'customer', loading: false });
        return;
      }
      let profile = null;
      let role = 'customer';
      try {
        const ref = doc(firestore, 'users', user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          profile = snap.data();
          role = profile.role || 'customer';
        }
        // Custom claims win if higher
        const tokenResult = await user.getIdTokenResult();
        if (tokenResult.claims.role
            && (ROLE_RANK[tokenResult.claims.role] ?? 0) > (ROLE_RANK[role] ?? 0)) {
          role = tokenResult.claims.role;
        }
        // Bootstrap admin allowlist — always wins
        if (isBootstrapAdmin(user.email)) {
          role = 'superAdmin';
          // Make sure the /users doc reflects this so the mobile app
          // (which reads users/{uid}.role) recognizes the account too.
          if (!profile || profile.role !== 'superAdmin') {
            await setDoc(ref, {
              email: user.email,
              displayName: user.displayName ?? profile?.displayName ?? null,
              role: 'superAdmin',
              updatedAt: serverTimestamp(),
              ...(snap.exists() ? {} : { createdAt: serverTimestamp() }),
            }, { merge: true });
          }
        }
      } catch (e) {
        console.warn('[auth] profile load failed', e);
      }
      set({ user, profile, role, loading: false });
    });
    return unsub;
  },

  signIn: async (email, password) => {
    if (!firebaseAuth) throw new Error('Authentication is not configured yet.');
    const { user } = await signInWithEmailAndPassword(firebaseAuth, email, password);
    return user;
  },

  signUp: async (email, password, displayName) => {
    if (!firebaseAuth || !firestore) throw new Error('Authentication is not configured yet.');
    const { user } = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    if (displayName) {
      try { await updateProfile(user, { displayName }); } catch { /* ignore */ }
    }
    await setDoc(doc(firestore, 'users', user.uid), {
      email,
      displayName: displayName ?? null,
      role: isBootstrapAdmin(email) ? 'superAdmin' : 'customer',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return user;
  },

  signInWithGoogle: async () => {
    if (!firebaseAuth || !firestore) throw new Error('Authentication is not configured yet.');
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const { user } = await signInWithPopup(firebaseAuth, provider);

    // Ensure a /users doc exists for new Google sign-ups.
    const ref = doc(firestore, 'users', user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        email: user.email,
        displayName: user.displayName ?? null,
        photoURL: user.photoURL ?? null,
        provider: 'google',
        role: isBootstrapAdmin(user.email) ? 'superAdmin' : 'customer',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else if (isBootstrapAdmin(user.email) && snap.data().role !== 'superAdmin') {
      await setDoc(ref, { role: 'superAdmin', updatedAt: serverTimestamp() }, { merge: true });
    }
    return user;
  },

  resetPassword: (email) => {
    if (!firebaseAuth) return Promise.reject(new Error('Authentication is not configured yet.'));
    return sendPasswordResetEmail(firebaseAuth, email);
  },

  signOut: () => firebaseAuth ? fbSignOut(firebaseAuth) : Promise.resolve(),
}));
