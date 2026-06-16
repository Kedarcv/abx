import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { api } from '../lib/api.js';
import PageHeader from './components/PageHeader.jsx';

export default function AuditLog() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api('/api/admin/audit?limit=200')
      .then(({ items }) => setItems(items))
      .catch(e => { setError(e.message); setItems([]); });
  }, []);

  return (
    <div>
      <PageHeader eyebrow="Admin" title="Audit log" description="Every admin write, recorded." />

      {error && <p className="text-red-300 text-sm mb-3">{error}</p>}

      {items === null ? <Loader2 className="animate-spin text-[#FF7A00]" /> :
        items.length === 0 ? <p className="text-white/45 text-center py-12">No events yet.</p> : (
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
            <table className="min-w-full text-sm">
              <thead className="bg-white/[0.04] text-left text-white/55">
                <tr>
                  <th className="px-4 py-3">When</th>
                  <th className="px-4 py-3">Actor</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Entity</th>
                  <th className="px-4 py-3">ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {items.map(e => (
                  <tr key={e.id}>
                    <td className="px-4 py-2 text-xs text-white/55 font-mono">{e.at ? new Date(e.at).toLocaleString() : '—'}</td>
                    <td className="px-4 py-2 text-xs">{e.actorEmail ?? e.actorId ?? '—'}</td>
                    <td className="px-4 py-2"><span className="rounded bg-white/5 px-2 py-0.5 text-xs font-mono">{e.action}</span></td>
                    <td className="px-4 py-2 text-xs text-white/70">{e.entityType}</td>
                    <td className="px-4 py-2 text-xs text-white/55 font-mono">{e.entityId ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </div>
  );
}
