// Single Vercel serverless function that dispatches every /api/admin/*
// request to one of the handler modules under ../_handlers_admin.
//
// Why: Vercel's Hobby plan limits a deployment to 12 serverless functions.
// We have ~60 admin endpoints, so they share this one function. Each handler
// is still its own file (good for code organization, still tree-shakable for
// Node import resolution) — only the routing layer changes.

import * as broadcast              from '../_handlers_admin/app/broadcast.js';
import * as audit                  from '../_handlers_admin/audit.js';
import * as settings               from '../_handlers_admin/settings.js';
import * as stats                  from '../_handlers_admin/stats.js';

import * as contentByKey           from '../_handlers_admin/content/[key].js';

import * as customersIndex         from '../_handlers_admin/customers/index.js';
import * as customersById          from '../_handlers_admin/customers/[id].js';

import * as invitationsIndex       from '../_handlers_admin/invitations/index.js';
import * as invitationsAccept      from '../_handlers_admin/invitations/accept.js';

import * as mediaIndex             from '../_handlers_admin/media/index.js';
import * as mediaById              from '../_handlers_admin/media/[id].js';

import * as productsIndex          from '../_handlers_admin/products/index.js';
import * as productsById           from '../_handlers_admin/products/[id].js';
import * as productImages          from '../_handlers_admin/products/[id]/images.js';
import * as productVariantsAdd     from '../_handlers_admin/products/[id]/variants.js';
import * as productVariantById     from '../_handlers_admin/products/[id]/variants/[variantId].js';

import * as collectionsIndex       from '../_handlers_admin/collections/index.js';
import * as collectionsById        from '../_handlers_admin/collections/[id].js';

import * as ordersIndex            from '../_handlers_admin/orders/index.js';
import * as ordersById             from '../_handlers_admin/orders/[id].js';
import * as ordersRefund           from '../_handlers_admin/orders/[id]/refund.js';

import * as discountsIndex         from '../_handlers_admin/discounts/index.js';
import * as discountsByCode        from '../_handlers_admin/discounts/[code].js';

import * as shippingZones          from '../_handlers_admin/shipping/zones.js';
import * as shippingRates          from '../_handlers_admin/shipping/rates.js';

// ---- ABX-Motion app side ----
import * as appPromosIndex         from '../_handlers_admin/app/promos/index.js';
import * as appPromosById          from '../_handlers_admin/app/promos/[id].js';
import * as appPromoCodesIndex     from '../_handlers_admin/app/promo-codes/index.js';
import * as appPromoCodesById      from '../_handlers_admin/app/promo-codes/[id].js';
import * as appChallengesIndex     from '../_handlers_admin/app/challenges/index.js';
import * as appChallengesById      from '../_handlers_admin/app/challenges/[id].js';
import * as appWorkoutsIndex       from '../_handlers_admin/app/workouts/index.js';
import * as appWorkoutsById        from '../_handlers_admin/app/workouts/[id].js';
import * as appVolunteerIndex      from '../_handlers_admin/app/volunteer-events/index.js';
import * as appVolunteerById       from '../_handlers_admin/app/volunteer-events/[id].js';
import * as appAnnouncementsIndex  from '../_handlers_admin/app/announcements/index.js';
import * as appAnnouncementsById   from '../_handlers_admin/app/announcements/[id].js';
import * as appRewardsIndex        from '../_handlers_admin/app/rewards/index.js';
import * as appRewardsById         from '../_handlers_admin/app/rewards/[id].js';
import * as appBadgesIndex         from '../_handlers_admin/app/badges/index.js';
import * as appBadgesById          from '../_handlers_admin/app/badges/[id].js';
import * as appDistrictsIndex      from '../_handlers_admin/app/districts/index.js';
import * as appDistrictsById       from '../_handlers_admin/app/districts/[id].js';
import * as appMarketplaceIndex    from '../_handlers_admin/app/marketplace/index.js';
import * as appMarketplaceById     from '../_handlers_admin/app/marketplace/[id].js';
import * as appPrizeDrawsIndex     from '../_handlers_admin/app/prize-draws/index.js';
import * as appPrizeDrawsById      from '../_handlers_admin/app/prize-draws/[id].js';
import * as appCoinPkgsIndex       from '../_handlers_admin/app/coin-packages/index.js';
import * as appCoinPkgsById        from '../_handlers_admin/app/coin-packages/[id].js';
import * as appHeatmapIndex        from '../_handlers_admin/app/heatmap-zones/index.js';
import * as appHeatmapById         from '../_handlers_admin/app/heatmap-zones/[id].js';
import * as appPeakPayIndex        from '../_handlers_admin/app/peak-pay/index.js';
import * as appPeakPayById         from '../_handlers_admin/app/peak-pay/[id].js';
import * as appCategoriesIndex     from '../_handlers_admin/app/categories/index.js';
import * as appCategoriesById      from '../_handlers_admin/app/categories/[id].js';
import * as appClubsIndex          from '../_handlers_admin/app/clubs/index.js';
import * as appClubsById           from '../_handlers_admin/app/clubs/[id].js';
import * as appClubMembers         from '../_handlers_admin/app/clubs/[id]/members.js';
import * as appClubJoinRequests    from '../_handlers_admin/app/clubs/[id]/join-requests.js';

import * as appRestaurantsIndex    from '../_handlers_admin/app/restaurants/index.js';
import * as appRestaurantsById     from '../_handlers_admin/app/restaurants/[id].js';
import * as appRestaurantMenu      from '../_handlers_admin/app/restaurants/[id]/menu.js';
import * as appRestaurantAssign    from '../_handlers_admin/app/restaurants/[id]/assign-admin.js';

import * as appDeliveryIndex       from '../_handlers_admin/app/delivery-orders/index.js';
import * as appDeliveryById        from '../_handlers_admin/app/delivery-orders/[id].js';

import * as appDriversIndex        from '../_handlers_admin/app/drivers/index.js';
import * as appDriversById         from '../_handlers_admin/app/drivers/[id].js';

import * as appXtWalletByUid       from '../_handlers_admin/app/xt-wallets/[uid].js';
import * as appConfigByKey         from '../_handlers_admin/app/config/[key].js';
import * as appUsersById           from '../_handlers_admin/app/users/[id].js';
import * as appFeedById            from '../_handlers_admin/app/feed/[id].js';

// ---- Route table ----
// Each entry: regex against the joined `path[]` segments, capture groups
// become req.query keys, dispatch to the module's default export.
const ROUTES = [
  // simple endpoints
  ['^broadcast$',                broadcast,             {}],
  ['^audit$',                    audit,                 {}],
  ['^stats$',                    stats,                 {}],
  ['^settings$',                 settings,              {}],

  // content/[key]
  ['^content/([^/]+)$',          contentByKey,          { 1: 'key' }],

  // customers
  ['^customers$',                customersIndex,        {}],
  ['^customers/([^/]+)$',        customersById,         { 1: 'id' }],

  // invitations
  ['^invitations$',              invitationsIndex,      {}],
  ['^invitations/accept$',       invitationsAccept,     {}],

  // media
  ['^media$',                    mediaIndex,            {}],
  ['^media/([^/]+)$',            mediaById,             { 1: 'id' }],

  // products
  ['^products$',                 productsIndex,         {}],
  ['^products/([^/]+)$',         productsById,          { 1: 'id' }],
  ['^products/([^/]+)/images$',  productImages,         { 1: 'id' }],
  ['^products/([^/]+)/variants$', productVariantsAdd,   { 1: 'id' }],
  ['^products/([^/]+)/variants/([^/]+)$', productVariantById, { 1: 'id', 2: 'variantId' }],

  // collections
  ['^collections$',              collectionsIndex,      {}],
  ['^collections/([^/]+)$',      collectionsById,       { 1: 'id' }],

  // orders
  ['^orders$',                   ordersIndex,           {}],
  ['^orders/([^/]+)$',           ordersById,            { 1: 'id' }],
  ['^orders/([^/]+)/refund$',    ordersRefund,          { 1: 'id' }],

  // discounts
  ['^discounts$',                discountsIndex,        {}],
  ['^discounts/([^/]+)$',        discountsByCode,       { 1: 'code' }],

  // shipping
  ['^shipping/zones$',           shippingZones,         {}],
  ['^shipping/rates$',           shippingRates,         {}],

  // ---- ABX-Motion app side ----
  ['^app/promos$',               appPromosIndex,        {}],
  ['^app/promos/([^/]+)$',       appPromosById,         { 1: 'id' }],
  ['^app/promo-codes$',          appPromoCodesIndex,    {}],
  ['^app/promo-codes/([^/]+)$',  appPromoCodesById,     { 1: 'id' }],
  ['^app/challenges$',           appChallengesIndex,    {}],
  ['^app/challenges/([^/]+)$',   appChallengesById,     { 1: 'id' }],
  ['^app/workouts$',             appWorkoutsIndex,      {}],
  ['^app/workouts/([^/]+)$',     appWorkoutsById,       { 1: 'id' }],
  ['^app/volunteer-events$',     appVolunteerIndex,     {}],
  ['^app/volunteer-events/([^/]+)$', appVolunteerById,  { 1: 'id' }],
  ['^app/announcements$',        appAnnouncementsIndex, {}],
  ['^app/announcements/([^/]+)$',appAnnouncementsById,  { 1: 'id' }],
  ['^app/rewards$',              appRewardsIndex,       {}],
  ['^app/rewards/([^/]+)$',      appRewardsById,        { 1: 'id' }],
  ['^app/badges$',               appBadgesIndex,        {}],
  ['^app/badges/([^/]+)$',       appBadgesById,         { 1: 'id' }],
  ['^app/districts$',            appDistrictsIndex,     {}],
  ['^app/districts/([^/]+)$',    appDistrictsById,      { 1: 'id' }],
  ['^app/marketplace$',          appMarketplaceIndex,   {}],
  ['^app/marketplace/([^/]+)$',  appMarketplaceById,    { 1: 'id' }],
  ['^app/prize-draws$',          appPrizeDrawsIndex,    {}],
  ['^app/prize-draws/([^/]+)$',  appPrizeDrawsById,     { 1: 'id' }],
  ['^app/coin-packages$',        appCoinPkgsIndex,      {}],
  ['^app/coin-packages/([^/]+)$', appCoinPkgsById,      { 1: 'id' }],
  ['^app/heatmap-zones$',        appHeatmapIndex,       {}],
  ['^app/heatmap-zones/([^/]+)$', appHeatmapById,       { 1: 'id' }],
  ['^app/peak-pay$',             appPeakPayIndex,       {}],
  ['^app/peak-pay/([^/]+)$',     appPeakPayById,        { 1: 'id' }],
  ['^app/categories$',           appCategoriesIndex,    {}],
  ['^app/categories/([^/]+)$',   appCategoriesById,     { 1: 'id' }],
  ['^app/clubs$',                appClubsIndex,         {}],
  ['^app/clubs/([^/]+)$',        appClubsById,          { 1: 'id' }],
  ['^app/clubs/([^/]+)/members$',          appClubMembers,      { 1: 'id' }],
  ['^app/clubs/([^/]+)/join-requests$',    appClubJoinRequests, { 1: 'id' }],

  ['^app/restaurants$',          appRestaurantsIndex,   {}],
  ['^app/restaurants/([^/]+)$',  appRestaurantsById,    { 1: 'id' }],
  ['^app/restaurants/([^/]+)/menu$',          appRestaurantMenu,   { 1: 'id' }],
  ['^app/restaurants/([^/]+)/menu/([^/]+)$',  appRestaurantMenu,   { 1: 'id', 2: 'itemId' }],
  ['^app/restaurants/([^/]+)/assign-admin$',  appRestaurantAssign, { 1: 'id' }],

  ['^app/delivery-orders$',      appDeliveryIndex,      {}],
  ['^app/delivery-orders/([^/]+)$', appDeliveryById,    { 1: 'id' }],

  ['^app/drivers$',              appDriversIndex,       {}],
  ['^app/drivers/([^/]+)$',      appDriversById,        { 1: 'id' }],

  ['^app/xt-wallets/([^/]+)$',   appXtWalletByUid,      { 1: 'uid' }],
  ['^app/config/([^/]+)$',       appConfigByKey,        { 1: 'key' }],
  ['^app/users/([^/]+)$',        appUsersById,          { 1: 'id' }],
  ['^app/feed/([^/]+)$',         appFeedById,           { 1: 'id' }],
];

// Pre-compile regexes once.
const COMPILED = ROUTES.map(([rx, mod, params]) => [new RegExp(rx), mod, params]);

export default async function handler(req, res) {
  // Prefer the catch-all query param `path`, but fall back to parsing the
  // URL pathname so the dispatcher works regardless of how Vercel routes
  // the request (catch-all, explicit rewrite, etc.).
  const raw = req.query.path;
  let segments = Array.isArray(raw) ? raw : (raw ? [raw] : []);

  if (!segments.length) {
    try {
      const u = new URL(req.url, 'http://localhost');
      const after = u.pathname.replace(/^\/api\/admin\/?/, '');
      if (after) segments = after.split('/').filter(Boolean);
    } catch { /* ignore */ }
  }

  const joined = segments.map(s => decodeURIComponent(s)).join('/');

  for (const [rx, mod, paramMap] of COMPILED) {
    const m = rx.exec(joined);
    if (!m) continue;

    // Merge captured params into req.query
    for (const [idx, key] of Object.entries(paramMap)) {
      req.query[key] = m[Number(idx)];
    }
    delete req.query.path;

    const fn = mod.default ?? mod;
    if (typeof fn !== 'function') {
      res.status(500).json({ error: `Handler for /${joined} is not a function` });
      return;
    }
    return fn(req, res);
  }

  res.status(404).json({ error: `No admin route matches /${joined}` });
}
