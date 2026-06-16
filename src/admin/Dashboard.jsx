import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Receipt, Users, Package, ArrowUpRight, Loader2 } from 'lucide-react';
import { api } from '../lib/api.js';
import { useAuth } from '../store/auth.js';
import { formatPrice } from '../data/catalog.js';

export default function Dashboard() {
  const { loading: authLoading, user } = useAuth();
  const [stats, setStats]   = useState(null);
  const [recent, setRecent] = useState([]);
  const [err, setErr]       = useState(null);

  useEffect(() => {
    if (authLoading || !user) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await api('/api/admin/stats');
        if (cancelled) return;
        setStats(data.stats);
        setRecent(data.recent ?? []);
      } catch (e) {
        if (!cancelled) setErr(e.message);
      }
    })();
    return () => { cancelled = true; };
  }, [authLoading, user]);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-white/40 font-orbitron mb-2">Dashboard</p>
        <h1 className="text-3xl sm:text-4xl font-bold font-orbitron">Welcome back</h1>
        <p className="text-sm text-white/55 mt-2">Snapshot of the storefront and ecosystem.</p>
      </header>

      {err && <p className="text-red-300 text-sm">{err}</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={ShoppingBag} label="Active products" value={stats?.activeProducts} to="/admin/products" />
        <StatCard icon={Receipt}     label="Paid orders"     value={stats?.paid}           to="/admin/orders" tint="emerald" />
        <StatCard icon={Package}     label="Pending"         value={stats?.pending}        to="/admin/orders" tint="yellow" />
        <StatCard icon={Users}       label="Users"           value={stats?.users}          to="/admin/customers" />
      </div>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-sm uppercase tracking-[0.25em] text-white/55 font-orbitron">Recent orders</h2>
          <Link to="/admin/orders" className="inline-flex items-center gap-1 text-xs text-white/60 hover:text-white">
            View all <ArrowUpRight size={12} />
          </Link>
        </header>
        {!stats ? (
          <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-[#FF7A00]" /></div>
        ) : recent.length === 0 ? (
          <p className="p-10 text-center text-white/45">No orders yet.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {recent.map(o => (
              <li key={o.id}>
                <Link to={`/admin/orders/${o.id}`} className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 hover:bg-white/[0.02]">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-xs text-white/45">#{o.number}</span>
                    <span className="text-sm truncate max-w-[200px]">{o.email}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <StatusBadge status={o.status} />
                    <span className="font-mono text-sm tabular-nums w-[80px] text-right">
                      {formatPrice(o.totalCents ?? 0, o.currency)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, to, tint }) {
  const tintCls = tint === 'emerald' ? 'text-emerald-300'
                : tint === 'yellow'  ? 'text-[#F4EC47]'
                : 'text-[#FF7A00]';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5"
    >
      <Link to={to} className="block">
        <div className="flex items-start justify-between mb-3">
          <Icon className={tintCls} size={22} />
          <ArrowUpRight size={14} className="text-white/30" />
        </div>
        <p className="text-xs uppercase tracking-wider text-white/45 mb-1">{label}</p>
        <p className="text-3xl font-bold font-mono tabular-nums">
          {value ?? '—'}
        </p>
      </Link>
    </motion.div>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending:   'bg-white/10 text-white/65',
    paid:      'bg-[#F4EC47]/20 text-[#F4EC47]',
    fulfilled: 'bg-emerald-500/20 text-emerald-300',
    shipped:   'bg-emerald-500/20 text-emerald-300',
    refunded:  'bg-orange-500/20 text-orange-300',
    canceled:  'bg-white/10 text-white/40',
    failed:    'bg-red-500/20 text-red-300',
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${map[status] ?? 'bg-white/10 text-white/60'}`}>
      {status}
    </span>
  );
}
