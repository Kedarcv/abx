// Seed the Yanaya partner restaurant + its menu (Smoovy + USN supplements)
// into Firestore. Images served from /public/restaurants/yanaya/ on Vercel.

import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.applicationDefault() });
}
const db = admin.firestore();
const FV = admin.firestore.FieldValue;

const PUBLIC_BASE = (process.env.SEED_PUBLIC_BASE_URL ||
  'https://abxmotionio-omega.vercel.app').replace(/\/$/, '');
const imgUrl = (file) => `${PUBLIC_BASE}/restaurants/yanaya/${file}`;

const RESTAURANT = {
  id: 'yanaya',
  name: 'Yanaya',
  tagline: 'Sip, Move, Smile',
  slogan: 'It Will End In Health',
  address: 'Harare, Zimbabwe',
  city: 'Harare, Zimbabwe',
  phone: '',
  instagram: '@yanayalifestyle',
  website: 'https://www.yanaya.co.zw',
  latitude: -17.8252,
  longitude: 31.0335,
  rating: 4.8,
  logoUrl:        imgUrl('poster.jpeg'),
  bannerUrl:      imgUrl('banner.jpeg'),
  interiorUrl:    imgUrl('banner.jpeg'),
  burgerPromoUrl: imgUrl('poster.jpeg'),
  active: true,
  featured: false,
  sortOrder: 1,
};

const MENU = [
  // SMOOTHIES
  {
    id: 'smoovy',
    name: 'Smoovy',
    description: 'Plant-based, fruit-sugars only, boost-health vitamin-infused 420ml smoothie. Choose your flavour: Choco Mint, Pineapple Express, Berry Nice, Whey Protein | Strawberry, or Baobalicious.',
    price: 1.00,
    image: 'poster.jpeg',
    category: 'smoothies',
    calories: 220,
    protein: 8,
    carbs: 38,
    athleteTip: 'Vitamin-infused boost — great pre-run hydration or post-workout recovery.',
    timing: 'Anytime',
  },
  // SUPPLEMENTS
  {
    id: 'usn-muscle-fuel-anabolic',
    name: 'USN Muscle Fuel Anabolic',
    description: 'All-in-one muscle mass catalyst. 54g protein per serving, chocolate flavour, 4 kg tub.',
    price: 50.00,
    image: 'muscle-fuel-anabolic.jpeg',
    category: 'supplements',
    calories: 480,
    protein: 54,
    carbs: 50,
    athleteTip: 'Bulk gainer — pair with strength training for muscle mass.',
    timing: 'Post-Workout',
  },
  {
    id: 'usn-diet-fuel-ultralean',
    name: 'USN Diet Fuel UltraLean',
    description: 'All-in-one high protein lean meal replacement shake. 25g protein, strawberry flavour, 1 kg tub.',
    price: 30.00,
    image: 'diet-fuel.jpeg',
    category: 'supplements',
    calories: 180,
    protein: 25,
    carbs: 12,
    athleteTip: 'Lean meal replacement — supports cutting and maintenance.',
    timing: 'Meal Replacement',
  },
  {
    id: 'usn-pure-creatine',
    name: 'USN Pure Creatine Monohydrate',
    description: '5,000 mg pure creatine monohydrate per dose. Supports recovery and increased strength + stamina. Unflavoured, 300g pouch.',
    price: 22.00,
    image: 'pure-creatine.jpeg',
    category: 'supplements',
    calories: 0,
    protein: 0,
    carbs: 0,
    athleteTip: 'Daily 5g dose for strength and stamina. Mix into any drink.',
    timing: 'Daily',
  },
  {
    id: 'usn-creatine-hydrator',
    name: 'USN Creatine Hydrator',
    description: 'Zero sugar creatine + electrolytes blend. 5,000 mg creatine monohydrate per serving. Raspberry lemonade flavour.',
    price: 20.00,
    image: 'creatine-hydrator.jpeg',
    category: 'supplements',
    calories: 5,
    protein: 0,
    carbs: 1,
    athleteTip: 'Performance + hydration combo — sip during long sessions.',
    timing: 'Pre-Workout',
  },
];

(async () => {
  const ref = db.collection('restaurants').doc(RESTAURANT.id);
  await ref.set({
    ...RESTAURANT,
    createdAt: FV.serverTimestamp(),
    updatedAt: FV.serverTimestamp(),
  }, { merge: true });
  console.log(`✓ restaurant: ${RESTAURANT.id}`);

  let i = 0;
  for (const item of MENU) {
    await ref.collection('menu').doc(item.id).set({
      ...item,
      imageUrl: imgUrl(item.image),
      priceCents: Math.round(item.price * 100),
      available: true,
      sortOrder: i++,
      createdAt: FV.serverTimestamp(),
      updatedAt: FV.serverTimestamp(),
    }, { merge: true });
    console.log(`  • menu/${item.id}  $${item.price.toFixed(2)}`);
  }

  console.log(`\nDone. ${MENU.length} menu items at Yanaya.`);
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
