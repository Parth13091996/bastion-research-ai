import React from "react";

interface ReitFooterProps {
  onScrollTo: (id: string) => void;
}

export default function ReitFooter(props: ReitFooterProps) {
  return (
    <footer className="footer bg-[#070D20] text-white pt-[60px] pb-[70px] text-left">
      <div className="container footer-grid max-w-[1180px] w-[92vw] mx-auto px-4 md:px-0">

        {/* Top Content Row */}
        <div className="flex flex-col md:flex-row md:justify-between items-start gap-[30px] md:gap-[45px] mb-10">

          {/* Footer Left - Brand & SEBI Info */}
          <div className="flex-1 min-w-[280px]">
            <div className="flex items-center gap-[13px] mb-5">
              <img
                src="/media/Bastion-Logo.png"
                alt="Bastion Research"
                className="w-[54px] h-[54px] object-contain block"
              />
              <div className="flex flex-col">
                <strong className="block text-white leading-none tracking-wider font-[950] text-[0.92rem] md:text-[1.1rem]">
                  BASTION RESEARCH
                </strong>
                <span className="block text-white/70 text-[0.72rem] md:text-[0.78rem] mt-[4px] font-medium">
                  Bastion Research House LLP
                </span>
              </div>
            </div>
            <div className="space-y-1.5 text-sm md:text-base text-white font-light leading-relaxed">
              <p>SEBI Registered Research Analyst</p>
              <p>
                SEBI Reg. No: INA000023199 &middot; BSE Enlistment No: 6747
              </p>
            </div>
          </div>

          {/* Footer Right - Questions Call to Action */}
          <div className="flex-1 min-w-[280px] md:max-w-[480px] text-left">
            <h3 className="font-serif text-white text-xl md:text-2xl font-bold mb-2 text-left">
              Questions before investing?
            </h3>
            <p className="text-white text-xs md:text-sm font-light mb-5 leading-relaxed text-left">
              Drop a WhatsApp message and the team will revert soon.
            </p>

            <div className="flex flex-wrap gap-4">

              <a
                href="https://wa.me/918780507966?text=Hi%20Bastion%20Research%2C%20I%20have%20a%20question%20about%20your%20REIT%20smallcase."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-full font-bold text-base bg-[#128C7E] text-white transition-all duration-150 hover:bg-[#149F8F] hover:scale-[1.02] shadow-[0_0_20px_rgba(18,140,126,0.4)] hover:shadow-[0_0_30px_rgba(18,140,126,0.6)] gap-2.5"
              >
                <svg className="w-[20px] h-[20px] fill-current" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
                  <path d="M16.01 3.2c-7.04 0-12.76 5.72-12.76 12.76 0 2.25.59 4.44 1.72 6.37L3.2 28.8l6.64-1.74a12.7 12.7 0 0 0 6.17 1.57h.01c7.04 0 12.76-5.72 12.76-12.76S23.05 3.2 16.01 3.2Zm0 23.25h-.01c-1.84 0-3.64-.49-5.21-1.42l-.37-.22-3.94 1.03 1.05-3.84-.24-.39a10.5 10.5 0 0 1-1.6-5.65c0-5.7 4.64-10.34 10.35-10.34 2.76 0 5.36 1.08 7.31 3.03a10.27 10.27 0 0 1 3.03 7.31c0 5.7-4.64 10.34-10.36 10.34Zm5.67-7.75c-.31-.16-1.84-.91-2.12-1.01-.29-.1-.5-.16-.71.16-.21.31-.81 1.01-.99 1.22-.18.21-.36.24-.67.08-.31-.16-1.31-.48-2.49-1.53-.92-.82-1.54-1.83-1.72-2.14-.18-.31-.02-.48.14-.64.14-.14.31-.36.47-.54.16-.18.21-.31.31-.52.1-.21.05-.39-.03-.54-.08-.16-.71-1.71-.97-2.34-.26-.62-.52-.54-.71-.55h-.61c-.21 0-.54.08-.83.39-.29.31-1.09 1.06-1.09 2.58 0 1.52 1.12 2.99 1.27 3.2.16.21 2.2 3.36 5.33 4.71.75.32 1.33.52 1.78.66.75.24 1.43.21 1.97.13.6-.09 1.84-.75 2.1-1.48.26-.73.26-1.35.18-1.48-.08-.13-.29-.21-.6-.36Z" />
                </svg>
                WhatsApp us
              </a>
            </div>
          </div>

        </div>

        {/* Separator Line */}
        <div className="border-t border-white/20 mt-8 pt-8 font-light text-xs md:text-sm text-white leading-relaxed space-y-4">
          <p>
            <strong>Disclaimer:</strong> Investments in securities are subject to market risks. REITs are listed market instruments and their unit prices, distributions and returns can fluctuate. Past performance is not indicative of future results. This page is for informational and educational purposes only and should not be considered as investment advice or an assurance of returns. Investors should read all related documents carefully, evaluate suitability, and consult their financial advisor before investing. SEBI Registration does not guarantee the accuracy or completeness of any analysis or recommendation.
          </p>
          <p>
            Data points shown are based on publicly available information, company filings/investor presentations and Bastion Research's internal analysis. Figures may change over time and should be independently verified before making an investment decision.
          </p>
        </div>

      </div>
    </footer>
  );
}
