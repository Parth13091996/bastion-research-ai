import React from "react";

interface ReitMythsProps {
  onScrollTo?: (id: string) => void;
}

export default function ReitMyths({ onScrollTo }: ReitMythsProps) {
  return (
    <section id="myths" className="py-[78px] bg-[#FBF8F1]">
      <div className="max-w-[1180px] w-[92vw] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[290px_1fr] gap-[26px] items-start text-left">
          {/* Myths Sidebar */}
          <aside className="lg:sticky lg:top-[98px] bg-[#0B1229] text-white rounded-[30px] p-6 shadow-[0_24px_70px_rgba(11,18,41,0.16)] w-full">
            <h3 className="text-white text-[1.7rem] leading-tight mb-2.5 font-bold font-serif">
              Most REIT mistakes start with one wrong comparison.
            </h3>
            <p className="text-[#D9DFEE] text-sm leading-relaxed mb-4 font-light">
              Investors compare REITs with FDs. The better lens is physical real estate: rent, occupancy, asset value, tenant quality, debt and valuation.
            </p>
            <a
              className="w-full inline-flex items-center justify-center min-h-[44px] px-4 rounded-full bg-white text-[#0B1229] font-black text-xs uppercase tracking-wider hover:translate-y-[-2px] transition-all duration-200 mt-2 text-center"
              href="https://bastionresearch.smallcase.com/smallcase/BARENM_0001"
              target="_blank"
              rel="noopener"
            >
              Explore smallcase →
            </a>
          </aside>

          {/* Myths Stack */}
          <div className="grid gap-[18px] w-full">
            {/* Myth 1 */}
            <div className="bg-white border border-[#E4E7EF] rounded-[30px] shadow-[0_20px_50px_rgba(11,18,41,0.05)] overflow-hidden">
              <div className="p-[20px_22px] bg-gradient-to-r from-white to-[#FBF8F1] border-b border-[#E4E7EF] flex gap-[14px] items-center">
                <span className="w-[44px] h-[44px] flex-[0_0_auto] rounded-[15px] grid place-items-center bg-[#B00914] text-white font-serif font-black text-[1.35rem]">
                  1
                </span>
                <h3 className="font-serif text-[#0B1229] text-[1.1rem] md:text-[1.25rem] font-bold leading-tight m-0">
                  “REITs do not give capital appreciation.”
                </h3>
              </div>
              <div className="p-[22px] text-left">
                <span className="inline-flex bg-[#FEF0F1] text-[#B00914] rounded-full px-3 py-1 font-bold text-[0.74rem] mb-3">
                  Reality: Total return has two parts.
                </span>
                <p className="text-[#0B1229] text-sm md:text-[0.95rem] leading-relaxed m-0">
                  REIT return is not only distribution yield. It is distributions plus unit price / NAV growth over time.
                </p>

                {/* Formula Box */}
                <div className="my-4 py-4 px-6 bg-[#0B1229] rounded-[20px] text-white text-center font-bold text-sm sm:text-base leading-relaxed">
                  Total REIT Return = <span className="text-[#E5BA73]">Cash Distributions</span> + <span className="text-[#E5BA73]">Unit Price / NAV Growth</span>
                </div>

                {/* Return Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 my-[14px]">
                  <div className="bg-[#FBF8F1] border border-[#E4E7EF] rounded-[18px] p-3 text-center shadow-[0_8px_20px_rgba(11,18,41,0.03)]">
                    <strong className="block text-[#B00914] font-serif text-[1.55rem] font-black leading-none">20.1%</strong>
                    <span className="block mt-2 text-[0.78rem] text-[#0B1229] font-extrabold leading-tight">Nexus Select Trust</span>
                  </div>
                  <div className="bg-[#FBF8F1] border border-[#E4E7EF] rounded-[18px] p-3 text-center shadow-[0_8px_20px_rgba(11,18,41,0.03)]">
                    <strong className="block text-[#B00914] font-serif text-[1.55rem] font-black leading-none">19.0%</strong>
                    <span className="block mt-2 text-[0.78rem] text-[#0B1229] font-extrabold leading-tight">Knowledge Realty Trust</span>
                  </div>
                  <div className="bg-[#FBF8F1] border border-[#E4E7EF] rounded-[18px] p-3 text-center shadow-[0_8px_20px_rgba(11,18,41,0.03)]">
                    <strong className="block text-[#B00914] font-serif text-[1.55rem] font-black leading-none">12.9%</strong>
                    <span className="block mt-2 text-[0.78rem] text-[#0B1229] font-extrabold leading-tight">Mindspace Business Parks</span>
                  </div>
                  <div className="bg-[#FBF8F1] border border-[#E4E7EF] rounded-[18px] p-3 text-center shadow-[0_8px_20px_rgba(11,18,41,0.03)]">
                    <strong className="block text-[#B00914] font-serif text-[1.55rem] font-black leading-none">10.9%</strong>
                    <span className="block mt-2 text-[0.78rem] text-[#0B1229] font-extrabold leading-tight">Embassy Office Parks</span>
                  </div>
                  <div className="bg-[#FBF8F1] border border-[#E4E7EF] rounded-[18px] p-3 text-center shadow-[0_8px_20px_rgba(11,18,41,0.03)]">
                    <strong className="block text-[#B00914] font-serif text-[1.55rem] font-black leading-none">10.0%</strong>
                    <span className="block mt-2 text-[0.78rem] text-[#0B1229] font-extrabold leading-tight">Brookfield India REIT</span>
                  </div>
                </div>
                <p className="text-[0.78rem] text-[#7A849A] mt-2">
                  Data as of June 2026. Historical returns are not indicative of future returns.
                </p>
              </div>
            </div>

            {/* Myth 2 */}
            <div className="bg-white border border-[#E4E7EF] rounded-[30px] shadow-[0_20px_50px_rgba(11,18,41,0.05)] overflow-hidden">
              <div className="p-[20px_22px] bg-gradient-to-r from-white to-[#FBF8F1] border-b border-[#E4E7EF] flex gap-[14px] items-center">
                <span className="w-[44px] h-[44px] flex-[0_0_auto] rounded-[15px] grid place-items-center bg-[#B00914] text-white font-serif font-black text-[1.35rem]">
                  2
                </span>
                <h3 className="font-serif text-[#0B1229] text-[1.1rem] md:text-[1.25rem] font-bold leading-tight m-0">
                  “REITs should be compared with fixed deposits.”
                </h3>
              </div>
              <div className="p-[22px] text-left">
                <span className="inline-flex bg-[#FEF0F1] text-[#B00914] rounded-full px-3 py-1 font-bold text-[0.74rem] mb-3">
                  Reality: Compare REITs with physical real estate.
                </span>

                <div className="overflow-x-auto border border-[#E4E7EF] rounded-[22px] bg-white">
                  <table className="w-full border-collapse min-w-[620px]">
                    <thead>
                      <tr>
                        <th className="bg-[#0B1229] text-white text-left p-[15px] font-serif text-[1.05rem] font-bold">Wrong lens</th>
                        <th className="bg-[#0B1229] text-white text-left p-[15px] font-serif text-[1.05rem] font-bold">Right lens</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border-t border-[#E4E7EF] p-[15px] align-top text-sm text-[#0B1229] font-black">REIT vs Fixed Deposit</td>
                        <td className="border-t border-[#E4E7EF] p-[15px] align-top text-sm text-[#0B1229] leading-relaxed">REIT vs Physical real estate</td>
                      </tr>
                      <tr>
                        <td className="border-t border-[#E4E7EF] p-[15px] align-top text-sm text-[#0B1229] font-black">FD gives fixed income but no asset ownership upside.</td>
                        <td className="border-t border-[#E4E7EF] p-[15px] align-top text-sm text-[#0B1229] leading-relaxed">REITs give ownership exposure to income-generating real estate.</td>
                      </tr>
                      <tr>
                        <td className="border-t border-[#E4E7EF] p-[15px] align-top text-sm text-[#0B1229] font-black">Focus becomes only headline yield.</td>
                        <td className="border-t border-[#E4E7EF] p-[15px] align-top text-sm text-[#0B1229] leading-relaxed">Focus becomes occupancy, rent growth, debt, NAV, tenant quality and total return.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Myth 3 */}
            <div className="bg-white border border-[#E4E7EF] rounded-[30px] shadow-[0_20px_50px_rgba(11,18,41,0.05)] overflow-hidden">
              <div className="p-[20px_22px] bg-gradient-to-r from-white to-[#FBF8F1] border-b border-[#E4E7EF] flex gap-[14px] items-center">
                <span className="w-[44px] h-[44px] flex-[0_0_auto] rounded-[15px] grid place-items-center bg-[#B00914] text-white font-serif font-black text-[1.35rem]">
                  3
                </span>
                <h3 className="font-serif text-[#0B1229] text-[1.1rem] md:text-[1.25rem] font-bold leading-tight m-0">
                  “Physical real estate always appreciates better.”
                </h3>
              </div>
              <div className="p-[22px] text-left">
                <span className="inline-flex bg-[#FEF0F1] text-[#B00914] rounded-full px-3 py-1 font-bold text-[0.74rem] mb-3">
                  Reality: Appreciation should be checked with data, not nostalgia.
                </span>
                <p className="text-[#68738C] text-sm md:text-[0.95rem] font-light leading-relaxed mb-3">
                  Residential property appreciation across major Indian cities has broadly been in the 5%–10% annualised range over long periods. REITs also participate in underlying real estate value creation over time, though each REIT is different.
                </p>
                <p className="text-[#17213C] text-sm md:text-[0.95rem] leading-relaxed mt-3">
                  <b className="font-extrabold text-[#0B1229]">The real question:</b> if long-term appreciation can be broadly comparable, why take landlord hassle, concentration risk and low liquidity?
                </p>
              </div>
            </div>

            {/* Myth 4 */}
            <div className="bg-white border border-[#E4E7EF] rounded-[30px] shadow-[0_20px_50px_rgba(11,18,41,0.05)] overflow-hidden">
              <div className="p-[20px_22px] bg-gradient-to-r from-white to-[#FBF8F1] border-b border-[#E4E7EF] flex gap-[14px] items-center">
                <span className="w-[44px] h-[44px] flex-[0_0_auto] rounded-[15px] grid place-items-center bg-[#B00914] text-white font-serif font-black text-[1.35rem]">
                  4
                </span>
                <h3 className="font-serif text-[#0B1229] text-[1.1rem] md:text-[1.25rem] font-bold leading-tight m-0">
                  “REITs are only for income, not growth.”
                </h3>
              </div>
              <div className="p-[22px] text-left">
                <span className="inline-flex bg-[#FEF0F1] text-[#B00914] rounded-full px-3 py-1 font-bold text-[0.74rem] mb-3">
                  Reality: REITs can combine income, inflation hedge and growth.
                </span>

                <div className="overflow-x-auto border border-[#E4E7EF] rounded-[22px] bg-white">
                  <table className="w-full border-collapse min-w-[620px]">
                    <thead>
                      <tr>
                        <th className="bg-[#0B1229] text-white text-left p-[15px] font-serif text-[1.05rem] font-bold">Asset Class</th>
                        <th className="bg-[#0B1229] text-white text-left p-[15px] font-serif text-[1.05rem] font-bold">Stable Income</th>
                        <th className="bg-[#0B1229] text-white text-left p-[15px] font-serif text-[1.05rem] font-bold">Inflation Hedge</th>
                        <th className="bg-[#0B1229] text-white text-left p-[15px] font-serif text-[1.05rem] font-bold">Growth</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border-t border-[#E4E7EF] p-[15px] align-top text-sm text-[#0B1229] font-black">Equities</td>
                        <td className="border-t border-[#E4E7EF] p-[15px] align-top text-sm text-[#0B1229] leading-relaxed">Usually no</td>
                        <td className="border-t border-[#E4E7EF] p-[15px] align-top text-sm text-[#0B1229] leading-relaxed">Yes</td>
                        <td className="border-t border-[#E4E7EF] p-[15px] align-top text-sm text-[#0B1229] leading-relaxed">Yes</td>
                      </tr>
                      <tr>
                        <td className="border-t border-[#E4E7EF] p-[15px] align-top text-sm text-[#0B1229] font-black">Fixed Income</td>
                        <td className="border-t border-[#E4E7EF] p-[15px] align-top text-sm text-[#0B1229] leading-relaxed">Yes</td>
                        <td className="border-t border-[#E4E7EF] p-[15px] align-top text-sm text-[#0B1229] leading-relaxed">No</td>
                        <td className="border-t border-[#E4E7EF] p-[15px] align-top text-sm text-[#0B1229] leading-relaxed">No</td>
                      </tr>
                      <tr>
                        <td className="border-t border-[#E4E7EF] p-[15px] align-top text-sm text-[#0B1229] font-black">Commodities</td>
                        <td className="border-t border-[#E4E7EF] p-[15px] align-top text-sm text-[#0B1229] leading-relaxed">No</td>
                        <td className="border-t border-[#E4E7EF] p-[15px] align-top text-sm text-[#0B1229] leading-relaxed">Yes</td>
                        <td className="border-t border-[#E4E7EF] p-[15px] align-top text-sm text-[#0B1229] leading-relaxed">No regular cash flow</td>
                      </tr>
                      <tr>
                        <td className="border-t border-[#E4E7EF] p-[15px] align-top text-sm text-[#0B1229] font-black">REITs</td>
                        <td className="border-t border-[#E4E7EF] p-[15px] align-top text-sm text-[#0B1229] leading-relaxed">Yes</td>
                        <td className="border-t border-[#E4E7EF] p-[15px] align-top text-sm text-[#0B1229] leading-relaxed">Potentially yes, via capital appreciation</td>
                        <td className="border-t border-[#E4E7EF] p-[15px] align-top text-sm text-[#0B1229] leading-relaxed">Potentially yes, via rent escalation</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

