import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import productsBg from '../../assets/Images/productsbackground.png';
import { formatPrice } from '../../data/catalog.js';
import { useCatalog } from '../../data/useCatalog.js';
import { useCart } from '../../store/cart.js';

export default function Shop() {
  const [active, setActive] = useState('all');
  const addItem = useCart(s => s.addItem);
  const { collections, products, source, loading } = useCatalog();

  const filters = useMemo(
    () => [{ id: 'all', name: 'All' }, ...collections],
    [collections],
  );

  const items = useMemo(
    () => active === 'all'
      ? products
      : products.filter(p => p.collectionId === active),
    [active, products],
  );

  return (
    <div
      className="relative min-h-screen pt-32 pb-24 bg-center bg-cover"
      style={{ backgroundImage: `url(${productsBg})` }}
    >
      <div className="absolute inset-0 bg-black/55" aria-hidden />

      <div className="relative z-10 mx-auto w-[92%] max-w-7xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <p className="text-sm tracking-[0.3em] uppercase text-white/50 font-orbitron">
            ABX Motion Store
          </p>
          <h1
            className="mt-2 text-4xl font-bold tracking-tight text-white md:text-6xl"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            Shop the Ecosystem
          </h1>
          <p className="max-w-xl mx-auto mt-4 text-sm leading-relaxed text-white/65 md:text-base">
            Striitwear, performance fit, and signal devices — engineered for the never-ending pursuit of growth.
          </p>
        </div>

        {source === 'static' && !loading && (
          <p className="mb-6 text-center text-[11px] uppercase tracking-[0.25em] text-white/35">
            Showing demo catalog — admin hasn’t seeded products yet.
          </p>
        )}

        {/* Filter pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10 sm:gap-3">
          {filters.map(f => {
            const on = active === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setActive(f.id)}
                className={[
                  'px-5 py-2 rounded-full text-sm font-medium tracking-wide transition-all border backdrop-blur-md',
                  on
                    ? 'bg-[#FF7A00]/90 text-black border-[#FF7A00] shadow-[0_0_24px_rgba(255,122,0,0.35)]'
                    : 'bg-white/5 text-white/80 border-white/15 hover:bg-white/10 hover:border-white/30',
                ].join(' ')}
              >
                {f.name}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        <motion.ul
          layout
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <AnimatePresence mode="popLayout">
            {items.map(p => (
              <motion.li
                key={p.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl"
              >
                <Link
                  to={`/shop/${p.slug}`}
                  className="relative block aspect-square overflow-hidden bg-gradient-to-b from-white/[0.04] to-black/40"
                >
                  <img
                    src={p.front}
                    alt={p.name}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-contain p-6 transition-transform duration-500 group-hover:scale-[1.06] group-hover:rotate-[0.5deg]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>

                <div className="flex flex-col gap-2 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link to={`/shop/${p.slug}`} className="block">
                        <h3 className="text-sm font-semibold leading-tight text-white truncate group-hover:text-[#FF7A00] transition-colors">
                          {p.name}
                        </h3>
                      </Link>
                      <p className="mt-1 text-xs leading-snug text-white/55 line-clamp-2">
                        {p.tagline}
                      </p>
                    </div>
                    <span className="shrink-0 font-mono text-base font-light text-white tabular-nums">
                      {formatPrice(p.priceCents)}
                    </span>
                  </div>

                  <button
                    onClick={() => addItem({
                      productId: p.id,
                      variantId: p.id, // single-variant catalog for now
                      slug: p.slug,
                      name: p.name,
                      priceCents: p.priceCents,
                      image: p.front,
                    })}
                    className="mt-2 inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold tracking-wide text-white transition-all hover:border-[#FF7A00]/60 hover:bg-[#FF7A00]/15 hover:text-[#FF7A00]"
                  >
                    <ShoppingBag size={14} />
                    Add to cart
                  </button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      </div>
    </div>
  );
}
