# ABX Motion

React/Vite storefront + serverless commerce backend + cross-app admin panel for
the ABX-Motion ecosystem.

## Stack

| Layer | Service |
|---|---|
| Static hosting + `/api/*` | **Vercel** |
| Auth (web + mobile) | **Firebase Auth** (`docucraft-cd41b`) |
| Database | **Firestore** (same project) |
| Object storage | **Cloudflare R2** (`ABX-Motion-uploads`) |
| Image upload pipeline | Existing **tyw-upload-image** Cloudflare Worker |
| Payments | **Stripe Checkout** + webhook |
| Email | **Resend** (optional) |
| Rate limiting | **Upstash Redis** (optional) |
| Push notifications | **Firebase Cloud Messaging** |

One project, one auth, one storage bucket, one billing surface for both the
storefront and the ABX-Motion mobile app.

## Scripts

- `npm run dev` — Vite dev server (frontend only).
- `vercel dev` — frontend + serverless functions locally.
- `npm run build` — production bundle.
- `npm run preview` — serve the production build locally.
- `npm run lint` — ESLint over `src/` (`api/` and `scripts/` are Node-only).
- `npm run seed:products` — push the bundled catalog into Firestore + R2.

## Endpoints

### Storefront (public)
- `POST /api/checkout/session` — Stripe Checkout session (guest checkout allowed)
- `POST /api/webhooks/stripe` — Stripe webhook receiver
- `GET  /api/orders/[id]` — own order (`?session_id=` after redirect for guests)
- `GET  /api/me/orders` — signed-in user's orders

### Admin · storefront (role-gated)
- `*  /api/admin/media[...]` — list/confirm/delete media assets
- `*  /api/admin/products[/...]` — products + `/variants[/...]` + `/images`
- `*  /api/admin/collections[/...]`
- `GET/PATCH /api/admin/orders[/...]`, `POST /api/admin/orders/[id]/refund`
- `*  /api/admin/discounts[/...]`
- `*  /api/admin/shipping/zones`, `/api/admin/shipping/rates`
- `GET/PATCH /api/admin/settings` — currency, payment methods, tax, etc.
- `GET/PUT  /api/admin/content/[key]` — editable hero/about copy
- `*  /api/admin/invitations`, `POST /api/admin/invitations/accept`
- `GET  /api/admin/audit`
- `GET  /api/admin/customers`, `PATCH /api/admin/customers/[id]`
  *(role change here also writes a Firebase custom claim so the mobile app picks it up)*

### Admin · ABX-Motion mobile app (role-gated)
Generic CRUD (`GET list / GET one / POST / PATCH / DELETE`):
- `/api/admin/app/promos[/id]`, `/api/admin/app/promo-codes[/id]`
- `/api/admin/app/challenges[/id]`
- `/api/admin/app/workouts[/id]`
- `/api/admin/app/volunteer-events[/id]`
- `/api/admin/app/announcements[/id]`
- `/api/admin/app/rewards[/id]`, `/api/admin/app/badges[/id]`, `/api/admin/app/districts[/id]`
- `/api/admin/app/marketplace[/id]`, `/api/admin/app/prize-draws[/id]`, `/api/admin/app/coin-packages[/id]`
- `/api/admin/app/heatmap-zones[/id]`, `/api/admin/app/peak-pay[/id]`
- `/api/admin/app/categories[/id]`

Specialized:
- `*    /api/admin/app/restaurants[/id]` and `/restaurants/[id]/menu`
- `POST /api/admin/app/restaurants/[id]/assign-admin` — sets `restaurantAdmin` claim
- `GET  /api/admin/app/delivery-orders[/id]` (`PATCH` updates status & writes status_updates)
- `GET/PATCH /api/admin/app/drivers[/id]` — approve, ban (sets custom claim + disables auth)
- `GET/PATCH /api/admin/app/xt-wallets/[uid]` — atomic balance adjustments + ledger
- `GET/PUT  /api/admin/app/config/[key]` — app feature flags / settings
- `GET  /api/admin/app/users/[id]` — cross-collection user dossier
- `DELETE /api/admin/app/feed/[id]` — feed post moderation
- `POST /api/admin/app/broadcast` — push notification to FCM topic

### Roles (Firebase custom claim **`role`** + `/users/{uid}.role` fallback)
- `customer` (default), `restaurant`, `fulfillment`, `editor`, `admin`, `superAdmin`
- The mobile app already reads this same field — role changes propagate
  to both web and Flutter on the next token refresh.

## One-time setup

1. **Firebase project (existing)** — `docucraft-cd41b`
   - Enable Auth providers you want (Email magic link + Google recommended).
   - Generate a service account JSON (Project Settings → Service Accounts).
     Base64-encode it for `FIREBASE_SERVICE_ACCOUNT_BASE64`:
     ```bash
     cat firebase-adminsdk-xxx.json | base64 | tr -d '\n'
     ```
   - Promote yourself to admin (Firestore SQL not available; use the console
     or run once):
     ```js
     // node — after env is set
     import { initializeApp, cert } from 'firebase-admin/app';
     import { getAuth } from 'firebase-admin/auth';
     import { getFirestore } from 'firebase-admin/firestore';
     // … initialize …
     await getAuth().setCustomUserClaims('YOUR_UID', { role: 'superAdmin' });
     await getFirestore().collection('users').doc('YOUR_UID')
       .set({ role: 'superAdmin' }, { merge: true });
     ```

2. **Firestore rules** — the storefront extensions are already appended to
   `ABX-Motion-main/firestore.rules`. Deploy from the app repo:
   ```bash
   cd ../ABX-Motion-main
   firebase deploy --only firestore:rules
   ```

3. **R2 bucket (existing)** — `ABX-Motion-uploads`
   - No changes needed. Browser uploads from the admin go through the existing
     `tyw-upload-image` Worker. Server-side deletes use the R2 S3 API.

4. **Stripe** — add webhook `https://abxmotion.io/api/webhooks/stripe` for:
   - `checkout.session.completed`, `checkout.session.expired`,
   - `checkout.session.async_payment_failed`, `charge.refunded`.
   - Paste the signing secret into `STRIPE_WEBHOOK_SECRET`.

5. **Vercel env** — copy `.env.example`, fill in, then in
   Project Settings → Environment Variables, add the same variables.

6. **Seed catalog**
   ```bash
   npm run seed:products
   ```

7. **Optional Worker extension** — extend `tyw-upload-image` to allow new
   `kind` values (`product`, `collection`, `site`, `lookbook`) by adding them
   to `ALLOWED_KINDS` in
   `ABX-Motion-main/cloudflare/upload-image/src/index.js`, and (recommended)
   gate the storefront kinds behind a `role` claim check.

## Deployment

```bash
vercel link
vercel env pull .env       # mirror prod env locally
npm run build
vercel deploy --prod
```
