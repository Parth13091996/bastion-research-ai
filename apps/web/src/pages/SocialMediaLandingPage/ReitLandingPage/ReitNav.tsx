import React, { useState, useEffect } from "react";

interface ReitNavProps {
  onScrollTo: (id: string) => void;
}

export default function ReitNav({ onScrollTo }: ReitNavProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#FBF8F1]/75 backdrop-blur-md border-b border-[#E4E7EF]/60 shadow-[0_8px_30px_rgba(11,18,41,0.04)]"
          : "bg-[#FBF8F1] border-b border-[#E4E7EF]/90"
      }`}
    >
      <div className="max-w-[1180px] w-[92vw] mx-auto min-h-[76px] flex justify-between items-center gap-[22px]">
        <a href="#top" className="flex items-center gap-[13px] no-underline min-w-0" aria-label="Bastion Research">
          <img
            src="/media/Bastion-Logo.png"
            alt="Bastion Research"
            className="w-[54px] h-[54px] object-contain block"
          />
          <div className="flex flex-col">
            <strong className="block text-[#0B1229] leading-none tracking-wider font-[950] text-[0.92rem] md:text-[1.1rem]">
              BASTION RESEARCH
            </strong>
            <span className="block text-[#68738C] text-[0.72rem] md:text-[0.78rem] mt-[4px] font-medium">
              Prime Real Estate Income – REIT Portfolio
            </span>
          </div>
        </a>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-[28px] font-bold text-[#25314C] text-[0.92rem]">
          <button
            onClick={() => onScrollTo("what-is-reit")}
            className="hover:text-[#B00914] transition-colors duration-200"
          >
            What is REIT?
          </button>
          <button
            onClick={() => onScrollTo("suitability")}
            className="hover:text-[#B00914] transition-colors duration-200"
          >
            Suitability
          </button>
          <button
            onClick={() => onScrollTo("myths")}
            className="hover:text-[#B00914] transition-colors duration-200"
          >
            Myths
          </button>
          <button
            onClick={() => onScrollTo("portfolio")}
            className="hover:text-[#B00914] transition-colors duration-200"
          >
            smallcase
          </button>
        </div>

        {/* CTA Button */}
        <div className="flex items-center">
          <a
            href="https://bastionresearch.smallcase.com/smallcase/BARENM_0001"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center justify-center min-h-[52px] px-6 rounded-full bg-[#B00914] hover:bg-[#C20A15] text-white font-bold text-[1.02rem] transition-all duration-200 shadow-[0_12px_24px_rgba(176,9,20,0.2)] hover:shadow-[0_16px_32px_rgba(176,9,20,0.3)] hover:scale-[1.02] active:scale-[0.98] transform-gpu gap-1.5"
          >
            Explore smallcase &rarr;
          </a>
        </div>
      </div>
    </nav>
  );
}
