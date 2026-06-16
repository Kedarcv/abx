import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useCart } from '../../store/cart.js';
import { formatPrice } from '../../data/catalog.js';

export default function Success() {
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');
  const clear = useCart(s => s.clear);
  const [state, setState] = useState({ status: 'polling', order: null });

  useEffect(() => { clear(); }, [clear]);

  useEffect(() => {
    let cancelled = false;

    const finish = (order = null) => {
      if (!cancelled) setState({ status: 'done', order });
    };

    if (!sessionId) {
      finish();
      return () => { cancelled = true; };
    }

    let tries = 0;
    const poll = async () => {
      tries += 1;
      try {
        // If checkout stored the order id locally, fetch it; otherwise the
        // Stripe webhook will reconcile it server-side and the receipt
        // email will go out.
        const id = sessionStorage.getItem('lastOrderId');
        if (!id) { finish(); return; }
        const r = await fetch(`/api/orders/${id}?session_id=${encodeURIComponent(sessionId)}`);
        if (r.ok) {
          const { order } = await r.json();
          if (cancelled) return;
          if (order?.status === 'paid' || order?.status === 'fulfilled') {
            finish(order);
            return;
          }
        }
      } catch {
        // ignore — fall through to retry
      }
      if (tries < 10 && !cancelled) setTimeout(poll, 1500);
      else finish();
    };
    poll();
    return () => { cancelled = true; };
  }, [sessionId]);

  return (
    <div className="relative min-h-screen pt-32 pb-24 bg-[#0a0a0a] text-white">
      <div className="mx-auto w-[92%] max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-10 text-center"
        >
          {state.status === 'polling' ? (
            <Loader2 className="w-12 h-12 text-[#FF7A00] mx-auto mb-6 animate-spin" />
          ) : (
            <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full bg-[#FF7A00]/15 border border-[#FF7A00]/40">
              <CheckCircle2 size={32} className="text-[#FF7A00]" />
            </div>
          )}

          <h1 className="text-3xl font-bold font-orbitron mb-3">
            {state.status === 'polling' ? 'Confirming your order…' : 'Thank you for your order'}
          </h1>
          <p className="text-white/60 max-w-md mx-auto mb-8">
            {state.order
              ? `Order #${state.order.number} is confirmed. A receipt is on its way to ${state.order.email}.`
              : 'Your payment was received. A receipt will arrive in your inbox shortly.'}
          </p>

          {state.order && (
            <p className="font-mono text-2xl mb-8">
              {formatPrice(state.order.totalCents ?? state.order.total_cents ?? 0, state.order.currency)}
            </p>
          )}

          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/shop"
              className="rounded-full bg-[#FF7A00] px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-black"
            >
              Continue shopping
            </Link>
            <Link
              to="/"
              className="rounded-full border border-white/15 bg-white/5 px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-white/80 hover:text-white"
            >
              Back home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
