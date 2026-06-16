import heroImage from "../../assets/Images/hero1.png";
import logo2 from "../../assets/Images/abxlogo2.png";
import AboutUs from "./AboutUs";
import Products from "./Products";
import AppSection from "./AppSection";
import Partners from "./Partners";
import Team from "./Team";
import { Instagram, Facebook, Twitter, Linkedin } from "lucide-react";

const socialLinks = [
  { icon: Instagram, label: "Instagram", href: "https://instagram.com/abx_motion" },
  { icon: Facebook, label: "Facebook", href: "https://facebook.com/abx_motion" },
  { icon: Twitter, label: "X", href: "https://x.com/abx_motion" },
  { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com/company/abx_motion" },
];

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <div
        className="relative w-full h-screen bg-center bg-cover"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        {/* Mobile Logo - Absolute positioned to stay in the hero and scroll away with the page */}
        <div className="absolute right-4 top-[136px] md:hidden pointer-events-none">
          <img
            src={logo2}
            alt="ABX Logo"
            className="object-contain w-auto h-32 drop-shadow-[0_0_12px_rgba(255,122,0,0.4)]"
          />
        </div>

        {/* Main Content Container */}
        <div className="flex flex-col h-full px-6 mx-auto w-[95%] max-w-7xl md:flex-row md:items-center md:justify-between">

          {/* LEFT COLUMN: Title, Description & Button */}
          <div className="flex flex-col justify-between h-full pt-6 pb-8 md:py-0 md:h-auto md:gap-8 md:w-1/2">
            <div className="flex flex-col items-center h-full gap-4 pt-20 md:h-auto md:items-start md:pt-0">

              {/* MOVE 4WAAD — desktop only */}
              <div
                className="
                  hidden md:flex
                  w-full max-w-sm px-6 py-4
                  items-center justify-center
                  rounded-2xl
                  backdrop-blur-xl
                  bg-black/10
                  border border-white/5
                  shadow-[inset_3px_3px_6px_rgba(0,0,0,0.4),inset_-3px_-3px_6px_rgba(255,255,255,0.1)]
                "
              >
                <h1
                  className="text-2xl text-white md:text-3xl lg:text-4xl drop-shadow-md"
                  style={{ fontFamily: '"Cyberform Demo", sans-serif' }}
                >
                  MOVE <span className="text-[#FF7A00]">4WAAD</span>
                  <sup className="ml-1 text-xs align-super md:text-sm opacity-80">
                    ™
                  </sup>
                </h1>
              </div>

              {/* DESCRIPTION TEXT */}
              <div
                className="
                  mt-auto md:mt-0
                  w-full max-w-sm p-6
                  rounded-2xl
                  backdrop-blur-xl
                  bg-black/20
                  border border-white/5
                  shadow-[inset_3px_3px_6px_rgba(0,0,0,0.4),inset_-3px_-3px_6px_rgba(255,255,255,0.1)]
                "
              >
                <p className="text-sm font-light leading-relaxed tracking-wide text-gray-200 lg:text-base">
                  <span className="block mb-2 font-semibold text-white">
                    Engineered for the future, styled for the city.{" "}
                    <span className="text-[#FF7A00] font-medium">ABX Motion</span> is
                    the fusion of cyberpunk aesthetics on smart audio electronics,
                    fitness technology and urban streetwear, built for those in a{" "}
                    <span className="text-[#F4EC47] font-medium">
                      never-ending pursuit of growth.
                    </span>
                  </span>
                  <span className="font-medium text-white">
                    Your journey to limitless potential starts now.
                  </span>
                </p>
              </div>

              {/* GET IN TOUCH BUTTON */}
              <div className="w-full max-w-sm">
                <button
                  className="relative w-full px-6 py-3 text-sm font-semibold tracking-wide text-white transition-all duration-300 border rounded-2xl backdrop-blur-xl bg-black/20 border-white/5 group"
                  style={{
                    boxShadow: `
                      3px 3px 6px rgba(0,0,0,0.4),
                      -3px -3px 6px rgba(255,255,255,0.1)
                    `,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = `
                      3px 3px 6px rgba(0,0,0,0.4),
                      -3px -3px 6px rgba(255,255,255,0.1),
                      0 0 20px rgba(255,122,0,0.25)
                    `;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = `
                      3px 3px 6px rgba(0,0,0,0.4),
                      -3px -3px 6px rgba(255,255,255,0.1)
                    `;
                  }}
                >
                  <span className="relative z-10 transition-colors duration-300 group-hover:text-[#FF7A00]">
                    Get In Touch
                  </span>
                </button>
              </div>

            </div>
          </div>

          {/* RIGHT COLUMN: Logo + Social Media Icons (desktop only) */}
          <div className="items-center justify-end hidden md:flex md:w-1/2">
            <div className="flex flex-col items-center gap-6 p-6">

              {/* Logo */}
              <img
                src={logo2}
                alt="ABX Logo"
                className="object-contain w-48 h-48 lg:w-64 lg:h-64"
                style={{
                  filter:
                    "drop-shadow(4px 4px 6px rgba(0,0,0,0.6)) drop-shadow(-4px -4px 6px rgba(255,255,255,0.15))",
                }}
              />

              {/* Social Media Circular Buttons */}
              <div className="flex items-center gap-3">
                {socialLinks.map((link) => {
                  const Icon = link.icon;

                  return (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.label}
                      className="
                        relative flex items-center justify-center
                        w-10 h-10 rounded-full
                        backdrop-blur-xl
                        bg-gradient-to-br from-white/10 via-white/5 to-transparent
                        border border-white/20
                        text-white/80
                        transition-all duration-300
                        hover:text-[#FF7A00]
                        hover:border-[#FF7A00]/50
                        group
                      "
                      style={{
                        boxShadow: `
                          4px 4px 10px rgba(0,0,0,0.5),
                          -3px -3px 8px rgba(255,255,255,0.08)
                        `,
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.boxShadow = `
                          4px 4px 10px rgba(0,0,0,0.5),
                          -3px -3px 8px rgba(255,255,255,0.08),
                          0 0 16px rgba(255,122,0,0.3),
                          inset 0 0 8px rgba(255,122,0,0.1)
                        `;
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.boxShadow = `
                          4px 4px 10px rgba(0,0,0,0.5),
                          -3px -3px 8px rgba(255,255,255,0.08)
                        `;
                      }}
                    >
                      <Icon size={16} className="relative z-10" />
                    </a>
                  );
                })}
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* About Us Section */}
      <AboutUs />
            {/* Products Section */}
      <Products />
      {/* ABX Motion App Section */}
      <AppSection />
      {/* Team Section */}
      <Team />
      {/* Partners Section */}
      <Partners />
    </div>
  );
}
