import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShoppingBag, Check } from 'lucide-react';
import productsBg from '../../assets/Images/productsbackground.png';
import { formatPrice } from '../../data/catalog.js';
import { useProduct, useCatalog } from '../../data/useCatalog.js';
import { useCart } from '../../store/cart.js';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { product, loading } = useProduct(slug);
  const { collections } = useCatalog();
  const [side, setSide] = useState('front');
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCart(s => s.addItem);
  const openCart = useCart(s => s.open);

  if (loading && !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white/55">
        Loading…
      </div>
    );
  }
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <p className="text-white/60 mb-4">Product not found.</p>
          <Link to="/shop" className="text-[#FF7A00] underline">Back to shop</Link>
        </div>
      </div>
    );
  }

  const collection = collections.find(c => c.id === product.collectionId || c.slug === product.collectionId);

  const handleAdd = () => {
    addItem({
      productId: product.id,
      variantId: product.id,
      slug: product.slug,
      name: product.name,
      priceCents: product.priceCents,
      image: product.front,
    }, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <div
      className="relative min-h-screen pt-28 pb-24 bg-center bg-cover"
      style={{ backgroundImage: `url(${productsBg})` }}
    >
      <div className="absolute inset-0 bg-black/65" aria-hidden />

      <div className="relative z-10 mx-auto w-[92%] max-w-6xl">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 mb-8 text-sm text-white/65 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          {/* Image */}
          <div className="relative aspect-square rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-black/40 backdrop-blur-xl overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.img
                key={side}
                src={product[side]}
                alt={`${product.name} — ${side}`}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0 h-full w-full object-contain p-10"
              />
            </AnimatePresence>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {['front','back'].map(s => (
                <button
                  key={s}
                  onClick={() => setSide(s)}
                  className={[
                    'px-4 py-1.5 rounded-full text-xs font-medium tracking-wide border transition-all',
                    side === s
                      ? 'bg-[#FF7A00] text-black border-[#FF7A00]'
                      : 'bg-black/40 text-white/70 border-white/20 hover:text-white',
                  ].join(' ')}
                >
                  {s === 'front' ? 'Front view' : 'Back view'}
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            {collection && (
              <p className="text-xs uppercase tracking-[0.3em] text-[#F4EC47] font-orbitron mb-3">
                {collection.name}
              </p>
            )}
            <h1
              className="text-4xl font-bold leading-tight text-white md:text-5xl"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
              {product.name}
            </h1>
            <div className="w-16 h-[3px] bg-[#FF7A00] mt-5 mb-6" />
            <p className="text-white/70 leading-relaxed mb-8 max-w-md">
              {product.tagline}
            </p>

            <p className="font-mono text-4xl font-light text-white tabular-nums mb-8">
              {formatPrice(product.priceCents)}
            </p>

            {/* Qty + Add */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="inline-flex items-center rounded-full border border-white/15 bg-white/5 backdrop-blur-md">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="px-4 py-2 text-white/70 hover:text-white"
                  aria-label="Decrease quantity"
                >−</button>
                <span className="w-8 text-center font-mono text-white">{qty}</span>
                <button
                  onClick={() => setQty(q => Math.min(99, q + 1))}
                  className="px-4 py-2 text-white/70 hover:text-white"
                  aria-label="Increase quantity"
                >+</button>
              </div>

              <button
                onClick={handleAdd}
                className="group relative inline-flex items-center gap-3 rounded-full border border-[#FF7A00]/40 bg-[#FF7A00] px-7 py-3 text-sm font-semibold tracking-wide text-black transition-all hover:shadow-[0_0_30px_rgba(255,122,0,0.4)]"
              >
                <AnimatePresence mode="wait">
                  {added ? (
                    <motion.span key="ok" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="inline-flex items-center gap-2">
                      <Check size={16} /> Added to cart
                    </motion.span>
                  ) : (
                    <motion.span key="cta" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} className="inline-flex items-center gap-2">
                      <ShoppingBag size={16} /> Add to cart
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              <button
                onClick={() => { handleAdd(); openCart(); }}
                className="text-sm text-white/65 hover:text-white underline-offset-4 hover:underline"
              >
                Buy now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
