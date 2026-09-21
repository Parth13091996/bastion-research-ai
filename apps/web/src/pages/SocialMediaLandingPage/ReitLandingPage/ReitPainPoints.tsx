import React from "react";

export default function ReitPainPoints() {
  const painPoints = [
    {
      title: "Large ticket size",
      desc: "Quality property usually requires a large upfront cheque.",
    },
    {
      title: "Low liquidity",
      desc: "Need cash? You cannot sell only a part of the property.",
    },
    {
      title: "One-asset risk",
      desc: "One city, one building, one tenant, one local market cycle.",
    },
    {
      title: "Landlord work",
      desc: "Maintenance, brokerage, paperwork, tenant issues and vacancy risk.",
    },
  ];

  return (
    <section className="bg-white py-[72px] md:py-[96px] border-b border-[#E4E7EF]">
      <div className="max-w-[1180px] w-[92vw] mx-auto">
        {/* Section Header */}
        <div className="max-w-[900px] mx-auto text-center mb-[48px]">
          <div className="inline-flex items-center justify-center gap-2.5 text-[#B00914] uppercase tracking-[0.14em] text-[0.78rem] font-[950] mb-3">
            <span className="w-6 h-[3px] rounded-full bg-[#C6B68A]" />
            WHY THIS MATTERS
          </div>
          <h2 className="font-serif text-[#0B1229] text-[2rem] sm:text-[2.5rem] md:text-[3.1rem] lg:text-[3.5rem] leading-[1.15] font-bold m-0 mt-2">
            Physical real estate looks <br className="hidden sm:inline" /> simple. The experience is not.
          </h2>
          <p className="text-[#3C4656] text-sm md:text-[1.05rem] mt-5 font-light max-w-[760px] mx-auto leading-relaxed">
            Most investors like property for rent and appreciation. But direct ownership often comes with concentration, liquidity and execution issues.
          </p>
        </div>

        {/* 4 Columns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {painPoints.map((item, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-t from-[#FCFAF5] to-white border border-[#E4E7EF] rounded-[24px] p-5 md:p-6 shadow-[0_16px_36px_rgba(11,18,41,0.06)] hover:shadow-[0_22px_45px_rgba(11,18,41,0.09)] hover:-translate-y-1 transition-all duration-300 text-left flex flex-col justify-between min-h-[135px]"
            >
              <div>
                <strong className="block text-[#0B1229] text-[1rem] font-bold mb-2.5 leading-tight">
                  {item.title}
                </strong>
                <p className="text-[#5B6882] text-[0.92rem] md:text-[0.96rem] font-normal leading-relaxed m-0">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

