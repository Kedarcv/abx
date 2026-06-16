import { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { api } from '../lib/api.js';
import PageHeader from './components/PageHeader.jsx';

const PAYMENT_METHODS = ['card','link','us_bank_account','apple_pay','google_pay'];

export default function Settings() {
  const [draft, setDraft]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState(null);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    api('/api/admin/settings')
      .then(({ settings }) => setDraft(settings ?? {}))
      .catch(e => { setError(e.message); setDraft({}); })
      .finally(() => setLoading(false));
  }, []);

  const set = (k, v) => setDraft(d => ({ ...d, [k]: v }));

  const togglePayment = (m) => {
    const list = Array.isArray(draft.paymentMethods) ? draft.paymentMethods : [];
    set('paymentMethods', list.includes(m) ? list.filter(x => x !== m) : [...list, m]);
  };

  const save = async () => {
    setSaving(true); setError(null); setNotice(null);
    try {
      const payload = {};
      [
        'currency','paymentMethods','storeName','contactEmail','maintenanceMode',
        'freeShippingThresholdCents','defaultTaxRateBps','taxInclusive','allowedCountries',
      ].forEach(k => { if (draft[k] !== undefined) payload[k] = draft[k]; });
      const { settings } = await api('/api/admin/settings', { method: 'PATCH', body: payload });
      setDraft(settings ?? draft);
      setNotice('Saved.');
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  if (loading) return <Loader2 className="animate-spin text-[#FF7A00] mx-auto block my-12" />;

  return (
    <div className="max-w-2xl">
      <PageHeader
        eyebrow="Storefront"
        title="Store settings"
        description="Currency, payment methods, tax, free-shipping threshold. Used at checkout."
      />

      <div className="space-y-5 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 sm:p-8">
        <Field label="Store name">
          <input value={draft.storeName ?? ''} onChange={(e) => set('storeName', e.target.value)} className={cls} />
        </Field>
        <Field label="Contact email">
          <input value={draft.contactEmail ?? ''} onChange={(e) => set('contactEmail', e.target.value)} className={cls} />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Currency (ISO 4217)">
            <input value={draft.currency ?? 'USD'} onChange={(e) => set('currency', e.target.value.toUpperCase())} maxLength={3} className={cls} />
          </Field>
          <Field label="Default tax rate (basis points · 100 = 1%)">
            <input type="number" value={draft.defaultTaxRateBps ?? 0} onChange={(e) => set('defaultTaxRateBps', Number(e.target.value))} className={cls} />
          </Field>
          <Field label="Free shipping over (cents)">
            <input type="number" value={draft.freeShippingThresholdCents ?? 0} onChange={(e) => set('freeShippingThresholdCents', Number(e.target.value))} className={cls} />
          </Field>
          <Field label="Tax inclusive">
            <label className="flex items-center gap-2 mt-2">
              <input type="checkbox" checked={!!draft.taxInclusive} onChange={(e) => set('taxInclusive', e.target.checked)} className="accent-[#FF7A00]" />
              <span className="text-sm text-white/70">Prices already include tax</span>
            </label>
          </Field>
        </div>

        <Field label="Payment methods (sent to Stripe Checkout)">
          <div className="flex flex-wrap gap-2 mt-1">
            {PAYMENT_METHODS.map(m => {
              const on = (draft.paymentMethods ?? []).includes(m);
              return (
                <button
                  key={m}
                  onClick={() => togglePayment(m)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium ${on ? 'bg-[#FF7A00] text-black border-[#FF7A00]' : 'bg-white/5 text-white/65 border-white/10 hover:text-white'}`}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Maintenance mode">
          <label className="flex items-center gap-2 mt-2">
            <input type="checkbox" checked={!!draft.maintenanceMode} onChange={(e) => set('maintenanceMode', e.target.checked)} className="accent-[#FF7A00]" />
            <span className="text-sm text-white/70">Hide the shop and disable checkout</span>
          </label>
        </Field>

        {error  && <p className="text-red-300 text-sm">{error}</p>}
        {notice && <p className="text-emerald-300 text-sm">{notice}</p>}

        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#FF7A00] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-black disabled:opacity-60"
        >
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
          Save settings
        </button>
      </div>
    </div>
  );
}

const cls = 'w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#FF7A00]/60';

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-white/55">{label}</span>
      {children}
    </label>
  );
}
