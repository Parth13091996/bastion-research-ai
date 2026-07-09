import React from "react";
import ReitMemoCard from "./ReitMemoCard";

interface ReitHeroProps {
  onScrollTo: (id: string) => void;
}

export default function ReitHero({ onScrollTo }: ReitHeroProps) {
  return (
    <header
      className="relative overflow-hidden text-white pt-[76px] pb-[48px] md:pt-[96px] md:pb-[72px]"
      style={{
        background: `
          radial-gradient(circle at 84% 18%, rgba(198,182,138,0.26), transparent 36%),
          radial-gradient(circle at 12% 72%, rgba(176,9,20,0.26), transparent 40%),
          linear-gradient(135deg, #0B1229 0%, #182B63 54%, #6F001C 145%)
        `
      }}
    >
      {/* Circle outline background decoration (reverted to original size but with lighter grey border) */}
      <div className="absolute right-[-160px] top-[70px] w-[380px] h-[380px] border border-gray-400/25 rounded-full pointer-events-none hidden md:block" />

      <div className="max-w-[1180px] w-[92vw] mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1.06fr_0.74fr] gap-[42px] items-center">
          {/* Hero Left Content */}
          <div className="flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-[10px] uppercase tracking-[0.16em] text-[#C6B68A] font-black text-[0.84rem] md:text-[0.9rem] mb-[16px]">
              <span className="w-[46px] h-[5px] rounded-full bg-[#C6B68A] block" />
              REIT SMALLCASE BY BASTION RESEARCH
            </div>

            <h1 className="font-serif font-bold text-white text-[2.9rem] md:text-[4.5vw] lg:text-[5.2rem] leading-[1.1] tracking-tight m-0">
              Real Estate <br />
              Income. Zero <br />
              Landlord <br />
              Drama.
            </h1>

            <p className="max-w-[790px] text-[#F7F9FC] text-[1.12rem] md:text-[1.38rem] mt-[24px] font-normal leading-relaxed">
              Access income-generating commercial real estate through listed REITs &mdash; without tenant calls, maintenance headaches, large ticket size, or the pain of selling a physical property.
            </p>

            <div className="flex flex-wrap gap-[14px] mt-[30px] w-full sm:w-auto">
              <a
                href="https://bastionresearch.smallcase.com/smallcase/BARENM_0001"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center min-h-[50px] px-[32px] rounded-full bg-[#B00914] text-white font-bold text-[0.95rem] hover:translate-y-[-2px] transition-all duration-200 shadow-[0_18px_35px_rgba(176,9,20,0.24)] hover:shadow-[0_22px_42px_rgba(176,9,20,0.34)]"
              >
                Explore Prime Real Estate Income &rarr;
              </a>
              <a
                href="https://payments.cashfree.com/forms/REIT_bastionresearch"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center min-h-[50px] px-[32px] rounded-full border-2 border-[#C6B68A] text-[#C6B68A] hover:bg-[#C6B68A] hover:text-[#0B1229] font-bold text-[0.95rem] hover:translate-y-[-2px] transition-all duration-200 shadow-[0_18px_35px_rgba(198,182,138,0.15)] hover:shadow-[0_22px_42px_rgba(198,182,138,0.25)] gap-[10px]"
              >

                Understand REITs
              </a>
            </div>

            <div className="flex flex-row flex-nowrap overflow-x-auto whitespace-nowrap gap-[10px] mt-[24px] scrollbar-hide w-full">
              <div className="inline-flex items-center gap-[8px] px-[12px] py-[8px] rounded-full border border-white/18 bg-white/8 text-white font-bold text-[0.84rem] md:text-[0.88rem] shrink-0">
                ✓ Listed REIT units
              </div>
              <div className="inline-flex items-center gap-[8px] px-[12px] py-[8px] rounded-full border border-white/18 bg-white/8 text-white font-bold text-[0.84rem] md:text-[0.88rem] shrink-0">
                ✓ Research backed allocation
              </div>
              <div className="inline-flex items-center gap-[8px] px-[12px] py-[8px] rounded-full border border-white/18 bg-white/8 text-white font-bold text-[0.84rem] md:text-[0.88rem] shrink-0">
                ✓ Income + appreciation lens
              </div>
            </div>
          </div>

          {/* Hero Right Content - Memo Card */}
          <div className="flex justify-center lg:justify-end w-full">
            <ReitMemoCard />
          </div>
        </div>
      </div>
    </header>
  );
}
