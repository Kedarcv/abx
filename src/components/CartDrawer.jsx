import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../store/cart.js';
import { formatPrice } from '../data/catalog.js';

export default function CartDrawer() {
  const isOpen   = useCart(s => s.isOpen);
  const close    = useCart(s => s.close);
  const items    = useCart(s => s.items);
  const setQty   = useCart(s => s.setQuantity);
  const remove   = useCart(s => s.remove);
  const subtotal = useCart(s => s.subtotalCents());

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
            className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm"
            aria-hidden
          />
          <motion.aside
            key="cart-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 36 }}
            role="dialog"
            aria-label="Shopping cart"
            className="fixed right-0 top-0 z-[90] flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#0a0a0a]/95 backdrop-blur-2xl text-white shadow-[0_0_60px_rgba(0,0,0,0.6)]"
          >
            {/* Header */}
            <header className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div className="flex items-center gap-3">
                <ShoppingBag size={18} className="text-[#FF7A00]" />
                <h2 className="text-sm font-semibold tracking-[0.25em] uppercase font-orbitron">
                  Your Cart
                </h2>
              </div>
              <button
                onClick={close}
                className="p-2 -mr-2 text-white/60 hover:text-white transition-colors"
                aria-label="Close cart"
              >
                <X size={20} />
              </button>
            </header>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="rounded-full border border-white/10 p-5 mb-4">
                    <ShoppingBag size={28} className="text-white/40" />
                  </div>
                  <p className="text-white/70 mb-1">Your cart is empty</p>
                  <p className="text-xs text-white/40 mb-6 max-w-[220px]">
                    Add a few signature pieces to get started.
                  </p>
                  <Link
                    to="/shop"
                    onClick={close}
                    className="rounded-full bg-[#FF7A00] px-5 py-2 text-xs font-semibold uppercase tracking-wider text-black hover:shadow-[0_0_24px_rgba(255,122,0,0.4)] transition-shadow"
                  >
                    Browse the shop
                  </Link>
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map(it => (
                    <li
                      key={`${it.productId}-${it.variantId}`}
                      className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3"
                    >
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white/5">
                        <img src={it.image} alt={it.name} className="h-full w-full object-contain p-2" />
                      </div>
                      <div className="flex flex-1 flex-col gap-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <Link
                            to={`/shop/${it.slug}`}
                            onClick={close}
                            className="text-sm font-semibold leading-tight truncate hover:text-[#FF7A00] transition-colors"
                          >
                            {it.name}
                          </Link>
                          <button
                            onClick={() => remove(it.productId, it.variantId)}
                            className="p-1 text-white/40 hover:text-red-400 transition-colors"
                            aria-label={`Remove ${it.name}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <p className="text-xs text-white/50">{formatPrice(it.priceCents)} each</p>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/40">
                            <button
                              onClick={() => setQty(it.productId, it.variantId, it.quantity - 1)}
                              className="w-7 h-7 grid place-items-center text-white/70 hover:text-white"
                              aria-label="Decrease"
                            ><Minus size={12} /></button>
                            <span className="w-6 text-center font-mono text-xs">{it.quantity}</span>
                            <button
                              onClick={() => setQty(it.productId, it.variantId, it.quantity + 1)}
                              className="w-7 h-7 grid place-items-center text-white/70 hover:text-white"
                              aria-label="Increase"
                            ><Plus size={12} /></button>
                          </div>
                          <span className="font-mono text-sm tabular-nums">
                            {formatPrice(it.priceCents * it.quantity)}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <footer className="border-t border-white/10 px-6 py-5 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Subtotal</span>
                  <span className="font-mono text-lg tabular-nums">{formatPrice(subtotal)}</span>
                </div>
                <p className="text-[11px] text-white/40">
                  Shipping &amp; taxes calculated at checkout.
                </p>
                <Link
                  to="/checkout"
                  onClick={close}
                  className="block w-full rounded-full bg-[#FF7A00] py-3 text-center text-sm font-semibold uppercase tracking-wider text-black hover:shadow-[0_0_30px_rgba(255,122,0,0.45)] transition-shadow"
                >
                  Checkout
                </Link>
                <Link
                  to="/shop"
                  onClick={close}
                  className="block text-center text-xs text-white/55 hover:text-white"
                >
                  Continue shopping
                </Link>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
