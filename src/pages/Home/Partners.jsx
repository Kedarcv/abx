import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

import { sportstakelabslogo, sportstakelabspattern, partnersbackground } from "../../constants/index.js";

export default function Partners() {
  const partner = {
    name: "SportsTake Labs",
    firstName: "SportsTake Labs",
    bio: "AI-driven sports Innovation & technology company specializing in business development, brand strategy, athlete management, and data analytics. By leveraging cutting-edge artificial intelligence and data-driven insights, Virtual reality athlete development, Fan engagement innovations, Train like a pro apps to unlock new opportunities in the Zimbabwean sports industry, enhancing performance, fan engagement, and operational efficiency. Our expertise drives the evolution of the sports economy by delivering AI-powered solutions that create measurable value for athletes, teams, clubs, and governing organizations.",
    image: sportstakelabslogo,
    pattern: sportstakelabspattern,
  };

  return (
    <section
      id="partners"
      className="relative flex items-center justify-center w-full min-h-screen py-20 overflow-hidden bg-black"
    >
      {/* Background Image Layer */}
      <div
        className="absolute inset-0 bg-center bg-cover pointer-events-none opacity-20"
        style={{ backgroundImage: `url(${partnersbackground})` }}
      />

      {/* Ambient Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 20% 50%, rgba(255,122,0,0.05) 0%, transparent 70%)",
        }}
      />

      {/* Added relative z-10 to ensure content sits above the new background */}
      <div className="relative z-10 w-[95%] max-w-6xl mx-auto">
        {/* Header */}
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center text-[#FF7A00] text-5xl md:text-6xl font-bold mb-16 tracking-widest"
          style={{ fontFamily: "Orbitron, sans-serif" }}
        >
          PARTNER
        </motion.h2>

        {/* Main Layout */}
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* LEFT: Info */}
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 font-extrabold text-white"
              style={{
                fontFamily: "Orbitron, sans-serif",
                fontSize: "clamp(3rem, 6vw, 5rem)",
              }}
            >
              {partner.firstName}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="max-w-md mb-8 text-sm leading-relaxed text-gray-400 md:text-base"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {partner.bio}
            </motion.p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 py-3 text-sm font-semibold text-black rounded-lg px-7"
              style={{
                fontFamily: "Orbitron, sans-serif",
                background:
                  "linear-gradient(135deg, #F4EC47 0%, #F4EC47 100%)",
                boxShadow: "0 0 20px rgba(255,122,0,0.35)",
              }}
            >
              Visit Collection
              <ExternalLink className="w-4 h-4" />
            </motion.button>
          </div>

          {/* RIGHT: Visual Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="relative w-full max-w-sm mx-auto overflow-hidden border rounded-2xl border-white/10"
            style={{ height: "420px" }}
          >
            {/* Background Pattern */}
            <div
              className="absolute inset-0 bg-center bg-cover"
              style={{ backgroundImage: `url(${partner.pattern})` }}
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/80" />

            {/* Image */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="overflow-hidden rounded-full border-[3px] border-white/30 shadow-2xl"
                style={{ width: "120px", height: "120px" }}
              >
                <img
                  src={partner.image}
                  alt={partner.name}
                  className="object-cover w-full h-full"
                />
              </motion.div>
            </div>

            {/* Name */}
            <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-6">
              <p
                className="text-sm font-bold tracking-wide text-white"
                style={{ fontFamily: "Orbitron, sans-serif" }}
              >
                {partner.name}
              </p>

              <div className="mt-2 h-[2px] w-10 rounded-full bg-[#F4EC47]" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
