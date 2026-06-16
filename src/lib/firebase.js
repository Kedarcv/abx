import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// These keys are PUBLIC by design — they identify the Firebase project to the
// browser SDK. Security comes from Firestore Rules + Auth, not from hiding
// these values. They live in Vite's VITE_FB_* env so they ship in the bundle.
const config = {
  apiKey:            import.meta.env.VITE_FB_API_KEY,
  authDomain:        import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FB_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FB_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FB_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FB_APP_ID,
};

export const firebaseConfigured = !!(config.apiKey && config.projectId);

if (!firebaseConfigured) {
  console.warn(
    '[firebase] VITE_FB_* env vars are missing — auth/firestore features are disabled. ' +
    'Set them in .env (and in Vercel project env) to enable sign-in.',
  );
}

// initializeApp throws on an invalid config — only call it when we have one.
export const firebaseApp = firebaseConfigured
  ? (getApps().length ? getApp() : initializeApp(config))
  : null;

export const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null;
export const firestore    = firebaseApp ? getFirestore(firebaseApp) : null;

// Optional local emulator support: set VITE_FB_AUTH_EMULATOR=http://localhost:9099
if (firebaseAuth && import.meta.env.VITE_FB_AUTH_EMULATOR) {
  try { connectAuthEmulator(firebaseAuth, import.meta.env.VITE_FB_AUTH_EMULATOR, { disableWarnings: true }); }
  catch { /* already connected */ }
}
