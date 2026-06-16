import { useState } from 'react';
import { Loader2, Search, Wallet, Plus, Minus } from 'lucide-react';
import { api } from '../lib/api.js';
import PageHeader from './components/PageHeader.jsx';

export default function XtWallets() {
  const [uid, setUid]       = useState('');
  const [wallet, setWallet] = useState(null);
  const [delta, setDelta]   = useState(100);
  const [reason, setReason] = useState('admin_adjust');
  const [error, setError]   = useState(null);
  const [busy, setBusy]     = useState(false);

  const load = async (e) => {
    if (e) e.preventDefault();
    setError(null); setWallet(null);
    if (!uid) return;
    try {
      const { wallet } = await api(`/api/admin/app/xt-wallets/${uid}`);
      setWallet(wallet);
    } catch (err) { setError(err.message); }
  };

  const adjust = async (sign) => {
    setBusy(true); setError(null);
    try {
      const { balance } = await api(`/api/admin/app/xt-wallets/${uid}`, {
        method: 'PATCH',
        body: { delta: sign * delta, reason },
      });
      setWallet(w => ({ ...(w ?? {}), balance }));
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="max-w-xl">
      <PageHeader
        eyebrow="Admin"
        title="XT wallets"
        description="Adjust user XT balances. Every change is recorded in /xt_ledger."
      />

      <form onSubmit={load} className="flex items-end gap-2 mb-6">
        <div className="flex-1">
          <label className="block text-xs text-white/55 mb-1">User UID</label>
          <input value={uid} onChange={(e) => setUid(e.target.value.trim())} className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm font-mono outline-none focus:border-[#FF7A00]/60" />
        </div>
        <button className="inline-flex items-center gap-1.5 rounded-full bg-[#FF7A00] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-black">
          <Search size={12} /> Load
        </button>
      </form>

      {error && <p className="text-red-300 text-sm mb-3">{error}</p>}

      {wallet && (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Wallet className="text-[#FF7A00]" />
            <div>
              <p className="text-xs uppercase tracking-wider text-white/55">Balance</p>
              <p className="font-mono text-3xl tabular-nums">{wallet.balance ?? 0} XT</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <label className="block">
              <span className="block text-xs text-white/55 mb-1">Amount (XT)</span>
              <input type="number" min={1} value={delta} onChange={(e) => setDelta(Number(e.target.value))} className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-[#FF7A00]/60" />
            </label>
            <label className="block">
              <span className="block text-xs text-white/55 mb-1">Reason</span>
              <input value={reason} onChange={(e) => setReason(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-[#FF7A00]/60" />
            </label>
          </div>

          <div className="flex gap-2">
            <button disabled={busy} onClick={() => adjust(1)}  className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-4 py-2 text-xs font-semibold uppercase tracking-wider">
              {busy ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} Credit
            </button>
            <button disabled={busy} onClick={() => adjust(-1)} className="inline-flex items-center gap-1 rounded-full bg-red-500/20 text-red-300 border border-red-400/30 px-4 py-2 text-xs font-semibold uppercase tracking-wider">
              {busy ? <Loader2 size={12} className="animate-spin" /> : <Minus size={12} />} Debit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
