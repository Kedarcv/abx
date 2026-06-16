import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink } from "lucide-react";

import {
  nuttyshead,
  nuttysbody,
  paulshead,
  paulsbody,
  michaelshead,
  michaelsbody,
  nutty,
  paul,
  michael,
} from "../../constants/index.js";

const teamData = [
  {
    id: "nutty",
    name: "Nutty O",
    role: "Visionary",
    focus: "Brand Identity",
    bio: 'A multi award winning musician and consistent chart topper, Carrington "Nutty O" Chiwadzwa spearheads the brand\'s artistic direction. Drawing from his award-winning career and his "Ability Xtention" (ABX) philosophy, he ensures that every project reflects a commitment to innovation and creative excellence, pushing the boundaries of the brand\'s visual and sonic identity.',
    head: nuttyshead,
    body: nuttysbody,
    image: nutty,
    accentColor: "#FF7A00",
  },
  {
    id: "paul",
    name: "Paul Ntonya",
    role: "Creative Director",
    focus: "Product Vision and Business Development",
    bio: "Paul drives the company's creative direction, strategic business development and operational efficiency. As a design thinker with a certification in digital marketing and sports management, he specializes in identifying the synergies between technology, arts, and economics. He is responsible for building the scalable creative ecosystems that allow the brand to build unprecedented product offerings.",
    head: paulshead,
    body: paulsbody,
    image: paul,
    accentColor: "#FF7A00",
  },
  {
    id: "michael",
    name: "Michael Nkomo",
    role: "CTO",
    focus: "Lead in Tech and Innovation",
    bio: "Michael (Mlungisi) Nkomo is an Artificial Intelligence Engineer and award‑winning innovator based in Zimbabwe. He partners with leading technology organizations to design and deploy AI‑driven solutions, with a strong focus on scalability, reliability, and measurable business impact. ",
    head: michaelshead,
    body: michaelsbody,
    image: michael,
    accentColor: "#FF7A00",
  },
];

function BobbleCharacter({ member, isSelected, onClick, onHover }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative flex flex-col items-center cursor-pointer select-none"
      onClick={onClick}
      onHoverStart={() => {
        setIsHovered(true);
        if (onHover) onHover();
      }}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          className="relative z-20"
          style={{ transformOrigin: "50% 100%", marginBottom: "-10px" }}
          animate={
            isHovered
              ? {
                  rotate: [0, -8, 10, -6, 7, -4, 5, -2, 3, 0],
                  y: [0, -4, -2, -5, -2, -4, -1, -3, -1, 0],
                  scale: [1, 1.04, 1.02, 1.04, 1.02, 1.03, 1.01, 1.02, 1, 1],
                }
              : isSelected
              ? { rotate: [0, -5, 6, -4, 5, 0], scale: 1.03 }
              : { rotate: 0, y: 0, scale: 1 }
          }
          transition={
            isHovered
              ? {
                  duration: 1.4,
                  ease: "easeInOut",
                  times: [0, 0.1, 0.2, 0.35, 0.5, 0.62, 0.72, 0.82, 0.92, 1],
                }
              : { duration: 0.5, ease: "easeOut" }
          }
        >
          <img
            src={member.head}
            alt={`${member.name} head`}
            className="object-contain object-bottom w-20 h-20 md:w-32 md:h-32 drop-shadow-lg"
            draggable={false}
          />
        </motion.div>

        <motion.div
          animate={isHovered ? { y: [0, 2, 0, 2, 0] } : { y: 0 }}
          transition={
            isHovered
              ? { duration: 1.4, ease: "easeInOut" }
              : { duration: 0.4 }
          }
        >
          <img
            src={member.body}
            alt={`${member.name} body`}
            className="object-contain object-top w-28 h-44 md:w-40 md:h-64"
            draggable={false}
          />
        </motion.div>
      </div>

      <motion.div
        className="mt-4 text-center"
        animate={{ opacity: isSelected ? 1 : 0.65 }}
      >
        <p
          className="text-xs font-semibold tracking-widest uppercase"
          style={{
            color: isSelected ? "#F4EC47" : "rgba(255,255,255,0.7)",
            fontFamily: "'DM Sans', sans-serif",
            letterSpacing: "0.12em",
          }}
        >
          {member.name.split(" ")[0]}
        </p>
      </motion.div>

      <motion.div
        className="mt-1 rounded-full"
        animate={{
          width: isSelected ? "24px" : "6px",
          opacity: isSelected ? 1 : 0.3,
        }}
        transition={{ duration: 0.3 }}
        style={{ height: "3px", background: "#F4EC47" }}
      />
    </motion.div>
  );
}

function DetailPanel({ member, onClose }) {
  return (
    <motion.div
      key={member.id}
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.97 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="relative h-full overflow-hidden rounded-2xl"
      style={{
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 60%, rgba(0,0,0,0.4) 100%)",
        border: "1px solid rgba(255,255,255,0.1)",
        backdropFilter: "blur(16px)",
      }}
    >
      <div
        className="h-0.5 w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, #FF7A00 40%, transparent)",
        }}
      />

      <div className="p-6 md:p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full transition-colors"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <X size={16} className="text-white/60 hover:text-white" />
        </button>

        {/* ── Profile image ── */}
        <div className="flex items-center gap-4 mb-5">
          <div
            className="flex-shrink-0 w-16 h-16 overflow-hidden rounded-full"
            style={{
              border: "2px solid #FF7A00",
              boxShadow: "0 0 12px rgba(255,122,0,0.35)",
            }}
          >
            <img
              src={member.image}
              alt={member.name}
              className="object-cover object-top w-full h-full"
              draggable={false}
            />
          </div>

          <div>
            <h3
              className="text-xl font-bold leading-tight text-white"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {member.name}
            </h3>

            <p
              className="text-sm mt-0.5 font-medium"
              style={{ color: "#FF7A00", fontFamily: "'DM Sans', sans-serif" }}
            >
              {member.role}
            </p>

            <p
              className="mt-1 text-xs tracking-widest uppercase text-white/40"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {member.focus}
            </p>
          </div>
        </div>
        {/* ── End profile image ── */}

        <div
          className="h-px mb-4"
          style={{ background: "rgba(255,255,255,0.06)" }}
        />

        <p
          className="text-sm leading-relaxed text-white/65"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {member.bio}
        </p>

        <button
          className="flex items-center gap-2 mt-5 text-xs font-semibold tracking-widest uppercase transition-all duration-200 group"
          style={{
            color: "#F4EC47",
            fontFamily: "'DM Sans', sans-serif",
            letterSpacing: "0.14em",
          }}
        >
          View Portfolio
          <ExternalLink
            size={12}
            className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
          />
        </button>
      </div>
    </motion.div>
  );
}

export default function Team() {
  const [selectedId, setSelectedId] = useState(null);

  const selectedMember = teamData.find((m) => m.id === selectedId) || null;

  const handleSelect = (id) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="team"
      className="relative w-full px-4 py-24 overflow-hidden"
      style={{ background: "#000000" }}
    >
      <motion.div
        className="relative z-10 mb-16 text-center"
        initial={{ opacity: 0, y: -16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <p
          className="text-xs uppercase tracking-[0.3em] mb-3"
          style={{ color: "#FF7A00", fontFamily: "'DM Sans', sans-serif" }}
        >
          The People Behind The Vision
        </p>

        <h2
          className="text-4xl font-extrabold leading-none text-white md:text-5xl"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          OUR TEAM
        </h2>

        <div
          className="mx-auto mt-4 h-0.5 w-16"
          style={{ background: "#FF7A00", opacity: 0.6 }}
        />

      </motion.div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-stretch">
          <div className="flex items-center flex-1 w-full">
            <div className="flex items-end justify-center w-full gap-4 md:gap-8 lg:gap-12 xl:gap-16">
              {teamData.map((member) => (
                <BobbleCharacter
                  key={member.id}
                  member={member}
                  isSelected={selectedId === member.id}
                  onClick={() => handleSelect(member.id)}
                  onHover={() => setSelectedId(member.id)}
                />
              ))}
            </div>

            <div
              className="mx-auto mt-6"
              style={{
                height: "1px",
                maxWidth: "520px",
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.1) 30%, rgba(255,255,255,0.1) 70%, transparent)",
              }}
            />
          </div>

          <div className="w-full lg:w-80 xl:w-96 lg:h-[420px] lg:flex-shrink-0">
            <AnimatePresence mode="wait">
              {selectedMember ? (
                <DetailPanel
                  key={selectedMember.id}
                  member={selectedMember}
                  onClose={() => setSelectedId(null)}
                />
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full py-16 lg:py-0"
                >
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                      ease: "easeInOut",
                    }}
                    className="mb-4 opacity-30"
                  >
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                      <path
                        d="M16 4 L16 28 M8 20 L16 28 L24 20"
                        stroke="#FF7A00"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </motion.div>

                  <p
                    className="text-xs tracking-widest uppercase text-white/25"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    Select a character
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
