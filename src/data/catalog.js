// Shared product catalog. Mirrors the Firestore /products + /storeCollections
// shape that the seed script writes, but uses bundled images for now so the
// shop renders before the database is seeded. Once seeded, swap this module
// for a Firestore fetcher with the same return shape.
import {
  bikerjacketfront, bikerjacketback,
  bikerjacket2front, bikerjacket2back,
  capfront, capback,
  shorts1front, shorts1back,
  pants1front, pants1back,
  xtxverityfront, xtxverityback,
  xtxproverityfront, xtxproverityback,
  abxfiitsneakersfront, abxfiitsneakersback,
  abxfiitrunningtshirtfront, abxfiitrunningtshirtback,
  abxfiitleggingsfront, abxfiitleggingsback,
  abxfiitworkoutcropfront, abxfiitworkoutcropback,
  xtxcodeprosoundsfront, xtxcodeprosoundsback,
  abxtrackvisionprosfront, abxtrackvisionprosback,
  abxcyberhat1front, abxcyberhat1back,
  abxcyberpackerfront, abxcyberpackerback,
} from '../constants/index.js';

export const COLLECTIONS = [
  { id: 'striit-fit', slug: 'striit-fit', name: 'Striit-Fit®',  sortOrder: 0 },
  { id: 'abx-fiit',   slug: 'abx-fiit',   name: 'ABX Fiit®',    sortOrder: 1 },
  { id: 'xtxcode',    slug: 'xtxcode',    name: 'XTXCODE®',     sortOrder: 2 },
];

export const PRODUCTS = [
  { id: 'abx-v1-biker-jacket',     slug: 'abx-v1-biker-jacket',    name: 'ABX V1 Biker Jacket',    priceCents: 45000, collectionId: 'striit-fit', front: bikerjacketfront,           back: bikerjacketback,           tagline: 'Reinforced motion shell with cyberpunk silhouette.' },
  { id: 'abx-v2-biker-jacket',     slug: 'abx-v2-biker-jacket',    name: 'ABX V2 Biker Jacket',    priceCents: 38500, collectionId: 'striit-fit', front: bikerjacket2front,          back: bikerjacket2back,          tagline: 'Iteration two — lighter, sharper, more aerodynamic.' },
  { id: 'abx-cyberhat-1',          slug: 'abx-cyberhat-1',         name: 'ABX Cyberhat 1',         priceCents:  4500, collectionId: 'striit-fit', front: abxcyberhat1front,          back: abxcyberhat1back,          tagline: 'Signature silhouette cap with reflective ABX mark.' },
  { id: 'urban-stealth-cap',       slug: 'urban-stealth-cap',      name: 'Urban Stealth Cap',      priceCents:  5000, collectionId: 'striit-fit', front: capfront,                   back: capback,                   tagline: 'Low-profile everyday cap, road-tested.' },
  { id: 'abx-move4ward-xpants',    slug: 'abx-move4ward-xpants',   name: 'ABX Move4ward X-Pants',  priceCents:  9000, collectionId: 'striit-fit', front: pants1front,                back: pants1back,                tagline: '4-way stretch utility pants. Built to move.' },
  { id: 'abx-cyber-backpack',      slug: 'abx-cyber-backpack',     name: 'ABX Cyber BackPack',     priceCents: 14000, collectionId: 'striit-fit', front: abxcyberpackerfront,        back: abxcyberpackerback,        tagline: 'Hard-shell daily carry with mag-snap rigging.' },

  { id: 'abx-fiit-track-1s',       slug: 'abx-fiit-track-1s',      name: 'ABX Fiit Track 1s',       priceCents: 12000, collectionId: 'abx-fiit', front: abxfiitsneakersfront,        back: abxfiitsneakersback,       tagline: 'Cushioned trainer for sprint + recovery.' },
  { id: 'abx-fiit-track-sleeves',  slug: 'abx-fiit-track-sleeves', name: 'ABX Fiit Track Sleeves',  priceCents:  4000, collectionId: 'abx-fiit', front: abxfiitrunningtshirtfront,   back: abxfiitrunningtshirtback,  tagline: 'Compression sleeve top, breathable warp knit.' },
  { id: 'abx-fiit-track-leggings', slug: 'abx-fiit-track-leggings',name: 'ABX Fiit Track Leggings', priceCents:  6000, collectionId: 'abx-fiit', front: abxfiitleggingsfront,        back: abxfiitleggingsback,       tagline: 'High-rise compression for full-range training.' },
  { id: 'abx-fiit-track-crop',     slug: 'abx-fiit-track-crop',    name: 'ABX Fiit Track Crop Top', priceCents: 13500, collectionId: 'abx-fiit', front: abxfiitworkoutcropfront,     back: abxfiitworkoutcropback,    tagline: 'Sculpted training crop with strap detail.' },
  { id: 'abx-track-vision-pros',   slug: 'abx-track-vision-pros',  name: 'ABX Track Vision Pros',   priceCents:  5500, collectionId: 'abx-fiit', front: abxtrackvisionprosfront,     back: abxtrackvisionprosback,    tagline: 'Polarised performance optics. Glare to nothing.' },
  { id: 'abx-forward-motion-shorts',slug:'abx-forward-motion-shorts',name:'ABX Forward MotionShorts',priceCents:8000, collectionId: 'abx-fiit', front: shorts1front,                back: shorts1back,               tagline: 'Featherweight running shorts with split hem.' },

  { id: 'xtx-code',                slug: 'xtx-code',                name: 'XTX Code',               priceCents:  9000, collectionId: 'xtxcode',  front: xtxverityfront,              back: xtxverityback,             tagline: 'Pocket-sized tracker. Always-on telemetry.' },
  { id: 'xtx-pro-code',            slug: 'xtx-pro-code',            name: 'XTX Pro Code',           priceCents: 16000, collectionId: 'xtxcode',  front: xtxproverityfront,           back: xtxproverityback,          tagline: 'Pro edition with extended battery + GPS.' },
  { id: 'xtx-code-pro-sounds',     slug: 'xtx-code-pro-sounds',     name: 'XTX Code Pro Sounds',    priceCents: 24500, collectionId: 'xtxcode',  front: xtxcodeprosoundsfront,       back: xtxcodeprosoundsback,      tagline: 'In-ear monitors tuned for movement.' },
];

export function findProduct(slug) {
  return PRODUCTS.find(p => p.slug === slug);
}
export function findCollection(id) {
  return COLLECTIONS.find(c => c.id === id || c.slug === id);
}
export function formatPrice(cents, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100);
}
