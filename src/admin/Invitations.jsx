import { useEffect, useState } from 'react';
import { Loader2, Send, UserPlus } from 'lucide-react';
import { api } from '../lib/api.js';
import PageHeader from './components/PageHeader.jsx';

export default function Invitations() {
  const [items, setItems] = useState(null);
  const [email, setEmail] = useState('');
  const [role, setRole]   = useState('editor');
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [sending, setSending] = useState(false);

  const load = async () => {
    try { const { items } = await api('/api/admin/invitations'); setItems(items); }
    catch (e) { setError(e.message); setItems([]); }
  };
  useEffect(() => { load(); }, []);

  const invite = async (e) => {
    e.preventDefault();
    setSending(true); setError(null); setNotice(null);
    try {
      const resp = await api('/api/admin/invitations', { method: 'POST', body: { email, role } });
      const status = resp?.email?.status;
      const from = resp?.email?.from;
      const errMsg = resp?.email?.error;
      if (status === 'sent') {
        setNotice(`Invitation sent to ${email}${from ? ` (from ${from})` : ''}.`);
      } else if (status === 'skipped') {
        setNotice(`Invitation saved. Email not sent — RESEND_API_KEY missing. Accept URL: ${resp?.acceptUrl}`);
      } else {
        setError(`Invitation saved but email failed: ${errMsg ?? 'unknown error'}. Accept URL: ${resp?.acceptUrl}`);
      }
      setEmail('');
      await load();
    } catch (err) { setError(err.message); }
    finally { setSending(false); }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Admin"
        title="Invite staff"
        description="Sends a magic link via Resend. Recipient must sign in with the invited email to claim the role."
      />

      <form onSubmit={invite} className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 mb-8 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs text-white/55 mb-1">Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-[#FF7A00]/60" />
        </div>
        <div>
          <label className="block text-xs text-white/55 mb-1">Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm">
            <option value="fulfillment">fulfillment</option>
            <option value="editor">editor</option>
            <option value="admin">admin</option>
            <option value="superAdmin">superAdmin</option>
          </select>
        </div>
        <button type="submit" disabled={sending} className="inline-flex items-center gap-1.5 rounded-full bg-[#FF7A00] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-black disabled:opacity-60">
          {sending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
          Send invite
        </button>
      </form>

      {error  && <p className="text-red-300 text-sm mb-3">{error}</p>}
      {notice && <p className="text-emerald-300 text-sm mb-3">{notice}</p>}

      <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
        <header className="flex items-center gap-2 border-b border-white/10 px-6 py-3 text-sm uppercase tracking-[0.2em] text-white/55 font-orbitron">
          <UserPlus size={14} /> Recent invitations
        </header>
        {items === null ? <Loader2 className="animate-spin text-[#FF7A00] mx-auto block my-8" /> :
          items.length === 0 ? <p className="p-8 text-center text-white/45">None yet.</p> : (
            <ul className="divide-y divide-white/5">
              {items.map(i => {
                const emailColor =
                  i.emailStatus === 'failed' ? 'text-red-300' :
                  i.emailStatus === 'skipped' ? 'text-yellow-300' :
                  i.emailStatus === 'sent' ? 'text-emerald-300' : 'text-white/30';
                return (
                <li key={i.id} className="flex items-center justify-between gap-3 px-6 py-3 text-sm">
                  <span className="flex-1 truncate">{i.email}</span>
                  <span className="text-xs uppercase text-white/55 font-mono">{i.role}</span>
                  {i.emailStatus && (
                    <span className={`text-[10px] uppercase tracking-wider ${emailColor}`} title={i.emailError ?? ''}>
                      email: {i.emailStatus}
                    </span>
                  )}
                  <span className="text-xs text-white/40">
                    {i.acceptedAt ? `accepted ${new Date(i.acceptedAt).toLocaleDateString()}` :
                     new Date(i.expiresAt) < new Date() ? 'expired' : 'pending'}
                  </span>
                </li>
              );})}
            </ul>
          )}
      </div>
    </div>
  );
}
