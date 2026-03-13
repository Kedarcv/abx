import React from 'react';
import aboutusbackground from "../../assets/Images/aboutusbackground.png";
import tablet from "../../assets/Images/tablet.png";
import TextType from './TextType'; // Adjust this import path if your component is in a different folder

const AboutSection = () => {
  const brandText = "Your never ending Pursuit of Growth™ is an Evolution. Motion is not just about movement; it’s about progress. It's about a relentless, forward trajectory. We believe every stride you take, every challenge you conquer, and every boundary you push is a step toward a better version of yourself. ABX Motion is the embodiment of this philosophy. It's the physical expression of the ABX, ability extenxion brand in action—a commitment to being in motion, to never standing still, to always Move 4waad™. In a world that wants you to keep you boxed in one place, we build the gear that helps you escape. We live where technology meets the street, where function meets avant-garde, and where your ability is amplified by every choice you make.";

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
        {/* Optional: Overlay slightly darkened to ensure the text is readable */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Tablet Image Layer (Foreground) */}
      <div className="relative z-10 w-full max-w-[90%] md:max-w-5xl px-4 flex flex-col items-center">
        <img
          src={tablet}
          alt="Tablet Display"
          className="h-auto w-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-transform duration-500 hover:scale-[1.01]"
        />

        {/* Animated Text Layer */}
        <div className="max-w-4xl mt-10 text-sm font-medium text-center text-white md:text-lg md:leading-relaxed drop-shadow-md">
          <TextType 
            text={brandText}
            typingSpeed={25} // Faster speed for longer paragraphs
            showCursor={true}
            cursorCharacter="|"
            loop={false} // Stops the text from deleting itself after typing
            className="text-white/90"
          />
        </div>
      </div>
    </section>
  );
};

export default AboutSection;