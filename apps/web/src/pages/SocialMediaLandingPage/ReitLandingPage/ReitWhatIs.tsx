import React from "react";

export default function ReitWhatIs() {
  const cards = [
    {
      num: "1",
      title: "Money goes into many properties",
      desc: "Not one self-managed property.",
    },
    {
      num: "2",
      title: "Professionals manage the assets",
      desc: "Leasing, operations and portfolio management are handled by the REIT manager.",
    },
    {
      num: "3",
      title: "You can buy and sell listed units",
      desc: "Access and exit are much easier than physical property.",
    },
  ];

  return (
    <section id="what-is-reit" className="py-[72px] md:py-[96px] bg-[#FBF8F1] border-b border-[#E4E7EF]">
      <div className="max-w-[1180px] w-[92vw] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-14 items-center">
          {/* Left Column - Texts, fonts, styles and cards */}
          <div className="flex flex-col text-left max-w-[580px] w-full">
            <div className="inline-flex items-center gap-[8px] text-[#B00914] uppercase tracking-[0.16em] text-[0.84rem] font-[950] mb-3">
              <span className="w-8 h-[3px] rounded-full bg-[#C6B68A] block" />
              UNDERSTAND FAST
            </div>

            <h2 className="font-serif text-[#0B1229] text-[2rem] sm:text-[2.8rem] md:text-[3rem] lg:text-[3.5rem] leading-[1.1] font-bold m-0 mt-2">
              What is a REIT?
            </h2>

            <p className="text-[#5B6882] text-sm md:text-[.92rem] mt-5 font-normal leading-relaxed">
              Think of it like a mutual fund &mdash; but for real estate. Investors pool money, the REIT owns multiple properties, professionals manage them, and investors receive distributions.
            </p>

            {/* Vertically Stacked Cards */}
            <div className="flex flex-col gap-3 mt-5 w-full">
              {cards.map((card, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-[#E4E7EF]/85 rounded-[24px] p-5 md:p-6 shadow-[0_12px_36px_rgba(11,18,41,0.03)] flex items-start gap-4 md:gap-5"
                >
                  <div className="flex items-center justify-center w-[28px] h-[28px] rounded-full bg-[#B00914] text-white font-bold text-[.92rem] mt-0.2">
                    {card.num}
                  </div>
                  <div>
                    <h4 className="text-[#0B1229] text-[1rem] font-bold m-0 leading-snug">
                      {card.title}
                    </h4>
                    <p className="text-[#5B6882] text-[.92rem] leading-relaxed mt-1.5 m-0 font-normal">
                      {card.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Image container box and below title/banner */}
          <div className="flex flex-col items-center w-full lg:max-w-[710px] mx-auto">
            {/* Image Container Card */}
            <div className="bg-white border border-[#E4E7EF] rounded-[32px] p-4 md:p-5 shadow-[0_24px_70px_rgba(11,18,41,0.08)] w-full max-h-[280px] md:max-h-[330px] flex items-center justify-center overflow-hidden">
              <img
                src="/media/whatisreit.png"
                alt="What is a REIT comparison"
                className="w-auto max-w-full h-auto max-h-[320px] md:max-h-[330px] object-contain rounded-[14px]"
              />
            </div>

            {/* Dark Navy Banner Underneath Image Container */}
            <div className="w-full bg-[#0B1229] text-white rounded-[24px] py-4 px-6 md:px-8 text-center font-bold text-[0.95rem] md:text-[1.05rem] leading-snug shadow-[0_16px_36px_rgba(11,18,41,0.18)] mt-6">
              Mutual Fund buys many stocks. <span className="text-[#C6B68A]">REIT buys many properties.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
