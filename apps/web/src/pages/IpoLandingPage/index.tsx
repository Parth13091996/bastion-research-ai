import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Fit from "./components/Fit";
import Sample from "./components/Sample";
import How from "./components/How";
import Pricing from "./components/Pricing";
import Pilot from "./components/Pilot";
import Faq from "./components/Faq";
import Testimonials from "./components/Testimonials";
import Hero from "./components/Hero";
import Footer from "./components/footer";

const Landing: React.FC = () => {
  const [activeSection, setActiveSection] = useState("fit");

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -104; // 32px banner + 72px header
      const y = el.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        "fit",
        "sample",
        "how",
        "pricing",
        "testimonials",
        "pilot",
        "faq",
      ];
      let current = activeSection;

      sections.forEach((section) => {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120 && rect.bottom >= 120) {
            current = section;
          }
        }
      });

      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeSection]);

  return (
    <div className="bg-gray-50 min-h-screen w-full overflow-x-hidden">
      {/* ✅ Fixed Banner + Header Wrapper */}
      <div className="fixed top-0 left-0 w-full z-50">
        {/* 🔹 Top Banner */}
        <div className="bg-indigo-700 text-white py-2 px-3 sm:px-4 text-center text-xs sm:text-xs leading-snug z-[60] ">
          <span className="font-bold text-sm">Time-bound Pilot: </span> ₹ 99 for 14
          days → auto-renews at{" "}
          <span className="font-bold text-sm"> ₹ 1,500/yr </span>. Covers all live IPOs
          during your trial. Cancel anytime. No listing-pop predictions.
        </div>

        {/* 🔹 Header Below Banner */}
        <div className="relative z-[55]">
          <Header activeSection={activeSection} onMenuClick={scrollToSection} />
        </div>
      </div>

      {/* ✅ Push content below banner + header */}
      <main className="pt-[104px] sm:pt-[104px]">
        <Hero />
        <Fit />
        <Sample />
        <How />
        <Pricing />
        <Testimonials />
        <Pilot />
        <Faq />
      </main>

      <Footer />
    </div>
  );
};

export default Landing;
