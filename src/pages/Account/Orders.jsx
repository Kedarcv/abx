import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Loader2 } from 'lucide-react';
import { useAuth } from '../../store/auth.js';
import { api } from '../../lib/api.js';
import { formatPrice } from '../../data/catalog.js';

export default function AccountOrders() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading || !user) return;
    api('/api/me/orders')
      .then(({ orders }) => setOrders(orders))
      .catch(err => setError(err.message));
  }, [authLoading, user]);

  if (authLoading) return <FullLoader />;
  if (!user) return (
    <div className="relative min-h-screen pt-32 pb-24 bg-[#070707] text-white grid place-items-center text-center px-6">
      <div>
        <h1 className="text-3xl font-bold font-orbitron mb-3">Sign in to view your orders</h1>
        <Link to="/login" className="inline-flex rounded-full bg-[#FF7A00] px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-black">
          Sign in
        </Link>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen pt-28 pb-24 bg-[#070707] text-white">
      <div className="mx-auto w-[92%] max-w-4xl">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/45 font-orbitron mb-2">Account</p>
            <h1 className="text-4xl font-bold font-orbitron">Your orders</h1>
            <p className="text-sm text-white/55 mt-2">Signed in as {user.email}</p>
          </div>
          <button onClick={signOut} className="text-sm text-white/55 hover:text-white">Sign out</button>
        </div>

        {error && <p className="text-red-300 mb-6">{error}</p>}

        {!orders ? <FullLoader inline /> :
          orders.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-12 text-center">
              <Package className="mx-auto mb-4 text-white/40" size={36} />
              <p className="text-white/65 mb-5">No orders yet.</p>
              <Link to="/shop" className="rounded-full bg-[#FF7A00] px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-black">
                Visit shop
              </Link>
            </div>
          ) : (
            <motion.ul layout className="space-y-3">
              {orders.map(o => (
                <li key={o.id} className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-mono text-white/55">#{o.number}</p>
                    <p className="text-base font-semibold">{o.email}</p>
                    <p className="text-xs text-white/40 mt-1">{new Date(o.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge status={o.status} />
                    <span className="font-mono text-lg tabular-nums">{formatPrice(o.totalCents ?? 0, o.currency)}</span>
                  </div>
                </li>
              ))}
            </motion.ul>
          )
        }
      </div>
    </div>
  );
}

function Badge({ status }) {
  const map = {
    pending:    'bg-white/10 text-white/70',
    paid:       'bg-[#F4EC47]/20 text-[#F4EC47]',
    fulfilled:  'bg-emerald-500/20 text-emerald-300',
    shipped:    'bg-emerald-500/20 text-emerald-300',
    canceled:   'bg-white/10 text-white/40',
    refunded:   'bg-orange-500/20 text-orange-300',
    failed:     'bg-red-500/20 text-red-300',
  };
  return (
    <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${map[status] ?? 'bg-white/10 text-white/60'}`}>
      {status}
    </span>
  );
}

function FullLoader({ inline }) {
  return (
    <div className={inline ? 'flex justify-center py-12' : 'min-h-screen grid place-items-center bg-[#070707]'}>
      <Loader2 className="animate-spin text-[#FF7A00]" size={32} />
    </div>
  );
}
