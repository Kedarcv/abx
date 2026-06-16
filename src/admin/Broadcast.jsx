import { useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import { api } from '../lib/api.js';
import PageHeader from './components/PageHeader.jsx';

export default function Broadcast() {
  const [draft, setDraft] = useState({ title: '', body: '', segment: 'all', topic: '' });
  const [busy, setBusy]   = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const send = async (e) => {
    e.preventDefault();
    if (!confirm('Send this push notification?')) return;
    setBusy(true); setError(null); setNotice(null);
    try {
      const body = { ...draft };
      if (body.segment !== 'topic') delete body.topic;
      await api('/api/admin/broadcast', { method: 'POST', body });
      setNotice('Notification queued.');
      setDraft({ title: '', body: '', segment: 'all', topic: '' });
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="max-w-xl">
      <PageHeader
        eyebrow="Admin"
        title="Send broadcast"
        description="Pushes via Firebase Cloud Messaging to a chosen segment."
      />

      <form onSubmit={send} className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 sm:p-8 space-y-4">
        <Field label="Title">
          <input value={draft.title} onChange={(e) => setDraft(d => ({ ...d, title: e.target.value }))} required maxLength={120} className={cls} />
        </Field>
        <Field label="Body">
          <textarea value={draft.body} onChange={(e) => setDraft(d => ({ ...d, body: e.target.value }))} required maxLength={500} rows={4} className={cls} />
        </Field>
        <Field label="Audience">
          <select value={draft.segment} onChange={(e) => setDraft(d => ({ ...d, segment: e.target.value }))} className={cls}>
            <option value="all">All users</option>
            <option value="admins">Admins</option>
            <option value="topic">Custom FCM topic</option>
          </select>
        </Field>
        {draft.segment === 'topic' && (
          <Field label="Topic name">
            <input value={draft.topic} onChange={(e) => setDraft(d => ({ ...d, topic: e.target.value }))} required className={cls} />
          </Field>
        )}

        {error  && <p className="text-red-300 text-sm">{error}</p>}
        {notice && <p className="text-emerald-300 text-sm">{notice}</p>}

        <button disabled={busy} className="inline-flex items-center gap-1.5 rounded-full bg-[#FF7A00] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-black disabled:opacity-60">
          {busy ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
          Send
        </button>
      </form>
    </div>
  );
}

const cls = 'w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-[#FF7A00]/60';
function Field({ label, children }) {
  return <label className="block"><span className="mb-1 block text-xs text-white/55">{label}</span>{children}</label>;
}
