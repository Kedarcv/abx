 import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth as adminGetAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { env } from './env.js';

let _app;

function loadServiceAccount() {
  const b64 = env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  const raw = env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!b64 && !raw) {
    throw new Error('Set FIREBASE_SERVICE_ACCOUNT_BASE64 or FIREBASE_SERVICE_ACCOUNT_JSON');
  }
  const json = b64
    ? Buffer.from(b64, 'base64').toString('utf8')
    : raw;
  try {
    return JSON.parse(json);
  } catch (e) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_* is not valid JSON: ' + e.message);
  }
}

export function firebaseApp() {
  if (_app) return _app;
  if (getApps().length) {
    _app = getApps()[0];
    return _app;
  }
  const sa = loadServiceAccount();
  _app = initializeApp({
    credential: cert(sa),
    projectId: sa.project_id || env.FIREBASE_PROJECT_ID,
  });
  return _app;
}

export function db() {
  const app = firebaseApp();
  return getFirestore(app);
}

export function authAdmin() {
  const app = firebaseApp();
  return adminGetAuth(app);
}

export { FieldValue, Timestamp };

// Helpers ------------------------------------------------------------

/** Strip Firestore Timestamps/refs into JSON-safe shapes. */
export function toJson(doc) {
  if (!doc) return null;
  const data = doc.data ? doc.data() : doc;
  const id = doc.id ?? data?.id;
  const out = { id, ...serialise(data) };
  return out;
}

function serialise(v) {
  if (v == null) return v;
  if (v instanceof Timestamp) return v.toDate().toISOString();
  if (Array.isArray(v)) return v.map(serialise);
  if (typeof v === 'object') {
    if (v._seconds !== undefined && v._nanoseconds !== undefined) {
      return new Date(v._seconds * 1000 + v._nanoseconds / 1e6).toISOString();
    }
    const out = {};
    for (const [k, val] of Object.entries(v)) out[k] = serialise(val);
    return out;
  }
  return v;
}

/** Returns the next sequential order number using an atomic counter doc. */
export async function nextOrderNumber() {
  const ref = db().collection('counters').doc('orderNumber');
  return db().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const current = (snap.exists ? snap.data().value : 1000) || 1000;
    const next = current + 1;
    tx.set(ref, { value: next }, { merge: true });
    return next;
  });
}
