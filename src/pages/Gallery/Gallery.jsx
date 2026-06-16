import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Grid3X3, ZoomIn } from 'lucide-react';
import { galleryImages } from '../../constants/index.js';

const CATEGORIES = ['All', ...new Set(galleryImages.map(i => i.category))];

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const filtered = activeCategory === 'All'
    ? galleryImages
    : galleryImages.filter(i => i.category === activeCategory);

  const openLightbox = (idx) => setLightboxIndex(idx);
  const closeLightbox = () => setLightboxIndex(null);

  const goNext = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % filtered.length);
  }, [lightboxIndex, filtered.length]);

  const goPrev = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + filtered.length) % filtered.length);
  }, [lightboxIndex, filtered.length]);

  /* Keyboard nav */
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handler = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxIndex, goNext, goPrev]);

  /* Lock body scroll while lightbox open */
  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [lightboxIndex]);

  return (
    <section className="min-h-screen bg-black pt-28 pb-20">
      <div className="mx-auto w-[95%] max-w-7xl px-4">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <div className="mb-3 inline-flex items-center gap-2 text-[#FF7A00]">
            <Grid3X3 size={16} />
            <span className="text-xs uppercase tracking-[0.3em]">Collection</span>
          </div>
          <h1
            className="text-4xl font-extrabold text-white md:text-5xl"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            App Gallery
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm text-white/50">
            Explore every asset in the ABX Motion universe — streetwear, fitness gear,
            audio tech, team visuals, and branding.
          </p>
          <div className="mx-auto mt-4 h-0.5 w-16 bg-[#FF7A00] opacity-60" />
        </motion.div>

        {/* Category filter pills */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full border px-5 py-2 text-xs font-medium uppercase tracking-wider transition-all duration-300
                ${activeCategory === cat
                  ? 'border-[#FF7A00] bg-[#FF7A00]/15 text-[#FF7A00]'
                  : 'border-white/10 bg-white/[0.03] text-white/50 hover:border-white/25 hover:text-white/80'}
              `}
            >
              {cat}
              {cat !== 'All' && (
                <span className="ml-1.5 opacity-50">
                  {galleryImages.filter(i => i.category === cat).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Image counter */}
        <p className="mb-6 text-center text-xs text-white/30">
          {filtered.length} image{filtered.length !== 1 && 's'}
        </p>

        {/* Masonry‑style grid */}
        <motion.div
          layout
          className="columns-2 gap-3 sm:columns-3 lg:columns-4 xl:columns-5"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((img, idx) => (
              <motion.div
                key={img.label}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: idx * 0.02 }}
                className="group relative mb-3 cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] break-inside-avoid"
                onClick={() => openLightbox(idx)}
              >
                <img
                  src={img.src}
                  alt={img.label}
                  loading="lazy"
                  className="block w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Hover overlay */}
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-end bg-gradient-to-t from-black/70 via-transparent to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <ZoomIn size={20} className="mb-2 text-[#FF7A00]" />
                  <p className="text-xs font-medium text-white text-center leading-tight">
                    {img.label}
                  </p>
                  <span className="mt-0.5 text-[10px] uppercase tracking-wider text-white/40">
                    {img.category}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ── Lightbox ─────────────────────────────────────────── */}
      <AnimatePresence>
        {lightboxIndex !== null && filtered[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md"
            onClick={closeLightbox}
          >
            {/* Close */}
            <button
              onClick={closeLightbox}
              className="absolute right-4 top-4 z-10 rounded-full border border-white/15 bg-white/5 p-2 text-white/70 hover:text-white md:right-6 md:top-6"
            >
              <X size={20} />
            </button>

            {/* Prev */}
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/10 bg-black/50 p-2.5 text-white/60 hover:text-white md:left-6"
            >
              <ChevronLeft size={24} />
            </button>

            {/* Next */}
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/10 bg-black/50 p-2.5 text-white/60 hover:text-white md:right-6"
            >
              <ChevronRight size={24} />
            </button>

            {/* Image */}
            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.25 }}
              className="relative max-h-[85vh] max-w-[90vw] md:max-w-[75vw]"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={filtered[lightboxIndex].src}
                alt={filtered[lightboxIndex].label}
                className="max-h-[80vh] w-auto rounded-2xl object-contain shadow-2xl"
              />
              <div className="mt-3 text-center">
                <p className="text-sm font-medium text-white">
                  {filtered[lightboxIndex].label}
                </p>
                <p className="text-xs text-white/40">
                  {filtered[lightboxIndex].category} &middot; {lightboxIndex + 1} / {filtered.length}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
