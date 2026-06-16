import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './Layout'
import Home from './pages/Home/Home'
import Shop from './pages/Shop/Shop'
import ProductDetail from './pages/Shop/ProductDetail'
import Checkout from './pages/Checkout/Checkout'
import CheckoutSuccess from './pages/Checkout/Success'
import CheckoutCancel from './pages/Checkout/Cancel'
import Login from './pages/Account/Login'
import AcceptInvite from './pages/Account/AcceptInvite'
import AccountOrders from './pages/Account/Orders'

import AdminLayout from './admin/AdminLayout'
import Dashboard   from './admin/Dashboard'
import AdminProducts    from './admin/Products'
import AdminCollections from './admin/Collections'
import AdminOrders      from './admin/Orders'
import AdminMedia       from './admin/Media'
import AdminDiscounts   from './admin/Discounts'
import AdminShipping    from './admin/Shipping'
import AdminSettings    from './admin/Settings'
import AdminContent     from './admin/Content'
import AdminCustomers   from './admin/Customers'
import AdminInvitations from './admin/Invitations'
import AdminAuditLog    from './admin/AuditLog'
import AdminBroadcast   from './admin/Broadcast'
import AdminXtWallets   from './admin/XtWallets'

import {
  PromosPage, PromoCodesPage, ChallengesPage, WorkoutsPage, VolunteerEventsPage,
  AnnouncementsPage, RewardsPage, BadgesPage, DistrictsPage, MarketplacePage,
  PrizeDrawsPage, CoinPackagesPage, HeatmapZonesPage, PeakPayPage, CategoriesPage,
  RestaurantsPage, ClubsPage,
} from './admin/app/AppEntityPages'
import ClubDetail from './admin/app/ClubDetail'
import RestaurantDetail from './admin/app/RestaurantDetail'
import DeliveryOrders from './admin/app/DeliveryOrders'
import Drivers        from './admin/app/Drivers'
import AppConfig      from './admin/app/AppConfig'

import loaderLogo from './assets/Images/abxlogo2.png'

const MINIMUM_LOADER_TIME = 900

function InitialLoader() {
  return (
    <div
      aria-label="Loading"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
      role="status"
    >
      <div className="relative flex h-32 w-32 items-center justify-center sm:h-40 sm:w-40">
        <div className="absolute inset-0 rounded-full border border-white/10 border-t-[#FF7A00] animate-spin" />
        <img
          src={loaderLogo}
          alt=""
          className="h-20 w-20 object-contain drop-shadow-[0_0_18px_rgba(255,122,0,0.45)] sm:h-24 sm:w-24"
        />
      </div>
    </div>
  )
}

function App() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let timeoutId
    const finishLoading = () => { timeoutId = window.setTimeout(() => setIsLoading(false), MINIMUM_LOADER_TIME) }
    if (document.readyState === 'complete') finishLoading()
    else window.addEventListener('load', finishLoading, { once: true })
    return () => {
      window.removeEventListener('load', finishLoading)
      if (timeoutId) window.clearTimeout(timeoutId)
    }
  }, [])

  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Storefront (uses the public Layout with navbar/footer/cart) */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/shop/:slug" element={<ProductDetail />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/checkout/success" element={<CheckoutSuccess />} />
            <Route path="/checkout/cancel" element={<CheckoutCancel />} />
            <Route path="/login" element={<Login />} />
            <Route path="/account/orders" element={<AccountOrders />} />
            <Route path="/admin/accept-invite" element={<AcceptInvite />} />
          </Route>

          {/* Admin SPA (own layout — no public navbar/footer) */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products"    element={<AdminProducts />} />
            <Route path="collections" element={<AdminCollections />} />
            <Route path="orders"      element={<AdminOrders />} />
            <Route path="media"       element={<AdminMedia />} />
            <Route path="discounts"   element={<AdminDiscounts />} />
            <Route path="shipping"    element={<AdminShipping />} />
            <Route path="content"     element={<AdminContent />} />
            <Route path="settings"    element={<AdminSettings />} />
            <Route path="customers"   element={<AdminCustomers />} />
            <Route path="invitations" element={<AdminInvitations />} />
            <Route path="audit"       element={<AdminAuditLog />} />
            <Route path="broadcast"   element={<AdminBroadcast />} />
            <Route path="xt-wallets"  element={<AdminXtWallets />} />

            {/* ABX-Motion app admin */}
            <Route path="app/promos"           element={<PromosPage />} />
            <Route path="app/promo-codes"      element={<PromoCodesPage />} />
            <Route path="app/challenges"       element={<ChallengesPage />} />
            <Route path="app/clubs"            element={<ClubsPage />} />
            <Route path="app/clubs/:id"        element={<ClubDetail />} />
            <Route path="app/restaurants/:id"  element={<RestaurantDetail />} />
            <Route path="app/workouts"         element={<WorkoutsPage />} />
            <Route path="app/volunteer-events" element={<VolunteerEventsPage />} />
            <Route path="app/announcements"    element={<AnnouncementsPage />} />
            <Route path="app/rewards"          element={<RewardsPage />} />
            <Route path="app/badges"           element={<BadgesPage />} />
            <Route path="app/districts"        element={<DistrictsPage />} />
            <Route path="app/marketplace"      element={<MarketplacePage />} />
            <Route path="app/prize-draws"      element={<PrizeDrawsPage />} />
            <Route path="app/coin-packages"    element={<CoinPackagesPage />} />
            <Route path="app/heatmap-zones"    element={<HeatmapZonesPage />} />
            <Route path="app/peak-pay"         element={<PeakPayPage />} />
            <Route path="app/categories"       element={<CategoriesPage />} />
            <Route path="app/restaurants"      element={<RestaurantsPage />} />
            <Route path="app/delivery-orders"  element={<DeliveryOrders />} />
            <Route path="app/drivers"          element={<Drivers />} />
            <Route path="app/config"           element={<AppConfig />} />
          </Route>
        </Routes>
      </BrowserRouter>
      {isLoading && <InitialLoader />}
    </>
  )
}

export default App
