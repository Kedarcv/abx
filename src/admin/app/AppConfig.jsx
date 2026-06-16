import { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { api } from '../../lib/api.js';
import PageHeader from '../components/PageHeader.jsx';

const KEYS = ['featureFlags', 'general', 'integrations', 'announcements'];

export default function AppConfig() {
  const [active, setActive] = useState(KEYS[0]);
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const { config } = await api(`/api/admin/app/config/${active}`);
      setValue(config ? JSON.stringify(config, null, 2) : '{\n  \n}');
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [active]);

  const save = async () => {
    setSaving(true); setError(null); setNotice(null);
    try {
      const parsed = JSON.parse(value);
      await api(`/api/admin/app/config/${active}`, { method: 'PUT', body: parsed });
      setNotice('Saved.');
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Admin"
        title="App config"
        description="ABX-Motion app-wide settings and feature flags (/config/{key} in Firestore)."
      />

      <div className="flex flex-wrap gap-2 mb-5">
        {KEYS.map(k => (
          <button key={k} onClick={() => setActive(k)}
            className={`rounded-full border px-4 py-1.5 text-xs font-medium ${active === k ? 'bg-[#FF7A00] text-black border-[#FF7A00]' : 'bg-white/5 text-white/65 border-white/10 hover:text-white'}`}>
            {k}
          </button>
        ))}
      </div>

      {error  && <p className="text-red-300 text-sm mb-3">{error}</p>}
      {notice && <p className="text-emerald-300 text-sm mb-3">{notice}</p>}

      {loading ? <Loader2 className="animate-spin text-[#FF7A00]" /> : (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={20}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs font-mono text-white outline-none focus:border-[#FF7A00]/60"
            placeholder='{ "key": "value" }'
          />
          <button onClick={save} disabled={saving} className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#FF7A00] px-5 py-2 text-xs font-semibold uppercase tracking-wider text-black disabled:opacity-60">
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
            Save config
          </button>
        </div>
      )}
    </div>
  );
}
