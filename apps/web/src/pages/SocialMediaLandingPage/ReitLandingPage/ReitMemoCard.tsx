import React from "react";

export default function ReitMemoCard() {
  return (
    <div className="bg-[#F7F9FC] text-[#17213C] rounded-[34px] p-7 shadow-[0_24px_70px_rgba(11,18,41,0.12)] border border-[#E4E7EF] max-w-[475px] mx-auto lg:mx-0 w-full text-left animate-gpu">
      {/* Header */}
      <div className="flex justify-between items-center gap-[18px] pb-4 border-b border-[#E4E7EF]/85 mb-5">
        <span className="text-[#0B1229] text-[1.2rem] font-bold">Why REITs?</span>
        <span className="text-[#B00914] bg-[#FEF2F2] px-3.5 py-1.5 rounded-full text-[0.78rem] font-bold">
          Scan first
        </span>
      </div>

      {/* List Stack */}
      <div className="flex flex-col gap-4 mb-5">
        {/* Item 1 */}
        <div className="bg-white border border-[#E4E7EF] rounded-[22px] p-5 shadow-[0_4px_20px_rgba(11,18,41,0.02)] flex items-start gap-4">
          <div className="flex items-center justify-center w-[30px] h-[30px] rounded-full bg-[#B00914] text-white shrink-0 mt-0.5">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <div>
            <h4 className="text-[#0B1229] text-[1.05rem] font-bold m-0 leading-tight">
              Real estate exposure
            </h4>
            <p className="text-[#68738C] text-[0.9rem] leading-relaxed mt-2 m-0 font-medium">
              Participate in income-generating commercial assets without buying an entire property.
            </p>
          </div>
        </div>

        {/* Item 2 */}
        <div className="bg-white border border-[#E4E7EF] rounded-[22px] p-5 shadow-[0_4px_20px_rgba(11,18,41,0.02)] flex items-start gap-4">
          <div className="flex items-center justify-center w-[30px] h-[30px] rounded-full bg-[#B00914] text-white shrink-0 mt-0.5">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <div>
            <h4 className="text-[#0B1229] text-[1.05rem] font-bold m-0 leading-tight">
              No landlord workload
            </h4>
            <p className="text-[#68738C] text-[0.9rem] leading-relaxed mt-2 m-0 font-medium">
              No tenant calls, maintenance follow-ups, registration work or vacancy management.
            </p>
          </div>
        </div>

        {/* Item 3 */}
        <div className="bg-white border border-[#E4E7EF] rounded-[22px] p-5 shadow-[0_4px_20px_rgba(11,18,41,0.02)] flex items-start gap-4">
          <div className="flex items-center justify-center w-[30px] h-[30px] rounded-full bg-[#B00914] text-white shrink-0 mt-0.5">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <div>
            <h4 className="text-[#0B1229] text-[1.05rem] font-bold m-0 leading-tight">
              Income + appreciation lens
            </h4>
            <p className="text-[#68738C] text-[0.9rem] leading-relaxed mt-2 m-0 font-medium">
              Evaluate REITs through total return, not only headline yield.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Navy Banner */}
      <div className="bg-[#0B1229] text-white rounded-[22px] p-5 text-center font-bold text-[1.02rem] leading-snug shadow-inner">
        <span className="text-white">REIT Return</span> ={" "}
        <span className="text-[#C6B68A]">
          Distributions + Capital <br /> Appreciation
        </span>
      </div>
    </div>
  );
}
