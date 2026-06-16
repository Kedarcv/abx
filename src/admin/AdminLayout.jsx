import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ShoppingBag, Package, Tag, Truck, Image as ImageIcon,
  Users, Settings, FileText, Receipt, History, UserPlus,
  Megaphone, Trophy, Dumbbell, HandHeart, Bell, Sliders,
  Store, ClipboardList, Bike, Wallet, MapPin, Coins, Award, Map,
  Menu, X, LogOut, ChevronRight, ChevronDown,
} from 'lucide-react';
import { useAuth } from '../store/auth.js';

const SECTIONS = [
  {
    label: 'Overview',
    items: [
      { to: '/admin',            icon: LayoutDashboard, label: 'Dashboard', end: true },
    ],
  },
  {
    label: 'Storefront',
    role: 'editor',
    items: [
      { to: '/admin/products',    icon: ShoppingBag, label: 'Products' },
      { to: '/admin/collections', icon: Package,     label: 'Collections' },
      { to: '/admin/media',       icon: ImageIcon,   label: 'Media' },
      { to: '/admin/orders',      icon: Receipt,     label: 'Orders' },
      { to: '/admin/discounts',   icon: Tag,         label: 'Discounts' },
      { to: '/admin/shipping',    icon: Truck,       label: 'Shipping' },
      { to: '/admin/content',     icon: FileText,    label: 'Site content' },
      { to: '/admin/settings',    icon: Settings,    label: 'Store settings', role: 'admin' },
    ],
  },
  {
    label: 'ABX-Motion',
    role: 'editor',
    items: [
      { to: '/admin/app/promos',           icon: Megaphone, label: 'Promotions' },
      { to: '/admin/app/promo-codes',      icon: Tag,        label: 'Promo codes' },
      { to: '/admin/app/challenges',       icon: Trophy,     label: 'Challenges' },
      { to: '/admin/app/clubs',            icon: Users,      label: 'Clubs' },
      { to: '/admin/app/workouts',         icon: Dumbbell,   label: 'Workouts' },
      { to: '/admin/app/volunteer-events', icon: HandHeart,  label: 'Volunteer events' },
      { to: '/admin/app/announcements',    icon: Bell,       label: 'Announcements' },
      { to: '/admin/app/rewards',          icon: Award,      label: 'Rewards' },
      { to: '/admin/app/badges',           icon: Award,      label: 'Badges' },
      { to: '/admin/app/districts',        icon: Map,        label: 'Districts' },
      { to: '/admin/app/prize-draws',      icon: Trophy,     label: 'Prize draws' },
      { to: '/admin/app/coin-packages',    icon: Coins,      label: 'Coin packages' },
    ],
  },
  {
    label: 'Delivery',
    role: 'editor',
    items: [
      { to: '/admin/app/restaurants',     icon: Store,         label: 'Restaurants' },
      { to: '/admin/app/categories',      icon: Package,       label: 'Menu categories' },
      { to: '/admin/app/delivery-orders', icon: ClipboardList, label: 'Delivery orders' },
      { to: '/admin/app/drivers',         icon: Bike,          label: 'Drivers', role: 'admin' },
      { to: '/admin/app/heatmap-zones',   icon: MapPin,        label: 'Heatmap zones' },
      { to: '/admin/app/peak-pay',        icon: Coins,         label: 'Peak pay' },
    ],
  },
  {
    label: 'Admin',
    role: 'admin',
    items: [
      { to: '/admin/customers',   icon: Users,    label: 'Users' },
      { to: '/admin/xt-wallets',  icon: Wallet,   label: 'XT wallets' },
      { to: '/admin/broadcast',   icon: Bell,     label: 'Send broadcast' },
      { to: '/admin/app/config',  icon: Sliders,  label: 'App config' },
      { to: '/admin/invitations', icon: UserPlus, label: 'Invite staff' },
      { to: '/admin/audit',       icon: History,  label: 'Audit log' },
    ],
  },
];

export default function AdminLayout() {
  const { user, role, loading, signOut, hasRole } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen grid place-items-center bg-[#070707] text-white">Loading…</div>;
  }
  if (!user) {
    navigate('/login', { replace: true, state: { from: location.pathname + location.search } });
    return null;
  }
  if (!hasRole('fulfillment')) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#070707] text-white px-6">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold font-orbitron mb-2">No admin access</h1>
          <p className="text-white/55 mb-6">
            Your account ({user.email}) does not have permission to view the admin panel.
          </p>
          <button onClick={signOut} className="rounded-full bg-white/10 px-5 py-2 text-sm hover:bg-white/15">
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070707] text-white flex">
      {/* Sidebar — desktop */}
      <Sidebar className="hidden md:flex" role={role} />

      {/* Sidebar — mobile */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="adm-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              key="adm-panel"
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 36 }}
              className="fixed left-0 top-0 z-[90] h-full w-[260px] bg-[#0a0a0a] border-r border-white/10 md:hidden"
            >
              <Sidebar role={role} onNavigate={() => setOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-white/10 bg-[#0a0a0a]/85 backdrop-blur-xl px-4 sm:px-6 py-3.5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="md:hidden p-2 -ml-2 text-white/65 hover:text-white"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <p className="text-sm uppercase tracking-[0.25em] text-white/55 font-orbitron">
              ABX Motion · Admin
            </p>
          </div>
          <div className="flex items-center gap-3">
            <RoleBadge role={role} />
            <div className="hidden sm:block text-xs text-white/55 max-w-[180px] truncate">{user.email}</div>
            <button
              onClick={() => signOut().then(() => navigate('/'))}
              className="inline-flex items-center gap-1.5 text-xs text-white/65 hover:text-white px-3 py-1.5 rounded-full border border-white/10 hover:border-white/30"
            >
              <LogOut size={12} /> Sign out
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-8 py-6 sm:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function Sidebar({ className = '', role, onNavigate }) {
  const { hasRole } = useAuth();
  return (
    <aside className={`w-[260px] shrink-0 flex flex-col bg-[#0a0a0a] border-r border-white/10 ${className}`}>
      <div className="px-6 py-5 border-b border-white/10">
        <p className="text-base font-bold font-orbitron tracking-wide">ABX <span className="text-[#FF7A00]">Motion</span></p>
        <p className="text-[11px] uppercase tracking-[0.25em] text-white/40 mt-1">Control room</p>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {SECTIONS.map(sec => {
          if (sec.role && !hasRole(sec.role)) return null;
          const visible = sec.items.filter(it => !it.role || hasRole(it.role));
          if (!visible.length) return null;
          return (
            <div key={sec.label}>
              <p className="px-3 text-[10px] uppercase tracking-[0.3em] text-white/35 mb-2">
                {sec.label}
              </p>
              <ul>
                {visible.map(item => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      onClick={onNavigate}
                      className={({ isActive }) => [
                        'group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all',
                        isActive
                          ? 'bg-[#FF7A00]/15 text-white shadow-[inset_0_0_0_1px_rgba(255,122,0,0.35)]'
                          : 'text-white/65 hover:bg-white/[0.04] hover:text-white',
                      ].join(' ')}
                    >
                      <item.icon size={16} className="opacity-80" />
                      <span className="flex-1 truncate">{item.label}</span>
                      <ChevronRight size={12} className="opacity-0 group-hover:opacity-50 transition-opacity" />
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </nav>
      <div className="border-t border-white/10 px-4 py-3 text-[11px] text-white/40">
        Role: <span className="text-white/70 font-mono">{role}</span>
      </div>
    </aside>
  );
}

function RoleBadge({ role }) {
  const cls = role === 'superAdmin' || role === 'admin'
    ? 'bg-[#FF7A00]/20 text-[#FF7A00] border-[#FF7A00]/30'
    : role === 'editor'
      ? 'bg-[#F4EC47]/15 text-[#F4EC47] border-[#F4EC47]/30'
      : 'bg-white/10 text-white/70 border-white/15';
  return (
    <span className={`hidden xs:inline-flex rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-wider ${cls}`}>
      {role}
    </span>
  );
}
