import { useEffect, useState } from 'react';
import { Loader2, RefreshCw, Shield, Ban } from 'lucide-react';
import { api } from '../lib/api.js';
import PageHeader from './components/PageHeader.jsx';

const ROLES = ['customer','restaurant','fulfillment','editor','admin','superAdmin'];

export default function Customers() {
  const [items, setItems] = useState(null);
  const [q, setQ]         = useState('');
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setError(null);
    try {
      const data = await api('/api/admin/customers' + (q ? `?q=${encodeURIComponent(q)}` : ''));
      setItems(data.items ?? []);
    } catch (e) { setError(e.message); setItems([]); }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  const update = async (id, patch) => {
    setBusyId(id); setError(null);
    try {
      await api(`/api/admin/customers/${id}`, { method: 'PATCH', body: patch });
      await load();
    } catch (e) { setError(e.message); }
    finally { setBusyId(null); }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Admin"
        title="Users"
        description="Search and manage roles. Role changes propagate to the mobile app on next token refresh."
        actions={
          <>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by email prefix" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white outline-none" />
            <button onClick={load} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 hover:text-white">
              <RefreshCw size={12} /> Search
            </button>
          </>
        }
      />

      {error && <p className="text-red-300 text-sm mb-4">{error}</p>}

      {items === null ? <Loader2 className="animate-spin text-[#FF7A00] mx-auto block my-12" /> :
        items.length === 0 ? <p className="text-center text-white/45 py-12">No users found.</p> : (
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
            <table className="min-w-full text-sm">
              <thead className="bg-white/[0.04] text-left text-white/55">
                <tr>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {items.map(u => (
                  <tr key={u.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-mono text-xs">{u.email ?? '—'}</td>
                    <td className="px-4 py-3">{u.displayName ?? '—'}</td>
                    <td className="px-4 py-3">
                      <select
                        defaultValue={u.role ?? 'customer'}
                        disabled={busyId === u.id}
                        onChange={(e) => update(u.id, { role: e.target.value })}
                        className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs text-white"
                      >
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {u.isBlocked ? <span className="text-red-300 text-xs">Blocked</span> : <span className="text-emerald-300 text-xs">Active</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => update(u.id, { isBlocked: !u.isBlocked })}
                        disabled={busyId === u.id}
                        className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${u.isBlocked ? 'border-emerald-400/30 text-emerald-300 hover:bg-emerald-400/10' : 'border-red-400/30 text-red-300 hover:bg-red-400/10'}`}
                      >
                        {busyId === u.id ? <Loader2 size={10} className="animate-spin" /> : u.isBlocked ? <Shield size={10} /> : <Ban size={10} />}
                        {u.isBlocked ? 'Unblock' : 'Block'}
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
