import { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { api } from '../lib/api.js';
import PageHeader from './components/PageHeader.jsx';

const KEYS = ['hero', 'about', 'team', 'partners', 'homeHero'];

export default function Content() {
  const [active, setActive] = useState(KEYS[0]);
  const [value, setValue]   = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState(null);
  const [notice, setNotice] = useState(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const data = await api(`/api/admin/content/${active}`);
      const v = data.block?.value;
      setValue(v == null ? '' : (typeof v === 'string' ? v : JSON.stringify(v, null, 2)));
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [active]);

  const save = async () => {
    setSaving(true); setError(null); setNotice(null);
    try {
      let payload;
      try { payload = JSON.parse(value); } catch { payload = value; }
      await api(`/api/admin/content/${active}`, { method: 'PUT', body: { value: payload } });
      setNotice('Saved.');
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Storefront"
        title="Site content"
        description="Editable text + JSON blocks for the home page sections."
      />

      <div className="flex flex-wrap gap-2 mb-5">
        {KEYS.map(k => (
          <button
            key={k}
            onClick={() => setActive(k)}
            className={`rounded-full border px-4 py-1.5 text-xs font-medium uppercase tracking-wider ${active === k ? 'bg-[#FF7A00] text-black border-[#FF7A00]' : 'bg-white/5 text-white/65 border-white/10 hover:text-white'}`}
          >
            {k}
          </button>
        ))}
      </div>

      {error  && <p className="text-red-300 text-sm mb-3">{error}</p>}
      {notice && <p className="text-emerald-300 text-sm mb-3">{notice}</p>}

      {active === 'homeHero' && (
        <div className="mb-4 rounded-2xl border border-[#FF7A00]/30 bg-[#FF7A00]/[0.06] p-4 text-xs text-white/80">
          <p className="mb-2 font-semibold text-white">Home dashboard carousel</p>
          <p className="mb-2 text-white/65">
            Drives the featured carousel on the mobile home screen. Slides render in the
            listed order. Saving here updates the app live (no release needed).
          </p>
          <pre className="overflow-x-auto rounded-lg bg-black/40 p-3 font-mono text-[11px] leading-snug text-white/70">
{`{
  "slides": [
    {
      "kind": "challenge",          // notification | event | product | club | challenge | generic
      "title": "Featured\\nchallenges",
      "subtitle": "May sprint kicks off Friday",
      "cta": "Join now",
      "route": "/social/challenges",
      "icon": "trophy",              // bolt | trophy | bag | club | event | bell | restaurant | route | star
      "background": "#2F7BFF",
      "foreground": "#000000",
      "ctaBackground": "#000000",
      "ctaForeground": "#2F7BFF",
      "imageUrl": ""                  // optional
    }
  ]
}`}
          </pre>
        </div>
      )}

      {loading ? <Loader2 className="animate-spin text-[#FF7A00]" /> : (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={18}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-[#FF7A00]/60 font-mono"
            placeholder="Plain text or JSON…"
          />
          <button
            onClick={save}
            disabled={saving}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#FF7A00] px-5 py-2 text-xs font-semibold uppercase tracking-wider text-black disabled:opacity-60"
          >
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
            Save block
          </button>
        </div>
      )}
    </div>
  );
}
