import React from "react";

export default function ReitSuitability() {
  const suitPoints = [
    "Real estate exposure without buying physical property.",
    "Potential regular distributions from rent-generating assets.",
    "Better liquidity and lower ticket size than physical real estate.",
    "A professionally tracked REIT allocation framework.",
  ];

  const nonSuitPoints = [
    "Guaranteed returns or capital protection.",
    "No price volatility at all.",
    "A very short holding period.",
    "A product identical to fixed deposits or debt funds.",
    "Already have high real estate exposure, excluding your self occupied house.",
  ];

  return (
    <section id="suitability" className="py-[72px] md:py-[96px] bg-[#f6f0e4] border-b border-[#E4E7EF]">
      <div className="max-w-[1180px] w-[92vw] mx-auto text-center">
        {/* Section Header */}
        <div className="max-w-[900px] mx-auto text-center mb-[48px]">
          <div className="inline-flex items-center justify-center gap-2.5 text-[#B00914] uppercase tracking-[0.14em] text-[0.78rem] font-[950] mb-3">
            <span className="w-6 h-[3px] rounded-full bg-[#C6B68A]" />
            SUITABILITY BEFORE STORY
          </div>
          <h2 className="font-serif text-[#0B1229] text-[2rem] sm:text-[2.5rem] md:text-[3.1rem] lg:text-[3.6rem] leading-[1.15] font-bold m-0 mt-2">
            Who should consider this?
          </h2>
          <p className="text-[#5B6882] text-sm md:text-[1rem] mt-5 font-normal max-w-[760px] mx-auto leading-relaxed">
            REITs can be useful for portfolio diversification, but they are market-linked instruments. Unit prices and distributions can fluctuate.
          </p>
        </div>

        {/* Two Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-[1140px] mx-auto">
          {/* Card 1: May suit */}
          <div className="bg-white border border-[#E4E7EF] rounded-[32px] p-6 sm:p-8 shadow-[0_20px_50px_rgba(11,18,41,0.05)] relative overflow-hidden pt-8 text-left flex flex-col">
            <div className="absolute inset-x-0 top-0 h-[8px] bg-[#18894F]" />
            <h3 className="text-[#0B1229] text-[1.2rem] sm:text-[1.3rem] font-bold mb-4 font-serif">
              May suit investors who want
            </h3>
            <ul className="space-y-2">
              {suitPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#17213C] mt-[0.55rem] shrink-0 opacity-80" />
                  <span className="text-[#3C4656] text-[0.92rem] sm:text-[0.96rem] leading-normal font-normal">
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Card 2: May not suit */}
          <div className="bg-white border border-[#E4E7EF] rounded-[32px] p-6 sm:p-8 shadow-[0_20px_50px_rgba(11,18,41,0.05)] relative overflow-hidden pt-8 text-left flex flex-col">
            <div className="absolute inset-x-0 top-0 h-[8px] bg-[#B00914]" />
            <h3 className="text-[#0B1229] text-[1.2rem] sm:text-[1.3rem] font-bold mb-4 font-serif">
              May not suit investors who need
            </h3>
            <ul className="space-y-2">
              {nonSuitPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#17213C] mt-[0.55rem] shrink-0 opacity-80" />
                  <span className="text-[#3C4656] text-[0.92rem] sm:text-[0.96rem] leading-normal font-normal">
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

