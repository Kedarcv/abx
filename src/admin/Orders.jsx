import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, ExternalLink, RefreshCw, Truck } from 'lucide-react';
import { api } from '../lib/api.js';
import { formatPrice } from '../data/catalog.js';
import PageHeader from './components/PageHeader.jsx';

const STATUSES = ['pending','paid','fulfilled','shipped','canceled','refunded','failed'];

export default function Orders() {
  const [status, setStatus] = useState('');
  const [items, setItems]   = useState(null);
  const [error, setError]   = useState(null);
  const [busy,  setBusy]    = useState(false);

  const load = async () => {
    setError(null);
    try {
      const path = '/api/admin/orders' + (status ? `?status=${status}` : '');
      const data = await api(path);
      setItems(data.items ?? []);
    } catch (e) { setError(e.message); setItems([]); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [status]);

  const update = async (id, patch) => {
    setBusy(true); setError(null);
    try {
      await api(`/api/admin/orders/${id}`, { method: 'PATCH', body: patch });
      await load();
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  const refund = async (id) => {
    if (!confirm('Issue a full refund for this order?')) return;
    setBusy(true); setError(null);
    try {
      await api(`/api/admin/orders/${id}/refund`, { method: 'POST', body: {} });
      await load();
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Storefront"
        title="Orders"
        description="Storefront orders. Stripe handles payment + webhooks update status."
        actions={
          <>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80">
              <option value="">All statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={load} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 hover:text-white">
              <RefreshCw size={12} /> Refresh
            </button>
          </>
        }
      />

      {error && <p className="text-red-300 text-sm mb-4">{error}</p>}

      {items === null ? <Loader2 className="animate-spin text-[#FF7A00] mx-auto block my-12" /> :
        items.length === 0 ? <p className="text-center text-white/45 py-12">No orders.</p> : (
          <motion.ul layout className="space-y-3">
            {items.map(o => (
              <li key={o.id} className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
                <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr_auto] items-center gap-4 px-5 py-4">
                  <div>
                    <p className="text-xs font-mono text-white/45">#{o.number}</p>
                    <p className="text-xs text-white/45 mt-1">{new Date(o.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm truncate">{o.email}</p>
                    {o.trackingNumber && (
                      <p className="text-[11px] text-white/55 mt-1 flex items-center gap-1">
                        <Truck size={11} /> {o.trackingCarrier ?? 'Tracking'}: {o.trackingNumber}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                    <span className="font-mono text-base tabular-nums">{formatPrice(o.totalCents ?? 0, o.currency)}</span>
                    <StatusBadge status={o.status} />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 border-t border-white/5 px-5 py-3">
                  {o.status === 'paid' && (
                    <ActionBtn label="Mark fulfilled" onClick={() => update(o.id, { status: 'fulfilled' })} />
                  )}
                  {(o.status === 'paid' || o.status === 'fulfilled') && (
                    <>
                      <ActionBtn label="Mark shipped" onClick={() => {
                        const carrier = prompt('Carrier (e.g. UPS, FedEx):');
                        const number  = prompt('Tracking number:');
                        if (number) update(o.id, { status: 'shipped', trackingCarrier: carrier, trackingNumber: number });
                      }} />
                      <ActionBtn label="Refund" onClick={() => refund(o.id)} variant="danger" />
                    </>
                  )}
                  {o.status === 'pending' && (
                    <ActionBtn label="Cancel" onClick={() => update(o.id, { status: 'canceled' })} variant="ghost" />
                  )}
                  {o.stripePaymentIntent && (
                    <a
                      href={`https://dashboard.stripe.com/payments/${o.stripePaymentIntent}`}
                      target="_blank" rel="noreferrer"
                      className="ml-auto inline-flex items-center gap-1 text-[11px] text-white/55 hover:text-white"
                    >
                      Stripe <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              </li>
            ))}
          </motion.ul>
        )}
      {busy && <p className="text-xs text-white/45 mt-4">Working…</p>}
    </div>
  );
}

function ActionBtn({ label, onClick, variant = 'default' }) {
  const cls = variant === 'danger'
    ? 'border-red-400/30 text-red-300 hover:bg-red-400/10'
    : variant === 'ghost'
      ? 'border-white/10 text-white/55 hover:text-white'
      : 'border-white/10 bg-white/5 text-white/85 hover:border-[#FF7A00]/40 hover:text-[#FF7A00]';
  return (
    <button onClick={onClick} className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider ${cls}`}>
      {label}
    </button>
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
