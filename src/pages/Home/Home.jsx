// --- Home.jsx ---

import heroImage from "../../assets/Images/hero1.png";
import AboutUs from "./AboutUs";
import Products from "./Products";
import Partners from "./Partners";
import Team from "./Team";

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <div
        className="relative w-full h-screen bg-center bg-cover"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        {/* Main Content Container */}
        <div className="w-[95%] max-w-7xl mx-auto px-6 h-full flex flex-col md:flex-row md:items-center md:justify-between">
          {/* LEFT COLUMN: Title & Button */}
          {/* Mobile: h-full + justify-between keeps title top/button bottom. Desktop: Auto height + centered. */}
          <div className="flex flex-col justify-between h-full pt-6 pb-8 md:py-0 md:h-auto md:gap-8 md:w-1/2">
            {/* TOP TEXT */}
            <div className="flex justify-center pt-20 md:justify-start md:pt-0">
              <div
                className="
      px-6 py-4 
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
                  <sup className="ml-1 text-xs md:text-sm align-super opacity-80">
                    ™
                  </sup>
                </h1>
              </div>
            </div>

            {/* BOTTOM BUTTON */}
            <div className="flex justify-center md:justify-start">
              <div className="backdrop-blur-xl bg-gradient-to-r from-black/30 via-[#FF7A00]/10 to-black/30 border border-white/10 shadow-lg rounded-full px-1.5 py-1 w-fit">
                <button className="px-4 py-1.5 text-white font-semibold text-xs md:text-sm hover:border-white/20 hover:shadow-xl transition-all duration-300 hover:text-[#FF7A00]">
                  Visit Shop
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Description Text (Desktop Only) */}
          <div className="items-center justify-end hidden md:flex md:w-1/2">
            <div
              className="
      max-w-sm p-6 
      translate-x-4 lg:translate-x-8
      rounded-2xl 
      backdrop-blur-xl 
      bg-black/20 
      border border-white/5
      shadow-[inset_3px_3px_6px_rgba(0,0,0,0.4),inset_-3px_-3px_6px_rgba(255,255,255,0.1)]
    "
            >
              <p className="text-sm font-light leading-relaxed tracking-wide text-gray-200 lg:text-base">
                <span className="block mb-2 font-semibold text-white">
                  Engineered for the future, styled for the city.
                </span>
                <span className="text-[#FF7A00] font-medium">
                  Your journey to limitless potential starts now.
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* About Us Section */}
      <AboutUs />
      {/* Products Section */}
      <Products />
      {/* Team Section */}
      <Team />
      {/* Partners Section */}
      <Partners />
      
      
    </div>
  );
}
