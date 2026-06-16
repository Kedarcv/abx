import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, RefreshCw } from 'lucide-react';
import { api } from '../../lib/api.js';
import PageHeader from '../components/PageHeader.jsx';

const STATUSES = ['placed','accepted','preparing','ready','assigned','picked_up','delivered','canceled'];

export default function DeliveryOrders() {
  const [items, setItems] = useState(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setError(null);
    try {
      const p = '/api/admin/app/delivery-orders' + (status ? `?status=${status}` : '');
      const { items } = await api(p);
      setItems(items);
    } catch (e) { setError(e.message); setItems([]); }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [status]);

  const update = async (id, patch) => {
    setBusy(true); setError(null);
    try {
      await api(`/api/admin/app/delivery-orders/${id}`, { method: 'PATCH', body: patch });
      await load();
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Delivery"
        title="Delivery orders"
        description="Restaurant order pipeline. Status changes write to /orders/{id}/status_updates."
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

      {error && <p className="text-red-300 text-sm mb-3">{error}</p>}

      {items === null ? <Loader2 className="animate-spin text-[#FF7A00] mx-auto block my-12" /> :
        items.length === 0 ? <p className="text-white/45 text-center py-12">No delivery orders.</p> : (
          <motion.ul layout className="space-y-3">
            {items.map(o => (
              <li key={o.id} className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-white/45 font-mono">#{(o.number ?? o.id).toString().slice(0,8)}</p>
                    <p className="text-sm">{o.customerName ?? o.email ?? 'Customer'}</p>
                    <p className="text-[11px] text-white/45 mt-1">{o.restaurantName ?? o.restaurantId}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-white/55">{o.status}</span>
                    <select
                      defaultValue={o.status}
                      onChange={(e) => update(o.id, { status: e.target.value })}
                      disabled={busy}
                      className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs"
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </li>
            ))}
          </motion.ul>
        )}
    </div>
  );
}
