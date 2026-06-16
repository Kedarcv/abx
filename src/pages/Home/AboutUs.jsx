import aboutusbackground from "../../assets/Images/aboutusbackground.png";
import tablet from "../../assets/Images/tablet.png";

const AboutSection = () => {
  return (
    <section
      id="aboutus"
      className="relative flex min-h-[60vh] w-full items-center justify-center overflow-hidden py-12 md:py-24"
    >
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0">
        <img
          src={aboutusbackground}
          alt="About Us Background"
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      {/* Two-Column Layout */}
      <div className="relative z-10 w-full max-w-[95%] xl:max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-8 md:gap-12">

        {/* LEFT: Tablet Image — 3/4 width */}
        <div className="flex items-center justify-center w-full md:w-3/4">
          <img
            src={tablet}
            alt="Tablet Display"
            className="h-auto w-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-transform duration-500 hover:scale-[1.01]"
          />
        </div>

        {/* RIGHT: Combined Text Panel — 1/4 width */}
        <div className="flex items-center justify-center w-full md:w-1/4">
          <div
            className="
              w-full p-8
              rounded-2xl
              bg-black/60
              border border-[#FF7A00]/10
              shadow-[inset_3px_3px_8px_rgba(255,122,0,0.25),inset_-3px_-3px_8px_rgba(255,122,0,0.08),0_0_24px_rgba(255,122,0,0.05)]
              backdrop-blur-xl
            "
          >
            {/* Block 1 */}
            <div className="mb-6">
              <h3 className="mb-3 text-base font-semibold text-white lg:text-lg">
                Your never ending Pursuit of Growth™ is an Evolution.
              </h3>
              <p className="text-sm font-light leading-relaxed tracking-wide text-gray-300 lg:text-[0.9rem]">
                Motion is not just about movement; it's about progress. It's about a relentless, forward
                trajectory. We believe every stride you take, every challenge you conquer, and every boundary
                you push is a step toward a better version of yourself.
              </p>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-[#000000]/40 to-transparent mb-6" />

            {/* Block 2 */}
            <div>
              <h3 className="mb-3 text-base font-semibold text-white lg:text-lg">
                ABX Motion is the embodiment of this philosophy.
              </h3>
              <p className="text-sm font-light leading-relaxed tracking-wide text-gray-300 lg:text-[0.9rem]">
                It's the physical expression of ABX in Motion, the ability extension brand in
                action, a commitment to consistently be in motion, to never standing still, to
                always{" "}
                <span className="text-[#F4EC47] font-medium">Move 4waad™</span>.
                <br /><br />
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default AboutSection;
