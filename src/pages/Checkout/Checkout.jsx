import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ShieldCheck, ArrowLeft, ChevronRight } from 'lucide-react';
import { useCart } from '../../store/cart.js';
import { formatPrice } from '../../data/catalog.js';

const INITIAL_FORM = {
  email: '',
  name: '',
  line1: '',
  line2: '',
  city: '',
  region: '',
  postalCode: '',
  country: 'US',
  phone: '',
};

export default function Checkout() {
  const navigate = useNavigate();
  const items    = useCart(s => s.items);
  const subtotal = useCart(s => s.subtotalCents());

  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (items.length === 0) {
    return (
      <div className="relative min-h-screen pt-32 pb-24 bg-black text-white">
        <div className="mx-auto w-[92%] max-w-2xl text-center">
          <h1 className="text-3xl font-bold font-orbitron mb-3">Your cart is empty</h1>
          <p className="text-white/55 mb-8">
            Add a few pieces from the shop to start a checkout.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 rounded-full bg-[#FF7A00] px-6 py-3 text-sm font-semibold uppercase tracking-wider text-black"
          >
            <ArrowLeft size={16} /> Back to shop
          </Link>
        </div>
      </div>
    );
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
          })),
          email: form.email,
          shippingAddress: {
            name: form.name,
            line1: form.line1,
            line2: form.line2 || null,
            city: form.city,
            region: form.region || null,
            postalCode: form.postalCode,
            country: form.country,
            phone: form.phone || null,
          },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
      if (data.url) {
        // Remember the order id so /checkout/success can fetch totals.
        if (data.orderId) {
          try { sessionStorage.setItem('lastOrderId', data.orderId); } catch { /* ignore */ }
        }
        window.location.href = data.url; // -> Stripe Checkout
        return;
      }
      throw new Error('No checkout URL returned');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen pt-28 pb-24 bg-[#0a0a0a] text-white">
      <div className="mx-auto w-[92%] max-w-6xl">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-8"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="grid gap-10 lg:grid-cols-[1fr_420px]">
          {/* FORM */}
          <motion.form
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 backdrop-blur-xl"
          >
            <div className="flex items-center gap-3 mb-2">
              <Lock size={14} className="text-[#FF7A00]" />
              <p className="text-xs uppercase tracking-[0.3em] text-white/60 font-orbitron">
                Secure checkout
              </p>
            </div>
            <h1 className="text-3xl font-bold font-orbitron mb-1">Checkout</h1>
            <p className="text-sm text-white/55 mb-8">
              Guest checkout — no account required. Payment is handled by Stripe.
            </p>

            <Section title="Contact">
              <Field label="Email" required>
                <input
                  type="email" required value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="you@example.com"
                  className={inputCls}
                />
              </Field>
            </Section>

            <Section title="Shipping address">
              <Field label="Full name" required>
                <input
                  type="text" required value={form.name}
                  onChange={e => set('name', e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Address" required>
                <input
                  type="text" required value={form.line1}
                  onChange={e => set('line1', e.target.value)}
                  placeholder="Street and number"
                  className={inputCls}
                />
              </Field>
              <Field label="Apartment, suite (optional)">
                <input
                  type="text" value={form.line2}
                  onChange={e => set('line2', e.target.value)}
                  className={inputCls}
                />
              </Field>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="City" required>
                  <input
                    type="text" required value={form.city}
                    onChange={e => set('city', e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="State / Region">
                  <input
                    type="text" value={form.region}
                    onChange={e => set('region', e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Postal code" required>
                  <input
                    type="text" required value={form.postalCode}
                    onChange={e => set('postalCode', e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Country" required>
                  <select
                    required value={form.country}
                    onChange={e => set('country', e.target.value)}
                    className={inputCls}
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="GB">United Kingdom</option>
                    <option value="AU">Australia</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                    <option value="ZA">South Africa</option>
                  </select>
                </Field>
              </div>
              <Field label="Phone (optional)">
                <input
                  type="tel" value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                  className={inputCls}
                />
              </Field>
            </Section>

            {error && (
              <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-3 rounded-full bg-[#FF7A00] py-4 text-sm font-semibold uppercase tracking-[0.2em] text-black transition-all hover:shadow-[0_0_30px_rgba(255,122,0,0.45)] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Redirecting to Stripe…' : (
                <>
                  Continue to payment
                  <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>

            <p className="mt-4 flex items-center justify-center gap-2 text-xs text-white/40">
              <ShieldCheck size={12} /> 256-bit encryption · powered by Stripe
            </p>
          </motion.form>

          {/* SUMMARY */}
          <motion.aside
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="lg:sticky lg:top-28 self-start rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 sm:p-7"
          >
            <h2 className="text-sm uppercase tracking-[0.25em] text-white/55 font-orbitron mb-5">
              Order summary
            </h2>

            <ul className="divide-y divide-white/5">
              {items.map(i => (
                <li key={`${i.productId}-${i.variantId}`} className="flex gap-4 py-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white/5">
                    <img src={i.image} alt={i.name} className="h-full w-full object-contain p-1.5" />
                    <span className="absolute -top-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-[#FF7A00] text-[10px] font-bold text-black">
                      {i.quantity}
                    </span>
                  </div>
                  <div className="flex flex-1 items-center justify-between gap-3 min-w-0">
                    <p className="text-sm leading-tight truncate">{i.name}</p>
                    <span className="font-mono text-sm tabular-nums shrink-0">
                      {formatPrice(i.priceCents * i.quantity)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-5 space-y-2 border-t border-white/10 pt-5 text-sm">
              <Row label="Subtotal" value={formatPrice(subtotal)} />
              <Row label="Shipping" value="Calculated next" muted />
              <Row label="Taxes" value="Calculated next" muted />
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-5">
              <span className="text-sm uppercase tracking-wider text-white/65">Estimated total</span>
              <span className="font-mono text-2xl font-light tabular-nums">{formatPrice(subtotal)}</span>
            </div>
          </motion.aside>
        </div>
      </div>
    </div>
  );
}

const inputCls = 'w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-[#FF7A00]/60 focus:bg-black/50';

function Section({ title, children }) {
  return (
    <div className="mb-8 space-y-4">
      <h3 className="text-xs uppercase tracking-[0.25em] text-white/45 font-orbitron">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs text-white/55">
        {label}{required && <span className="text-[#FF7A00]"> *</span>}
      </span>
      {children}
    </label>
  );
}

function Row({ label, value, muted }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/55">{label}</span>
      <span className={muted ? 'text-white/45' : 'text-white'}>{value}</span>
    </div>
  );
}
