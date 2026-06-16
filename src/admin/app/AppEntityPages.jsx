// ABX-Motion admin pages — field shapes match the Flutter app's
// repositories so the mobile app picks up changes without code edits.
//
// Source of truth: see /memories/session/plan.md "ABX-Motion Firestore
// schema" section, derived from lib/features/.../*.dart in the
// ABX-Motion-main repo.
import EntityListPage from '../components/EntityListPage.jsx';

const dateField  = (n, l = 'Date') => ({ name: n, label: l, type: 'text', placeholder: 'ISO datetime e.g. 2026-06-01T09:00:00Z' });
const boolField  = (n, l) => ({ name: n, label: l, type: 'boolean' });
const numField   = (n, l) => ({ name: n, label: l, type: 'number' });
const textField  = (n, l, placeholder) => ({ name: n, label: l, type: 'text', placeholder });
const longText   = (n, l) => ({ name: n, label: l, type: 'textarea' });
const jsonField  = (n, l) => ({ name: n, label: l, type: 'json' });

// ─────────────────────────────────────────────────────────────────────
// XT Rewards Promos — /promos/{id} (read by xt_repository.dart)
//   { title, description, xtCost:int, discountLabel, active:bool }
// ─────────────────────────────────────────────────────────────────────
export function PromosPage() {
  return (
    <EntityListPage
      eyebrow="ABX-Motion · Rewards"
      title="XT promos"
      description="Items in the rewards/XT promos catalog shown in the mobile app."
      endpoint="/api/admin/app/promos"
      columns={[
        { key: 'title',         label: 'Title' },
        { key: 'xtCost',        label: 'XT cost' },
        { key: 'discountLabel', label: 'Discount' },
        { key: 'active',        label: 'Active', format: (v) => v ? '✓' : '—' },
      ]}
      fields={[
        textField('title', 'Title', '10% off — Apparel'),
        longText('description', 'Description'),
        numField('xtCost', 'XT cost'),
        textField('discountLabel', 'Discount label', '10% off apparel'),
        boolField('active', 'Active'),
      ]}
      newDefaults={{ title: '', description: '', xtCost: 5, discountLabel: '', active: true }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────
// Promo codes — /promo_codes (delivery side, not yet read by mobile app)
// ─────────────────────────────────────────────────────────────────────
export function PromoCodesPage() {
  return (
    <EntityListPage
      eyebrow="ABX-Motion · Delivery"
      title="Promo codes"
      description="Delivery promo codes."
      endpoint="/api/admin/app/promo-codes"
      columns={[
        { key: 'code',          label: 'Code' },
        { key: 'discountType',  label: 'Type' },
        { key: 'amount',        label: 'Amount' },
        { key: 'active',        label: 'Active', format: (v) => v ? '✓' : '—' },
      ]}
      fields={[
        textField('code', 'Code'),
        textField('discountType', 'Type (percent | fixed)'),
        numField('amount', 'Amount'),
        numField('minOrderCents', 'Min order (cents)'),
        numField('usageLimit', 'Usage limit'),
        dateField('expiresAt', 'Expires at'),
        boolField('active', 'Active'),
      ]}
      newDefaults={{ code: '', discountType: 'percent', amount: 10, active: true }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────
// Challenges — /challenges (challenge_repository.dart):
//   { title, description, goalType:string, goalValue:double,
//     startsAt:Timestamp, endsAt:Timestamp, participantCount:int,
//     participants:array<string>, authorId:string, createdAt }
// ─────────────────────────────────────────────────────────────────────
export function ChallengesPage() {
  return (
    <EntityListPage
      eyebrow="ABX-Motion"
      title="Challenges"
      description="Community challenges shown in the mobile app feed."
      endpoint="/api/admin/app/challenges"
      columns={[
        { key: 'title',            label: 'Title' },
        { key: 'goalType',         label: 'Goal' },
        { key: 'goalValue',        label: 'Target' },
        { key: 'startsAt',         label: 'Starts' },
        { key: 'endsAt',           label: 'Ends' },
        { key: 'participantCount', label: 'Players' },
      ]}
      fields={[
        textField('title', 'Title'),
        longText('description', 'Description'),
        textField('goalType', 'Goal type', 'km | minutes | workouts | xp | steps'),
        numField('goalValue', 'Goal value'),
        dateField('startsAt', 'Starts at'),
        dateField('endsAt', 'Ends at'),
        numField('participantCount', 'Participant count (display)'),
      ]}
      newDefaults={{
        title: '', description: '', goalType: 'km', goalValue: 10,
        startsAt: '', endsAt: '', participantCount: 0, participants: [],
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────
// Workouts — /workouts (workouts_repository.dart):
//   { title, description, imageUrl, createdAt, ... }
// ─────────────────────────────────────────────────────────────────────
export function WorkoutsPage() {
  return (
    <EntityListPage
      eyebrow="ABX-Motion"
      title="Workouts catalog"
      description="Workouts shown to users. Mobile app reads /workouts."
      endpoint="/api/admin/app/workouts"
      columns={[
        { key: 'title',       label: 'Title' },
        { key: 'category',    label: 'Category' },
        { key: 'durationSec', label: 'Duration (s)' },
        { key: 'difficulty',  label: 'Difficulty' },
      ]}
      fields={[
        textField('title', 'Title'),
        longText('description', 'Description'),
        textField('imageUrl', 'Image URL', 'https://pub-…/workouts/…'),
        textField('category', 'Category'),
        textField('difficulty', 'Difficulty', 'beginner | intermediate | advanced'),
        numField('durationSec', 'Duration (seconds)'),
        numField('estimatedCalories', 'Estimated calories'),
        jsonField('steps', 'Steps (JSON array)'),
      ]}
      newDefaults={{ title: '', category: 'cardio', difficulty: 'beginner', durationSec: 600 }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────
// Volunteer events — /volunteerEvents (volunteer_repository.dart):
//   { title, description, location, startsAt:Timestamp }
// ─────────────────────────────────────────────────────────────────────
export function VolunteerEventsPage() {
  return (
    <EntityListPage
      eyebrow="ABX-Motion"
      title="Volunteer events"
      endpoint="/api/admin/app/volunteer-events"
      columns={[
        { key: 'title',    label: 'Title' },
        { key: 'location', label: 'Location' },
        { key: 'startsAt', label: 'Starts' },
      ]}
      fields={[
        textField('title', 'Title'),
        longText('description', 'Description'),
        textField('location', 'Location'),
        dateField('startsAt', 'Starts at'),
        dateField('endsAt', 'Ends at (optional)'),
        numField('spots', 'Spots'),
        textField('imageUrl', 'Image URL'),
      ]}
      newDefaults={{ title: '', location: '', spots: 20 }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────
// App announcements — /app_announcements (planned for app)
// ─────────────────────────────────────────────────────────────────────
export function AnnouncementsPage() {
  return (
    <EntityListPage
      eyebrow="ABX-Motion"
      title="App announcements"
      description="In-app banners. Mobile app surface coming soon."
      endpoint="/api/admin/app/announcements"
      columns={[
        { key: 'title',    label: 'Title' },
        { key: 'severity', label: 'Severity' },
        { key: 'active',   label: 'Active', format: (v) => v ? '✓' : '—' },
      ]}
      fields={[
        textField('title', 'Title'),
        longText('body', 'Body'),
        textField('severity', 'Severity', 'info | warning | critical'),
        textField('linkUrl', 'Link URL'),
        dateField('startsAt', 'Starts at'),
        dateField('expiresAt', 'Expires at'),
        boolField('active', 'Active'),
      ]}
      newDefaults={{ title: '', severity: 'info', active: true }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────
// Rewards — /rewards (planned)
// ─────────────────────────────────────────────────────────────────────
export function RewardsPage() {
  return (
    <EntityListPage eyebrow="ABX-Motion" title="Rewards" endpoint="/api/admin/app/rewards"
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'cost', label: 'XT cost' },
        { key: 'stock', label: 'Stock' },
        { key: 'active', label: 'Active', format: v => v ? '✓' : '—' },
      ]}
      fields={[
        textField('name','Name'),
        longText('description','Description'),
        numField('cost','XT cost'),
        numField('stock','Stock'),
        textField('imageUrl','Image URL'),
        boolField('active','Active'),
      ]}
      newDefaults={{ name: '', cost: 100, stock: 100, active: true }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────
// Badges — /badges (planned)
// ─────────────────────────────────────────────────────────────────────
export function BadgesPage() {
  return (
    <EntityListPage eyebrow="ABX-Motion" title="Badges" endpoint="/api/admin/app/badges"
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'tier', label: 'Tier' },
        { key: 'requiredXp', label: 'Required XP' },
      ]}
      fields={[
        textField('name','Name'),
        longText('description','Description'),
        textField('tier','Tier', 'bronze | silver | gold | platinum'),
        numField('requiredXp','Required XP'),
        textField('iconUrl','Icon URL'),
      ]}
      newDefaults={{ name: '', tier: 'bronze', requiredXp: 100 }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────
// Districts — /districts (planned)
// ─────────────────────────────────────────────────────────────────────
export function DistrictsPage() {
  return (
    <EntityListPage eyebrow="ABX-Motion" title="Districts" endpoint="/api/admin/app/districts"
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'city', label: 'City' },
        { key: 'country', label: 'Country' },
      ]}
      fields={[
        textField('name','Name'),
        textField('city','City'),
        textField('country','Country', 'US, ZA, …'),
        jsonField('bbox','Bounding box (JSON)'),
      ]}
      newDefaults={{ name: '', city: '', country: 'US' }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────
// Marketplace items — /marketplace_items (planned)
// ─────────────────────────────────────────────────────────────────────
export function MarketplacePage() {
  return (
    <EntityListPage eyebrow="ABX-Motion" title="Marketplace items" endpoint="/api/admin/app/marketplace"
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'priceXt', label: 'XT' },
        { key: 'stock', label: 'Stock' },
        { key: 'active', label: 'Active', format: v => v ? '✓' : '—' },
      ]}
      fields={[
        textField('name','Name'),
        longText('description','Description'),
        numField('priceXt','Price (XT)'),
        numField('stock','Stock'),
        textField('imageUrl','Image URL'),
        boolField('active','Active'),
      ]}
      newDefaults={{ name: '', priceXt: 50, stock: 10, active: true }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────
// Prize draws — /prize_draws (planned)
// ─────────────────────────────────────────────────────────────────────
export function PrizeDrawsPage() {
  return (
    <EntityListPage eyebrow="ABX-Motion" title="Prize draws" endpoint="/api/admin/app/prize-draws"
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'ticketCostXt', label: 'Ticket (XT)' },
        { key: 'drawsAt', label: 'Draws at' },
        { key: 'active', label: 'Active', format: v => v ? '✓' : '—' },
      ]}
      fields={[
        textField('title','Title'),
        longText('description','Description'),
        numField('ticketCostXt','Ticket cost (XT)'),
        dateField('drawsAt','Draws at'),
        textField('imageUrl','Image URL'),
        boolField('active','Active'),
      ]}
      newDefaults={{ title: '', ticketCostXt: 10, active: true }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────
// Coin packages — /coin_packages (planned)
// ─────────────────────────────────────────────────────────────────────
export function CoinPackagesPage() {
  return (
    <EntityListPage eyebrow="ABX-Motion" title="Coin packages" endpoint="/api/admin/app/coin-packages"
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'xtAmount', label: 'XT amount' },
        { key: 'priceCents', label: 'Price (cents)' },
        { key: 'active', label: 'Active', format: v => v ? '✓' : '—' },
      ]}
      fields={[
        textField('name','Name'),
        numField('xtAmount','XT amount'),
        numField('priceCents','Price (cents)'),
        textField('currency','Currency', 'USD'),
        boolField('active','Active'),
      ]}
      newDefaults={{ name: '', xtAmount: 100, priceCents: 199, currency: 'USD', active: true }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────
// Heatmap zones — /heatmap_zones (planned)
// ─────────────────────────────────────────────────────────────────────
export function HeatmapZonesPage() {
  return (
    <EntityListPage eyebrow="Delivery" title="Heatmap zones" endpoint="/api/admin/app/heatmap-zones"
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'demand', label: 'Demand' },
        { key: 'active', label: 'Active', format: v => v ? '✓' : '—' },
      ]}
      fields={[
        textField('name','Name'),
        numField('demand','Demand (0-10)'),
        jsonField('polygon','Polygon (GeoJSON)'),
        boolField('active','Active'),
      ]}
      newDefaults={{ name: '', demand: 5, active: true }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────
// Peak pay — /peak_pay (planned)
// ─────────────────────────────────────────────────────────────────────
export function PeakPayPage() {
  return (
    <EntityListPage eyebrow="Delivery" title="Peak pay" endpoint="/api/admin/app/peak-pay"
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'multiplier', label: '×' },
        { key: 'startsAt', label: 'Starts' },
        { key: 'active', label: 'Active', format: v => v ? '✓' : '—' },
      ]}
      fields={[
        textField('name','Name'),
        numField('multiplier','Multiplier'),
        dateField('startsAt','Starts at'),
        dateField('endsAt','Ends at'),
        boolField('active','Active'),
      ]}
      newDefaults={{ name: '', multiplier: 1.5, active: true }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────
// Menu categories — /categories (delivery menu)
// ─────────────────────────────────────────────────────────────────────
export function CategoriesPage() {
  return (
    <EntityListPage eyebrow="Delivery" title="Menu categories" endpoint="/api/admin/app/categories"
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'slug', label: 'Slug' },
        { key: 'sortOrder', label: 'Order' },
      ]}
      fields={[
        textField('name','Name'),
        textField('slug','Slug'),
        numField('sortOrder','Sort order'),
        textField('imageUrl','Image URL'),
      ]}
      newDefaults={{ name: '', slug: '', sortOrder: 0 }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────
// Restaurants — /restaurants
// ─────────────────────────────────────────────────────────────────────
export function RestaurantsPage() {
  return (
    <EntityListPage eyebrow="Restaurants" title="Restaurants" endpoint="/api/admin/app/restaurants"
      description="Partner restaurants shown in the mobile app's Nearby Restaurants screen."
      detailHref={(row) => `/admin/app/restaurants/${row.id}`}
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'tagline', label: 'Tagline' },
        { key: 'city', label: 'City' },
        { key: 'rating', label: 'Rating' },
        { key: 'active', label: 'Active', format: v => v ? '✓' : '—' },
        { key: 'featured', label: 'Featured', format: v => v ? '★' : '—' },
      ]}
      fields={[
        textField('name','Name'),
        textField('tagline','Tagline', 'e.g. "Food Vibes"'),
        textField('slogan','Slogan'),
        longText('description','Description'),
        textField('city','City'),
        textField('address','Address'),
        textField('phone','Phone'),
        textField('instagram','Instagram handle', '@yanayalifestyle'),
        textField('website','Website'),
        numField('latitude','Latitude'),
        numField('longitude','Longitude'),
        numField('rating','Rating (0-5)'),
        textField('logoUrl','Logo URL'),
        textField('bannerUrl','Banner URL'),
        textField('interiorUrl','Interior photo URL'),
        textField('burgerPromoUrl','Promo image URL'),
        numField('sortOrder','Sort order'),
        boolField('featured','Featured'),
        boolField('active','Active'),
      ]}
      newDefaults={{
        name: '', tagline: '', city: '', latitude: 0, longitude: 0,
        rating: 0, sortOrder: 0, active: true, featured: false,
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────
// Clubs — /clubs (matches ABX-Motion Club.toJson())
// ─────────────────────────────────────────────────────────────────────
export function ClubsPage() {
  return (
    <EntityListPage
      eyebrow="ABX-Motion"
      title="Clubs"
      description="Run/fitness clubs. Mobile app reads /clubs and these subcollections: /members, /joinRequests, /posts, /events."
      endpoint="/api/admin/app/clubs"
      detailHref={(row) => `/admin/app/clubs/${row.id}`}
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'visibility', label: 'Visibility' },
        { key: 'memberCount', label: 'Members' },
        { key: 'category', label: 'Category' },
      ]}
      fields={[
        textField('name','Name'),
        longText('description','Description'),
        textField('ownerId','Owner UID', 'Required — must match an existing user uid'),
        textField('visibility','Visibility', 'public | private | inviteOnly'),
        textField('joinPolicy','Join policy', 'open | request | invite'),
        textField('category','Category'),
        longText('rules','Rules / about'),
        textField('inviteCode','Invite code (auto if blank)'),
        numField('memberCount','Member count'),
        numField('postCount','Post count'),
        numField('challengeCount','Challenge count'),
      ]}
      newDefaults={{
        name: '', description: '', ownerId: '',
        visibility: 'public', joinPolicy: 'open',
        memberCount: 1, postCount: 0, challengeCount: 0,
      }}
    />
  );
}
