import { useEffect, useState } from 'react';
import { Loader2, RefreshCw, Check, Ban } from 'lucide-react';
import { api } from '../../lib/api.js';
import PageHeader from '../components/PageHeader.jsx';

export default function Drivers() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setError(null);
    try { const { items } = await api('/api/admin/app/drivers'); setItems(items); }
    catch (e) { setError(e.message); setItems([]); }
  };
  useEffect(() => { load(); }, []);

  const update = async (id, patch) => {
    setBusyId(id);
    try { await api(`/api/admin/app/drivers/${id}`, { method: 'PATCH', body: patch }); await load(); }
    catch (e) { setError(e.message); }
    finally { setBusyId(null); }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Delivery"
        title="Drivers"
        description="Approve or ban delivery drivers."
        actions={<button onClick={load} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70"><RefreshCw size={12} />Refresh</button>}
      />

      {error && <p className="text-red-300 text-sm mb-3">{error}</p>}

      {items === null ? <Loader2 className="animate-spin text-[#FF7A00]" /> :
        items.length === 0 ? <p className="text-white/45 text-center py-12">No drivers.</p> : (
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
            <table className="min-w-full text-sm">
              <thead className="bg-white/[0.04] text-left text-white/55">
                <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Approved</th><th className="px-4 py-3">Banned</th><th className="px-4 py-3 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {items.map(d => (
                  <tr key={d.id}>
                    <td className="px-4 py-2">{d.displayName ?? d.name ?? '—'}</td>
                    <td className="px-4 py-2 text-xs font-mono">{d.email ?? '—'}</td>
                    <td className="px-4 py-2">{d.approved ? <span className="text-emerald-300">✓</span> : <span className="text-white/45">—</span>}</td>
                    <td className="px-4 py-2">{d.banned ? <span className="text-red-300">Banned</span> : <span className="text-white/45">—</span>}</td>
                    <td className="px-4 py-2 text-right">
                      <button onClick={() => update(d.id, { approved: !d.approved })} disabled={busyId === d.id} className="mr-2 inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] hover:text-emerald-300">
                        <Check size={10} /> {d.approved ? 'Unapprove' : 'Approve'}
                      </button>
                      <button onClick={() => update(d.id, { banned: !d.banned })} disabled={busyId === d.id} className="inline-flex items-center gap-1 rounded-full border border-red-400/30 bg-red-500/10 text-red-300 px-3 py-1 text-[11px]">
                        <Ban size={10} /> {d.banned ? 'Unban' : 'Ban'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </div>
  );
}
