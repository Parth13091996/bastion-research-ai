import React, { useEffect } from "react";
import ReitNav from "./ReitNav";
import ReitHero from "./ReitHero";
import ReitPortfolio from "./ReitPortfolio";
import ReitPainPoints from "./ReitPainPoints";
import ReitWhatIs from "./ReitWhatIs";
import ReitSuitability from "./ReitSuitability";
import ReitMyths from "./ReitMyths";

import ReitMethodology from "./ReitMethodology";
import ReitFaq from "./ReitFaq";

import ReitFooter from "./ReitFooter";

export default function ReitLandingPage() {
  // SEO optimization
  useEffect(() => {
    document.title = "REIT smallcase | Prime Real Estate Income | Bastion Research";

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      "content",
      "A/B landing page variant for Bastion Research's Prime Real Estate Income REIT smallcase."
    );

    let themeColor = document.querySelector('meta[name="theme-color"]');
    if (!themeColor) {
      themeColor = document.createElement("meta");
      themeColor.setAttribute("name", "theme-color");
      document.head.appendChild(themeColor);
    }
    themeColor.setAttribute("content", "#0B1229");
  }, []);

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="font-sans text-[#17213C] bg-[#FBF8F1] min-h-screen relative pb-[80px] sm:pb-0 overflow-x-clip selection:bg-[#B00914] selection:text-white">
      <style>
        {`
          .sticky-mobile {
            display: flex;
            position: fixed;
            bottom: 12px;
            left: 12px;
            right: 12px;
            z-index: 90;
            background: #fff;
            border: 1px solid #E4E7EF;
            border-radius: 24px;
            padding: 10px;
            box-shadow: 0 22px 60px rgba(11, 18, 41, 0.28);
            gap: 8px;
          }
          @media (min-width: 640px) {
            .sticky-mobile {
              display: none;
            }
          }
          .sticky-mobile .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 10px 12px;
            font-weight: 900;
            font-size: 0.75rem;
            border-radius: 9999px;
            text-decoration: none;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            transition: all 0.2s ease;
            cursor: pointer;
            text-align: center;
            border: none;
            flex: 1;
            min-height: 44px;
            box-sizing: border-box;
          }
          .sticky-mobile .btn-red {
            background: #B00914;
            color: #fff;
          }
          .sticky-mobile .btn-red:hover {
            background: #C20A15;
            transform: scale(1.02);
          }
          .sticky-mobile .btn-wa {
            background: #128C7E;
            color: #fff;
            gap: 6px;
          }
          .sticky-mobile .btn-wa:hover {
            background: #149F8F;
            transform: scale(1.02);
          }
          .sticky-mobile .wa-icon {
            width: 14px;
            height: 14px;
            fill: currentColor;
            display: inline-block;
            vertical-align: middle;
          }
        `}
      </style>
      {/* Navigation */}
      <ReitNav onScrollTo={handleScrollTo} />

      {/* Hero Header */}
      <ReitHero onScrollTo={handleScrollTo} />

      {/* Main Content */}
      <main>
        {/* Physical Property Pain Points */}
        <ReitPainPoints />

        {/* What is REIT */}
        <ReitWhatIs />

        {/* Suitability Guide */}
        <ReitSuitability />

        {/* Myths Stack */}
        <ReitMyths onScrollTo={handleScrollTo} />


        {/* Methodology Framework */}
        <ReitMethodology />

        {/* REIT Portfolio Card */}
        <ReitPortfolio />

        {/* FAQ Section */}
        <ReitFaq />

      </main>

      {/* Footer */}
      <ReitFooter onScrollTo={handleScrollTo} />

      {/* Sticky Mobile Actions Bar (Width < 640px) */}
      <div className="sticky-mobile" aria-label="Sticky call to action">
        <a
          className="btn btn-red"
          href="https://bastionresearch.smallcase.com/smallcase/BARENM_0001"
          target="_blank"
          rel="noopener noreferrer"
        >
          smallcase
        </a>
        <a
          className="btn btn-wa"
          href="https://wa.me/918780507966?text=Hi%20Bastion%20Research%2C%20I%20have%20a%20question%20about%20your%20REIT%20smallcase."
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg className="wa-icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
            <path
              fill="currentColor"
              d="M16.01 3.2c-7.04 0-12.76 5.72-12.76 12.76 0 2.25.59 4.44 1.72 6.37L3.2 28.8l6.64-1.74a12.7 12.7 0 0 0 6.17 1.57h.01c7.04 0 12.76-5.72 12.76-12.76S23.05 3.2 16.01 3.2Zm0 23.25h-.01c-1.84 0-3.64-.49-5.21-1.42l-.37-.22-3.94 1.03 1.05-3.84-.24-.39a10.5 10.5 0 0 1-1.6-5.65c0-5.7 4.64-10.34 10.35-10.34 2.76 0 5.36 1.08 7.31 3.03a10.27 10.27 0 0 1 3.03 7.31c0 5.7-4.64 10.34-10.36 10.34Zm5.67-7.75c-.31-.16-1.84-.91-2.12-1.01-.29-.1-.5-.16-.71.16-.21.31-.81 1.01-.99 1.22-.18.21-.36.24-.67.08-.31-.16-1.31-.48-2.49-1.53-.92-.82-1.54-1.83-1.72-2.14-.18-.31-.02-.48.14-.64.14-.14.31-.36.47-.54.16-.18.21-.31.31-.52.1-.21.05-.39-.03-.54-.08-.16-.71-1.71-.97-2.34-.26-.62-.52-.54-.71-.55h-.61c-.21 0-.54.08-.83.39-.29.31-1.09 1.06-1.09 2.58 0 1.52 1.12 2.99 1.27 3.2.16.21 2.2 3.36 5.33 4.71.75.32 1.33.52 1.78.66.75.24 1.43.21 1.97.13.6-.09 1.84-.75 2.1-1.48.26-.73.26-1.35.18-1.48-.08-.13-.29-.21-.6-.36Z"
            />
          </svg>
          WhatsApp
        </a>
      </div>
    </div>
  );
}
