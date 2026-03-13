import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";

import {
  nutty,
  paul,
  nyasha,
  martin,
  nuttyscard,
  paulscard,
  nyashascard,
  martinscard,
} from "../../constants/index.js";

const partnersData = [
  {
    name: "Nutty O",
    firstName: "Nutty",
    bio: "Nutty O Di Bwoy, popularly known as Nutty O, born Carrington Simbarashe Chiwadzwa, is a Zimbabwean music artist, multiple award winning Singer/Songwriter independently recording under his brand Ability Xtention (ABX) which symbolizes the never ending pursuit of growth.",
    image: nutty,
    pattern: nuttyscard,
  },
  {
    name: "Paul Ntonya", //
    firstName: "Paul",
    bio: "A growing business developer & strategic systems thinker with a knack for spotting opportunities & Synergy development across Technology, Arts & economics. Certified Google digital marketer as well as a versatile creative with interests in sports, creative ecosystems development, Fashion and Apparel design.",
    image: paul,
    pattern: paulscard,
  },
  {
    name: "Nyasha Kadenge",
    firstName: "Nyasha",
    bio: "Nyasha Kadenge is a professional with over 14 years of senior management experience in administration, accounting, and auditing. She specializes in football administration, policy, strategy, and financial reporting.",
    image: nyasha,
    pattern: nyashascard,
  },
  {
    name: "Martin Chikomba",
    firstName: "Martin",
    bio: "Martin Chikomba who goes by the stage name Solyd The Plug, is a Zimbabwean-American businessman, record producer and Amapiano artist. He is the founder of Oak Media Group, which is a record label and co-founder of Mashroom Media.",
    image: martin,
    pattern: martinscard,
  },
];

export default function Partners() {
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef(null);

  const activePartner = partnersData[activeIndex];

  const scroll = (direction) => {
    const next =
      direction === "right"
        ? Math.min(activeIndex + 1, partnersData.length - 1)
        : Math.max(activeIndex - 1, 0);
    setActiveIndex(next);

    if (carouselRef.current) {
      const cards = carouselRef.current.querySelectorAll(".partner-card");
      if (cards[next]) {
        cards[next].scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  };

  return (
    <section
      id="partners"
      className="relative flex flex-col justify-center w-full min-h-screen py-20 overflow-hidden bg-black"
    >
      {/* Subtle ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 20% 50%, rgba(255,122,0,0.04) 0%, transparent 70%)",
        }}
      />

      <div className="w-[95%] max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center text-[#FF7A00] text-5xl md:text-6xl font-bold mb-16 tracking-widest"
          style={{ fontFamily: "Orbitron, sans-serif" }}
        >
          PARTNERS
        </motion.h2>

        {/* Main Layout: Left Info + Right Carousel */}
        <div className="flex flex-col items-center gap-10 lg:flex-row lg:gap-16">
          {/* ── LEFT PANEL ── */}
          <div className="w-full lg:w-[38%] flex-shrink-0 flex flex-col justify-center lg:pr-8">
            {/* Highlighted First Name */}
            <AnimatePresence mode="wait">
              <motion.h1
                key={activePartner.firstName}
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="mb-6 font-extrabold leading-none text-white"
                style={{
                  fontFamily: "Orbitron, sans-serif",
                  fontSize: "clamp(3.5rem, 8vw, 6rem)",
                  letterSpacing: "-0.02em",
                }}
              >
                {activePartner.firstName}
              </motion.h1>
            </AnimatePresence>

            {/* Bio */}
            <AnimatePresence mode="wait">
              <motion.p
                key={activePartner.name + "_bio"}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4, delay: 0.05, ease: "easeOut" }}
                className="max-w-md mb-8 text-sm leading-relaxed text-gray-400 md:text-base"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {activePartner.bio}
              </motion.p>
            </AnimatePresence>

            {/* Visit Collection Button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center self-start gap-2 py-3 text-sm font-semibold tracking-wide text-white transition-all duration-300 rounded-lg px-7"
              style={{
                fontFamily: "Orbitron, sans-serif",
                background:
                  "linear-gradient(135deg, #FF7A00 0%, #FF4500 100%)",
                boxShadow: "0 0 24px rgba(255,122,0,0.35)",
              }}
            >
              Visit Collection
              <ExternalLink className="w-4 h-4" />
            </motion.button>

            {/* Navigation Arrows — below button on left */}
            <div className="flex gap-4 mt-10">
              <button
                onClick={() => scroll("left")}
                disabled={activeIndex === 0}
                className="flex items-center justify-center transition-all duration-300 border rounded-full w-11 h-11 border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40 disabled:opacity-30 disabled:cursor-not-allowed group"
                aria-label="Previous Partner"
              >
                <ArrowLeft className="w-5 h-5 transition-colors text-white/80 group-hover:text-white" />
              </button>
              <button
                onClick={() => scroll("right")}
                disabled={activeIndex === partnersData.length - 1}
                className="flex items-center justify-center transition-all duration-300 border rounded-full w-11 h-11 border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40 disabled:opacity-30 disabled:cursor-not-allowed group"
                aria-label="Next Partner"
              >
                <ArrowRight className="w-5 h-5 transition-colors text-white/80 group-hover:text-white" />
              </button>
            </div>
          </div>

          {/* ── RIGHT CAROUSEL ── */}
          <div className="w-full lg:w-[62%] overflow-hidden">
            <div
              ref={carouselRef}
              className="flex gap-5 pb-2 overflow-x-auto snap-x snap-mandatory hide-scrollbar"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {partnersData.map((partner, index) => {
                const isActive = index === activeIndex;
                return (
                  <motion.div
                    key={index}
                    className="relative flex-shrink-0 overflow-hidden border cursor-pointer partner-card snap-center rounded-2xl border-white/10"
                    style={{
                      width: isActive ? "260px" : "220px",
                      height: isActive ? "420px" : "360px",
                      transition:
                        "width 0.45s cubic-bezier(0.4,0,0.2,1), height 0.45s cubic-bezier(0.4,0,0.2,1)",
                    }}
                    onClick={() => setActiveIndex(index)}
                    whileHover={{ scale: isActive ? 1 : 1.03 }}
                    animate={{
                      boxShadow: isActive
                        ? "0 0 40px rgba(255,122,0,0.25), 0 0 0 2px rgba(255,122,0,0.4)"
                        : "0 0 0px transparent",
                    }}
                    transition={{ duration: 0.35 }}
                  >
                    {/* Brand Pattern Background — full card */}
                    <div
                      className="absolute inset-0 bg-center bg-cover"
                      style={{ backgroundImage: `url(${partner.pattern})` }}
                    />

                    {/* Dark overlay for readability */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/70" />

                    {/* Partner Image — centered */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <motion.div
                        animate={{ scale: isActive ? 1.05 : 1 }}
                        transition={{ duration: 0.45 }}
                        className="rounded-full overflow-hidden border-[3px] border-white/30 shadow-2xl"
                        style={{ width: isActive ? "110px" : "88px", height: isActive ? "110px" : "88px", transition: "width 0.45s, height 0.45s" }}
                      >
                        <img
                          src={partner.image}
                          alt={partner.name}
                          className="object-cover w-full h-full"
                        />
                      </motion.div>
                    </div>

                    {/* Partner Full Name — bottom center */}
                    <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center px-4 pb-5">
                      <p
                        className="text-sm font-bold tracking-wide text-center text-white drop-shadow-lg"
                        style={{ fontFamily: "Orbitron, sans-serif" }}
                      >
                        {partner.name}
                      </p>
                      {isActive && (
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.4, delay: 0.1 }}
                          className="mt-2 h-[2px] w-10 rounded-full bg-[#FF7A00]"
                        />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Dot indicators */}
            <div className="flex justify-center gap-2 mt-5 lg:justify-start">
              {partnersData.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className="transition-all duration-300 rounded-full"
                  style={{
                    width: i === activeIndex ? "24px" : "8px",
                    height: "8px",
                    background:
                      i === activeIndex ? "#FF7A00" : "rgba(255,255,255,0.2)",
                  }}
                  aria-label={`Go to partner ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `.hide-scrollbar::-webkit-scrollbar { display: none; }`,
        }}
      />
    </section>
  );
}