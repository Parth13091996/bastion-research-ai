// src/components/landing/Landing.tsx
import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Fit from "./components/Fit";
import Sample from "./components/Sample";
import How from "./components/how";
import Pricing from "./components/Pricing";
import Pilot from "./components/Pilot";
import Faq from "./components/Faq";
import Testimonials from "./components/Testimonials";
import Footer from "./components/footer";
import StickyCTA from "./components/StickyCTA";
import Hero from "./components/Hero";

const Landing: React.FC = () => {
  const [activeSection, setActiveSection] = useState("fit");

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -60;
      const y = el.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["fit", "sample", "how", "pricing", "testimonials", "pilot", "faq"];
      let current = activeSection;

      sections.forEach((section) => {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 80 && rect.bottom >= 80) {
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
    <div>
      <StickyCTA/>
      <Header activeSection={activeSection} onMenuClick={scrollToSection} />
      <main className="pt-20">
        <Hero/>
        <Fit />
        <Sample />
        <How />
        <Pricing />
        <Testimonials />
        <Pilot />
        <Faq />
      </main>
      <Footer />
      <StickyCTA />
    </div>
  );
};

export default Landing;
