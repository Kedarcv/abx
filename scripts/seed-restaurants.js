// Seed the SchnAX restaurant + menu items into Firestore so the Flutter app
// and the assistant can read them dynamically. Images point at
// https://abxmotionio-omega.vercel.app/restaurants/schnax/<file>.
//
// Run: GOOGLE_APPLICATION_CREDENTIALS=... node scripts/seed-restaurants.js
// Idempotent.

import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.applicationDefault() });
}
const db = admin.firestore();
const FV = admin.firestore.FieldValue;

const PUBLIC_BASE = (process.env.SEED_PUBLIC_BASE_URL ||
  'https://abxmotionio-omega.vercel.app').replace(/\/$/, '');

const imgUrl = (file) => `${PUBLIC_BASE}/restaurants/schnax/${file}`;

const RESTAURANT = {
  id: 'schnax',
  name: 'SchnAX',
  tagline: 'Food Vibes',
  slogan: 'Delicious Food & Vibes',
  address: '3 Anchor House, 54 Jason Moyo Avenue, Harare',
  city: 'Harare, Zimbabwe',
  phone: '+263 779 620 905',
  instagram: '@schnaxvibes',
  latitude: -17.8292,
  longitude: 31.0522,
  rating: 4.9,
  logoUrl:        imgUrl('logo.jpeg'),
  bannerUrl:      imgUrl('promo_banner.jpeg'),
  interiorUrl:    imgUrl('restaurant_interior.jpeg'),
  burgerPromoUrl: imgUrl('burger_promo.jpeg'),
  active: true,
  featured: true,
  sortOrder: 0,
};

const MENU = [
  // MAINS
  { id: 'fool_chicken',  name: 'Fool-Chicken-Stare & Slo', description: 'A juicy flame grilled full chicken with our signature coleslaw salad, yellow rice and stir fried chicken fillet', price: 12.00, image: 'fool_chicken_stare_slo.jpeg', category: 'mains',   calories: 850, protein: 68, carbs: 45, athleteTip: 'Perfect post-race recovery meal - high protein for muscle repair', timing: 'Post-Workout' },
  { id: 'pokey_fry',     name: 'Pokey-Fry',                 description: 'Grilled pork and chicken stir-fry served with white/yellow rice',                                                  price: 5.00,  image: 'pokey_fry.jpeg',              category: 'mains',   calories: 580, protein: 42, carbs: 52, athleteTip: 'Balanced protein and carbs for sustained energy',                              timing: 'Lunch' },
  { id: 'grilled_chic',  name: 'Grilled Chic 2 Stare & Fry',description: 'A combination of our flame grilled chicken and chicken/pork stir-fry with crispy potato wedges',                  price: 5.00,  image: 'grilled_chic_stare_fry.jpeg', category: 'mains',   calories: 620, protein: 48, carbs: 38, athleteTip: 'Great combo of lean proteins with complex carbs',                              timing: 'Post-Workout' },
  { id: 'stare_slo_fry', name: 'Stare-Slo-Fry',             description: 'A simple chicken/pork stir-fry dish complemented with peppers and our signature coleslaw salad',                  price: 3.50,  image: 'stare_slo_fry.jpeg',          category: 'mains',   calories: 420, protein: 32, carbs: 28, athleteTip: 'Light but satisfying - ideal for active rest days',                            timing: 'Lunch' },
  { id: 'garlic_quota',  name: 'Garlic Quota Wage',         description: 'A smashing garlic panini quarter bread, filled with chicken or beef strips, potato fries, cheese, veggies and greens in succulent mayo infused sauces complemented by potato', price: 4.00, image: 'garlic_quota_wage.jpeg', category: 'mains', calories: 520, protein: 28, carbs: 58, athleteTip: 'Carb-rich option perfect 2-3 hours before a run', timing: 'Pre-Workout' },
  // BURGERS
  { id: 'double_soss',   name: 'Double-Soss Burger',        description: 'A mighty duo of beef sausage burgers stacked high with all juicy BBQ & mayo fillings and veggies waiting for you to take a big bite out of your hunger', price: 3.00, image: 'double_soss_burger.jpeg', category: 'burgers', calories: 480, protein: 24, carbs: 42, athleteTip: 'Satisfying cheat meal - enjoy on recovery days', timing: 'Recovery' },
  // SIDES
  { id: 'spring_rollz',  name: 'The Sring-Rollz (3)',       description: 'Light, crispy spring rolls packed with deliciously seasoned fillings and wrapped to perfection. Fresh, flavorful, and irresistibly crunchy, they are the perfect snack for sharing.', price: 1.00, image: 'spring_rollz.jpeg', category: 'sides', calories: 180, protein: 6, carbs: 22, athleteTip: 'Quick energy snack between training sessions', timing: 'Snack' },
  // BAKERY
  { id: 'soft_scone',    name: 'Soft-Scone-Life (2)',       description: 'Buttery, tender scones baked until perfectly golden with a delicate crumb that melts in your mouth. Ideal with tea or coffee, they offer a classic, comforting taste with a touch of refined indulgence.', price: 1.00, image: 'soft_scone_life.jpeg', category: 'bakery', calories: 240, protein: 4, carbs: 32, athleteTip: 'Quick carbs for morning energy before easy runs', timing: 'Pre-Workout' },
  { id: 'muffin_sumin',  name: 'Muffin-Sumin (3)',          description: 'Soft, golden-baked muffins bursting with rich flavor and irresistible aroma, perfect for any time of day. Every bite delivers a warm, comforting balance of sweetness and freshness.', price: 1.00, image: 'muffin_sumin.jpeg', category: 'bakery', calories: 320, protein: 6, carbs: 48, athleteTip: 'Great grab-and-go breakfast option', timing: 'Morning' },
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
    console.log(`  • menu/${item.id}`);
  }

  console.log(`\nDone. 1 restaurant, ${MENU.length} menu items.`);
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
