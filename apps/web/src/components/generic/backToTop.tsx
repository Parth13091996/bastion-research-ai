import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

// Brand Colors
const COLORS = {
  red: "#C00000",
  blue: "#1C2852",
  beige: "#C4B696",
  gray: "#E6E6E6",
  white: "#ffffff",
  black: "#000000",
};

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;

      setScrollProgress(progress);
      setIsVisible(scrollTop > 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <button
        onClick={scrollToTop}
        className="relative w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-md transition-colors"
        style={{
          backgroundColor: `${COLORS.red}cc`, // semi-transparent for glassy effect
          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.35)",
        }}
      >
        {/* Circular progress ring */}
        <svg
          className="absolute inset-0 w-full h-full rotate-[-90deg]"
          viewBox="0 0 36 36"
        >
          <circle
            cx="18"
            cy="18"
            r="16"
            stroke={COLORS.gray}
            strokeWidth="3"
            fill="none"
            opacity="0.3"
          />
          <motion.circle
            cx="18"
            cy="18"
            r="16"
            stroke={COLORS.blue}
            strokeWidth="3"
            fill="none"
            strokeDasharray={100}
            strokeDashoffset={100 - scrollProgress}
            strokeLinecap="round"
            animate={{ strokeDashoffset: 100 - scrollProgress }}
            transition={{ ease: "easeOut", duration: 0.2 }}
          />
        </svg>

        {/* Arrow Icon as SVG */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke={COLORS.white}
          className="relative z-10 w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 15l7-7 7 7"
          />
        </svg>
      </button>
    </motion.div>
  );
};

export default BackToTop;
