#!/usr/bin/env node
/**
 * One-time seed: pushes the hardcoded PRODUCTS_DATA + images from
 * src/assets/Images into Firestore (docucraft-cd41b) and Cloudflare R2
 * (ABX-Motion-uploads) via the existing tyw-upload-image Worker.
 *
 * No R2 access keys needed — uploads use a Firebase custom token signed
 * with the service account, exchanged for an ID token, then sent to the
 * Worker just like the browser does.
 *
 * Run after firestore.rules are deployed:
 *   npm run seed:products
 *
 * Required env (loaded from .env via dotenv):
 *   FIREBASE_SERVICE_ACCOUNT_BASE64   (or FIREBASE_SERVICE_ACCOUNT_JSON)
 *   FIREBASE_WEB_API_KEY               (the public web SDK apiKey)
 *   SEED_ADMIN_UID                     (a uid with role=admin/editor/superAdmin)
 *   R2_UPLOAD_ENDPOINT (optional, defaults to the production Worker)
 *   R2_PUBLIC_BASE     (optional, defaults to the production R2 public base)
 */
import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mime from 'mime-types';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const imagesDir = path.join(repoRoot, 'src/assets/Images');

function need(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

// ---- Firebase Admin ------------------------------------------------
const saRaw = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64
  ? Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8')
  : process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
if (!saRaw) throw new Error('Set FIREBASE_SERVICE_ACCOUNT_BASE64 or _JSON');
const sa = JSON.parse(saRaw);
if (!getApps().length) initializeApp({ credential: cert(sa) });
const db = getFirestore();
const auth = getAuth();

const WEB_API_KEY = need('FIREBASE_WEB_API_KEY');
const SEED_UID = need('SEED_ADMIN_UID');
const WORKER_URL = process.env.R2_UPLOAD_ENDPOINT
  ?? 'https://tyw-upload-image.r245142r.workers.dev/upload';
const PUBLIC_BASE = process.env.R2_PUBLIC_BASE
  ?? 'https://pub-d9633fd2667448538cf6d2f18f8ed07d.r2.dev';

// When SEED_IMAGES_SOURCE=public, skip the R2 Worker entirely and assume the
// images are served from the Vercel build's /public/products/ directory.
// SEED_PUBLIC_BASE_URL must be set in that case (e.g. https://abxmotionio-omega.vercel.app)
const PUBLIC_IMAGE_MODE = process.env.SEED_IMAGES_SOURCE === 'public';
const PUBLIC_IMAGE_BASE = (process.env.SEED_PUBLIC_BASE_URL || 'https://abxmotionio-omega.vercel.app').replace(/\/$/, '');

async function ensureAdmin() {
  // Make sure the seeding uid has at least 'editor' role.
  const userSnap = await db.collection('users').doc(SEED_UID).get();
  const role = userSnap.exists ? userSnap.data().role : null;
  if (!['editor', 'admin', 'superAdmin'].includes(role)) {
    await db.collection('users').doc(SEED_UID).set({
      role: 'superAdmin',
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    console.log(`Granted superAdmin to ${SEED_UID}`);
  }
  await auth.setCustomUserClaims(SEED_UID, { role: 'superAdmin' });
}

async function mintIdToken() {
  const customToken = await auth.createCustomToken(SEED_UID, { role: 'superAdmin' });
  const exchange = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${WEB_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: customToken, returnSecureToken: true }),
    },
  );
  if (!exchange.ok) throw new Error(`token exchange ${exchange.status}: ${await exchange.text()}`);
  const { idToken } = await exchange.json();
  return idToken;
}

const COLLECTIONS = [
  { slug: 'striit-fit',  name: 'Striit-Fit®',  sortOrder: 0 },
  { slug: 'abx-fiit',    name: 'ABX Fiit®',    sortOrder: 1 },
  { slug: 'xtxcode',     name: 'XTXCODE®',     sortOrder: 2 },
];

const PRODUCTS = [
  { collection: 'striit-fit', slug: 'abx-v1-biker-jacket',     name: 'ABX V1 Biker Jacket',    price: 45000, front: 'bikerjacketfront.png',          back: 'bikerjacketback.png' },
  { collection: 'striit-fit', slug: 'abx-v2-biker-jacket',     name: 'ABX V2 Biker Jacket',    price: 38500, front: 'bikerjacket2front.png',         back: 'bikerjacket2back.png' },
  { collection: 'striit-fit', slug: 'abx-cyberhat-1',          name: 'ABX Cyberhat 1',         price:  4500, front: 'abxcyberhat1front.png',         back: 'abxcyberhat1back.png' },
  { collection: 'striit-fit', slug: 'urban-stealth-cap',       name: 'Urban Stealth Cap',      price:  5000, front: 'capfront.png',                  back: 'capback.png' },
  { collection: 'striit-fit', slug: 'abx-move4ward-xpants',    name: 'ABX Move4ward X-Pants',  price:  9000, front: 'pants1front.png',               back: 'pants1back.png' },
  { collection: 'striit-fit', slug: 'abx-cyber-backpack',      name: 'ABX Cyber BackPack',     price: 14000, front: 'abxcyberpackerfront.png',       back: 'abxcyberpackerback.png' },
  { collection: 'abx-fiit',   slug: 'abx-fiit-track-1s',       name: 'ABX Fiit Track 1s',       price: 12000, front: 'abxfiitsneakersfront.png',       back: 'abxfiitsneakersback.png' },
  { collection: 'abx-fiit',   slug: 'abx-fiit-track-sleeves',  name: 'ABX Fiit Track Sleeves',  price:  4000, front: 'abxfiitrunningtshirtfront.png',  back: 'abxfiitrunningtshirtback.png' },
  { collection: 'abx-fiit',   slug: 'abx-fiit-track-leggings', name: 'ABX Fiit Track Leggings', price:  6000, front: 'abxfiitleggingsfront.png',       back: 'abxfiitleggingsback.png' },
  { collection: 'abx-fiit',   slug: 'abx-fiit-track-crop',     name: 'ABX Fiit Track Crop Top', price: 13500, front: 'abxfiitworkoutcropfront.png',    back: 'abxfiitworkoutcropback.png' },
  { collection: 'abx-fiit',   slug: 'abx-track-vision-pros',   name: 'ABX Track Vision Pros',   price:  5500, front: 'abxtrackvisionprosfront.png',    back: 'abxtrackvisionprosback.png' },
  { collection: 'abx-fiit',   slug: 'abx-forward-motion-shorts', name: 'ABX Forward MotionShorts', price: 8000, front: 'shorts1front.png',           back: 'shorts1back.png' },
  { collection: 'xtxcode',    slug: 'xtx-code',                name: 'XTX Code',                price:  9000, front: 'xtxverityfront.png',             back: 'xtxverityback.png' },
  { collection: 'xtxcode',    slug: 'xtx-pro-code',            name: 'XTX Pro Code',            price: 16000, front: 'xtxproverityfront.png',          back: 'xtxproverityback.png' },
  { collection: 'xtxcode',    slug: 'xtx-code-pro-sounds',     name: 'XTX Code Pro Sounds',     price: 24500, front: 'xtxcodeprosoundsfront.png',      back: 'xtxcodeprosoundsback.png' },
];

async function uploadViaWorker(idToken, localName, productId, variantId, side) {
  const localPath = path.join(imagesDir, localName);
  const buf = await fs.readFile(localPath);
  const ext = path.extname(localName).toLowerCase().slice(1) || 'png';
  const contentType = mime.lookup(ext) || 'image/png';

  if (PUBLIC_IMAGE_MODE) {
    // Skip the Worker. Image is expected to live in /public/products/<localName>
    // and served by Vercel. Just register a /mediaAssets entry.
    const url = `${PUBLIC_IMAGE_BASE}/products/${localName}`;
    const ref = await db.collection('mediaAssets').add({
      bucket: 'vercel-public',
      key: `products/${localName}`, url,
      mime: contentType,
      sizeBytes: buf.byteLength,
      alt: localName.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
      uploadedBy: SEED_UID,
      createdAt: FieldValue.serverTimestamp(),
    });
    return { id: ref.id, key: `products/${localName}`, url };
  }

  const form = new FormData();
  form.append('file', new Blob([buf], { type: contentType }), localName);
  form.append('kind', 'product');
  form.append('ownerId', SEED_UID);
  form.append('refId', `${productId}/${variantId}/${side}`);

  const res = await fetch(WORKER_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${idToken}` },
    body: form,
  });
  if (!res.ok) {
    throw new Error(`worker upload ${res.status}: ${await res.text()}`);
  }
  const { url, key } = await res.json();

  // Register in /mediaAssets
  const ref = await db.collection('mediaAssets').add({
    bucket: 'ABX-Motion-uploads',
    key, url,
    mime: contentType,
    sizeBytes: buf.byteLength,
    alt: localName.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
    uploadedBy: SEED_UID,
    createdAt: FieldValue.serverTimestamp(),
  });
  return { id: ref.id, key, url };
}

async function ensureCollection(c) {
  const dup = await db.collection('storeCollections').where('slug', '==', c.slug).limit(1).get();
  if (!dup.empty) return { id: dup.docs[0].id, ...dup.docs[0].data() };
  const ref = await db.collection('storeCollections').add({
    ...c, active: true,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return { id: ref.id, ...c };
}

async function main() {
  await ensureAdmin();
  let idToken = null;
  if (PUBLIC_IMAGE_MODE) {
    console.log(`Using SEED_IMAGES_SOURCE=public (base ${PUBLIC_IMAGE_BASE}). Skipping R2 Worker.`);
  } else {
    console.log('Minting ID token…');
    idToken = await mintIdToken();
  }

  console.log('Seeding storeCollections…');
  const collByKey = {};
  for (const c of COLLECTIONS) collByKey[c.slug] = await ensureCollection(c);

  console.log('Seeding products + variants + images via Worker…');
  for (const p of PRODUCTS) {
    const dup = await db.collection('products').where('slug', '==', p.slug).limit(1).get();
    if (!dup.empty) { console.log(' - skip (exists):', p.slug); continue; }

    const productRef = await db.collection('products').add({
      slug: p.slug,
      name: p.name,
      collectionId: collByKey[p.collection].id,
      // Legacy mirror fields so ABX-Motion mobile app's existing
      // shop_repository.dart keeps working without changes:
      category: collByKey[p.collection].name,
      priceCents: p.price,
      inStock: true,
      // Storefront fields
      basePriceCents: p.price,
      currency: 'USD',
      active: true,
      sortOrder: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    const variantRef = await productRef.collection('variants').add({
      sku: p.slug.toUpperCase(),
      priceCents: p.price,
      stock: 25,
      lowStockThreshold: 5,
      active: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    const front = await uploadViaWorker(idToken, p.front, productRef.id, variantRef.id, 'front');
    const back  = await uploadViaWorker(idToken, p.back,  productRef.id, variantRef.id, 'back');

    await productRef.collection('images').add({
      mediaId: front.id, variantId: variantRef.id, side: 'front', sortOrder: 0,
      createdAt: FieldValue.serverTimestamp(),
    });
    await productRef.collection('images').add({
      mediaId: back.id, variantId: variantRef.id, side: 'back', sortOrder: 1,
      createdAt: FieldValue.serverTimestamp(),
    });

    // Denormalize the front image URL onto the product so the mobile app's
    // `imageUrl` field is populated.
    await productRef.update({ imageUrl: front.url, updatedAt: FieldValue.serverTimestamp() });

    console.log(' - seeded:', p.slug);
  }

  await db.collection('storeSettings').doc('global').set({
    currency: 'USD',
    paymentMethods: ['card'],
    storeName: 'ABX Motion',
    contactEmail: 'hello@abxmotion.io',
    maintenanceMode: false,
    freeShippingThresholdCents: 0,
    defaultTaxRateBps: 0,
    taxInclusive: false,
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });

  await db.collection('counters').doc('orderNumber').set({ value: 1000 }, { merge: true });

  console.log('Done.');
}

main().catch(e => { console.error(e); process.exit(1); });
