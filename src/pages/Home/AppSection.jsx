import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Trophy, ShoppingBag, Zap, TrendingUp, Bell,
  ChevronRight, ChevronLeft, X, Images, ZoomIn,
} from 'lucide-react';
import logo2 from '../../assets/Images/abxlogo2.png';

import app01 from '../../assets/Images/app-screenshots/app-01.jpeg';
import app02 from '../../assets/Images/app-screenshots/app-02.jpeg';
import app03 from '../../assets/Images/app-screenshots/app-03.jpeg';
import app04 from '../../assets/Images/app-screenshots/app-04.jpeg';
import app05 from '../../assets/Images/app-screenshots/app-05.jpeg';
import app06 from '../../assets/Images/app-screenshots/app-06.jpeg';
import app07 from '../../assets/Images/app-screenshots/app-07.jpeg';
import app08 from '../../assets/Images/app-screenshots/app-08.jpeg';
import app09 from '../../assets/Images/app-screenshots/app-09.jpeg';
import app10 from '../../assets/Images/app-screenshots/app-10.jpeg';
import app11 from '../../assets/Images/app-screenshots/app-11.jpeg';

const APP_SCREENSHOTS = [
  app01, app02, app03, app04, app05, app06,
  app07, app08, app09, app10, app11,
];

/* ── Phone mockup ────────────────────────────────────────────────── */
function PhoneMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="relative mx-auto w-[260px] md:w-[280px]"
    >
      {/* Outer glow */}
      <div className="absolute -inset-6 rounded-[3rem] bg-[#FF7A00]/10 blur-3xl pointer-events-none" />

      {/* Phone frame */}
      <div className="relative overflow-hidden rounded-[2.5rem] border-2 border-white/15 bg-gradient-to-b from-[#111] to-[#0a0a0a] shadow-2xl">
        {/* Notch */}
        <div className="mx-auto mt-3 h-5 w-28 rounded-full bg-black border border-white/10" />

        {/* Screen */}
        <div className="px-5 pt-6 pb-8">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-6">
            <img src={logo2} alt="ABX" className="h-8 w-8 object-contain" />
            <div className="flex items-center gap-2">
              <Bell size={14} className="text-white/50" />
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[#FF7A00] to-[#F4EC47]" />
            </div>
          </div>

          {/* Greeting */}
          <p className="text-xs text-white/50 mb-0.5">Good morning,</p>
          <p className="text-lg font-semibold text-white mb-5">Athlete</p>

          {/* Stats cards */}
          <div className="grid grid-cols-2 gap-2.5 mb-5">
            {[
              { label: 'Streak', val: '14 days', icon: Zap, color: '#FF7A00' },
              { label: 'XTX Coins', val: '2,340', icon: TrendingUp, color: '#F4EC47' },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-3"
              >
                <s.icon size={14} style={{ color: s.color }} className="mb-1.5" />
                <p className="text-[10px] text-white/45">{s.label}</p>
                <p className="text-sm font-bold text-white">{s.val}</p>
              </div>
            ))}
          </div>

          {/* Activity ring */}
          <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 mb-5">
            <div className="relative h-14 w-14 shrink-0">
              <svg viewBox="0 0 56 56" className="h-full w-full -rotate-90">
                <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
                <circle
                  cx="28" cy="28" r="24" fill="none"
                  stroke="#FF7A00" strokeWidth="5" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 24 * 0.72} ${2 * Math.PI * 24}`}
                />
                <circle cx="28" cy="28" r="18" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
                <circle
                  cx="28" cy="28" r="18" fill="none"
                  stroke="#F4EC47" strokeWidth="4" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 18 * 0.55} ${2 * Math.PI * 18}`}
                />
              </svg>
            </div>
            <div>
              <p className="text-xs text-white/50">Today&apos;s progress</p>
              <p className="text-sm font-semibold text-white">72% complete</p>
              <p className="text-[10px] text-[#FF7A00] mt-0.5">Keep pushing — 28% to go!</p>
            </div>
          </div>

          {/* Quick‑action row */}
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: 'Workout', icon: Activity },
              { label: 'Challenges', icon: Trophy },
              { label: 'Shop', icon: ShoppingBag },
            ].map((a) => (
              <div
                key={a.label}
                className="rounded-xl border border-white/10 bg-white/[0.04] py-2.5"
              >
                <a.icon size={16} className="mx-auto text-[#FF7A00] mb-1" />
                <p className="text-[9px] text-white/55 font-medium">{a.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Lightbox ────────────────────────────────────────────────────── */
function Lightbox({ images, startIndex, onClose }) {
  const [index, setIndex] = useState(startIndex);

  const goNext = useCallback(
    () => setIndex((i) => (i + 1) % images.length),
    [images.length],
  );
  const goPrev = useCallback(
    () => setIndex((i) => (i - 1 + images.length) % images.length),
    [images.length],
  );

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose, goNext, goPrev]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-lg"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full border border-white/15 bg-white/5 p-2.5 text-white/70 hover:text-white"
      >
        <X size={20} />
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); goPrev(); }}
        className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/10 bg-black/60 p-2.5 text-white/60 hover:text-white md:left-8"
      >
        <ChevronLeft size={24} />
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); goNext(); }}
        className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/10 bg-black/60 p-2.5 text-white/60 hover:text-white md:right-8"
      >
        <ChevronRight size={24} />
      </button>

      <AnimatePresence mode="wait">
        <motion.img
          key={index}
          src={images[index]}
          alt={`ABX Motion app screenshot ${index + 1}`}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="max-h-[88vh] max-w-[92vw] rounded-3xl object-contain shadow-2xl md:max-w-[420px]"
        />
      </AnimatePresence>

      <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-xs text-white/40">
        {index + 1} / {images.length}
      </p>
    </motion.div>
  );
}

/* ── Gallery grid (revealed on Gallery click) ────────────────────── */
function GalleryGrid({ onOpenLightbox, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className="overflow-hidden"
    >
      <div className="mt-12 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-sm md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h3
            className="text-lg font-bold text-white md:text-xl"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            App Gallery
          </h3>
          <button
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-white/60 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {APP_SCREENSHOTS.map((src, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              onClick={() => onOpenLightbox(i)}
              className="group cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-[#111] transition-all duration-300 hover:border-[#FF7A00]/40 hover:shadow-[0_0_20px_rgba(255,122,0,0.1)]"
            >
              <div className="relative">
                <img
                  src={src}
                  alt={`ABX Motion screenshot ${i + 1}`}
                  loading="lazy"
                  className="block w-full transition-transform duration-500 group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <ZoomIn size={18} className="text-[#FF7A00]" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main section ─────────────────────────────────────────────────── */
export default function AppSection() {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [showGallery, setShowGallery] = useState(false);

  return (
    <section
      id="app"
      className="relative w-full overflow-hidden bg-black py-24 md:py-32"
    >
      {/* Ambient gradients */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[#FF7A00]/[0.04] blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-[#F4EC47]/[0.03] blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto w-[95%] max-w-7xl px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-[#FF7A00]">
            The Ecosystem
          </p>
          <h2
            className="text-4xl font-extrabold text-white md:text-5xl lg:text-6xl"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            ABX MOTION <span className="text-[#FF7A00]">APP</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/55 md:text-base">
            Your fitness, rewards, and community — all in one place.
            Track workouts, earn XTX Coins, join challenges, and unlock
            exclusive gear in the ABX ecosystem.
          </p>
          <div className="mx-auto mt-5 h-0.5 w-16 bg-[#FF7A00] opacity-60" />
        </motion.div>

        {/* Phone mockup — centred */}
        <PhoneMockup />

        {/* CTA row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-14 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          {/* Google Play */}
          <a
            href="https://play.google.com/store/search?q=ABX+Motion&c=apps"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex h-[52px] items-center gap-3 rounded-2xl border border-white/15 bg-white/5 pl-4 pr-5 backdrop-blur-sm transition-all duration-300 hover:border-[#FF7A00]/40 hover:bg-white/10 hover:shadow-[0_0_24px_rgba(255,122,0,0.12)]"
          >
            <svg viewBox="0 0 24 24" className="h-7 w-7 shrink-0" fill="none">
              <path d="M3.61 1.814a1.63 1.63 0 0 0-.545 1.26v17.852a1.63 1.63 0 0 0 .545 1.26l.066.058L13.72 12.2v-.098L3.676 1.756l-.066.058Z" fill="#4285F4"/>
              <path d="m17.068 15.552-3.348-3.348v-.098l3.348-3.348.076.044 3.968 2.254c1.134.644 1.134 1.698 0 2.342l-3.968 2.254-.076.044v-.144Z" fill="#FBBC04"/>
              <path d="m17.144 15.508-3.424-3.424L3.61 22.186c.374.396.992.444 1.692.05l11.842-6.728Z" fill="#EA4335"/>
              <path d="M17.144 8.802 5.302 2.074c-.7-.394-1.318-.346-1.692.05L13.72 12.084l3.424-3.282Z" fill="#34A853"/>
            </svg>
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] text-white/50">GET IT ON</span>
              <span className="text-sm font-semibold text-white">Google Play</span>
            </div>
          </a>

          {/* App Store */}
          <a
            href="https://apps.apple.com/search?term=ABX+Motion"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex h-[52px] items-center gap-3 rounded-2xl border border-white/15 bg-white/5 pl-4 pr-5 backdrop-blur-sm transition-all duration-300 hover:border-[#FF7A00]/40 hover:bg-white/10 hover:shadow-[0_0_24px_rgba(255,122,0,0.12)]"
          >
            <svg viewBox="0 0 24 24" className="h-7 w-7 shrink-0" fill="white">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11Z"/>
            </svg>
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] text-white/50">Download on the</span>
              <span className="text-sm font-semibold text-white">App Store</span>
            </div>
          </a>

          {/* Gallery toggle */}
          <button
            onClick={() => setShowGallery((v) => !v)}
            className={`inline-flex items-center gap-2 rounded-full border px-8 py-3.5 text-sm font-semibold uppercase tracking-wider backdrop-blur-sm transition-all duration-300
              ${showGallery
                ? 'border-[#FF7A00]/50 bg-[#FF7A00]/10 text-[#FF7A00]'
                : 'border-white/15 bg-white/5 text-white/80 hover:border-white/30 hover:text-white'}
            `}
          >
            <Images size={16} />
            {showGallery ? 'Hide Gallery' : 'Gallery'}
          </button>
        </motion.div>

        {/* Gallery grid — only shown when toggled */}
        <AnimatePresence>
          {showGallery && (
            <GalleryGrid
              onOpenLightbox={(i) => setLightboxIndex(i)}
              onClose={() => setShowGallery(false)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            images={APP_SCREENSHOTS}
            startIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
