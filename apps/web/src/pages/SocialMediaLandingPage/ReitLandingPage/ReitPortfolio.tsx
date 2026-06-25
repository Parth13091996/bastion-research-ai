import React from "react";

export default function ReitPortfolio() {
  return (
    <>
      <style>
        {`
          #portfolio {
            --navy: #0B1229;
            --line: #E4E7EF;
            --shadow: 0 20px 50px rgba(11, 18, 41, 0.05);
            padding: 78px 0;
            background: #FBF8F1;
          }
          #portfolio .container {
            max-width: 1180px;
            width: 92vw;
            margin: 0 auto;
            position: relative;
            z-index: 10;
          }
          #portfolio .portfolio-card {
            background: #fff;
            border: 1px solid var(--line);
            border-radius: 38px;
            box-shadow: var(--shadow);
            overflow: hidden;
            display: grid;
            grid-template-columns: 1.05fr 0.75fr;
            max-width: 1180px;
            margin: 0 auto;
          }
          #portfolio .portfolio-left {
            padding: 24px 40px;
            background:
              radial-gradient(circle at 86% 8%, rgba(198, 182, 138, 0.24), transparent 22%),
              linear-gradient(135deg, #fff, #FBF8F1);
            text-align: left;
          }
          #portfolio .portfolio-right {
            padding: 24px 40px;
            background: var(--navy);
            color: #fff;
            display: flex;
            flex-direction: column;
            justify-content: center;
            text-align: left;
          }
          #portfolio .eyebrow {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            color: #B00914;
            text-transform: uppercase;
            letter-spacing: 0.14em;
            font-size: 0.78rem;
            font-weight: 950;
            margin-bottom: 12px;
          }
          #portfolio .eyebrow::before {
            content: "";
            width: 24px;
            height: 3px;
            background-color: #C6B68A;
            border-radius: 9999px;
            display: inline-block;
          }
          #portfolio h2 {
            font-family: Georgia, Cambria, "Times New Roman", Times, serif;
            font-weight: 700;
            font-size: 2.4rem;
            line-height: 1.2;
            color: #0B1229;
            margin: 0 0 10px 0;
          }
          @media (min-width: 768px) {
            #portfolio h2 {
              font-size: 3.6rem;
            }
          }
          #portfolio .muted {
            color: #5B6882;
            font-size: 14px;
            line-height: 1.6;
            margin: 0 0 14px 0;
          }
          @media (min-width: 768px) {
            #portfolio .muted {
              font-size: 16px;
            }
          }
          #portfolio .feature-list {
            display: grid;
            gap: 12px;
            margin-top: 14px;
          }
          #portfolio .feature {
            display: flex;
            gap: 12px;
            align-items: flex-start;
            font-weight: 780;
            font-size: 14px;
            color: #0B1229;
            line-height: 1.5;
          }
          @media (min-width: 768px) {
            #portfolio .feature {
              font-size: 15px;
            }
          }
          #portfolio .feature b {
            color: #B00914;
            font-size: 1.1rem;
            line-height: 1;
            margin-top: 2px;
          }
          #portfolio .portfolio-right h3 {
            color: #fff;
            font-family: Georgia, Cambria, "Times New Roman", Times, serif;
            font-weight: 700;
            font-size: 1.2rem;
            margin: 0 0 6px 0;
          }
          #portfolio .portfolio-right p {
            color: #D9DFEE;
            font-size: 14px;
            line-height: 1.6;
            margin: 0 0 14px 0;
          }
          @media (min-width: 768px) {
            #portfolio .portfolio-right p {
              font-size: 15px;
            }
          }
          #portfolio .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 14px 24px;
            font-weight: 700;
            font-size: 0.95rem;
            border-radius: 9999px;
            text-decoration: none;
            transition: all 0.2s ease;
            cursor: pointer;
            text-align: center;
            border: none;
            width: 100%;
            box-sizing: border-box;
          }
          #portfolio .btn-red {
            background: #B00914;
            color: #fff;
            box-shadow: 0 12px 24px rgba(176, 9, 20, 0.2);
          }
          #portfolio .btn-red:hover {
            background: #C20A15;
            transform: translateY(-2px);
            box-shadow: 0 16px 32px rgba(176, 9, 20, 0.3);
          }
          #portfolio .btn-wa {
            background: #128C7E;
            color: #fff;
            box-shadow: 0 12px 24px rgba(18, 140, 126, 0.2);
          }
          #portfolio .btn-wa:hover {
            background: #149F8F;
            transform: translateY(-2px);
            box-shadow: 0 16px 32px rgba(18, 140, 126, 0.3);
          }
          #portfolio .wa-icon {
            width: 18px;
            height: 18px;
            margin-right: 8px;
            display: inline-block;
            vertical-align: middle;
          }
          @media (max-width: 991px) {
            #portfolio .portfolio-card {
              grid-template-columns: 1fr;
              border-radius: 28px;
            }
            #portfolio .portfolio-left {
              padding: 30px 24px;
            }
            #portfolio .portfolio-right {
              padding: 30px 24px;
            }
          }
        `}
      </style>
      <section id="portfolio">
        <div className="container">
          <div className="portfolio-card">
            <div className="portfolio-left">
              <div className="eyebrow">Bastion Research smallcase</div>
              <h2>Prime Real Estate Income &ndash; REIT Portfolio</h2>
              <p className="muted">
                A curated, research-backed REIT portfolio for investors who want exposure to income-generating real estate through a structured and professionally tracked route.
              </p>
              <div className="feature-list">
                <div className="feature">
                  <b>✓</b>
                  <span>Built from India’s listed REIT universe.</span>
                </div>
                <div className="feature">
                  <b>✓</b>
                  <span>Tracks both income potential and capital appreciation potential.</span>
                </div>
                <div className="feature">
                  <b>✓</b>
                  <span>Reviews operating, valuation, debt and distribution-quality parameters.</span>
                </div>
                <div className="feature">
                  <b>✓</b>
                  <span>Designed for investors who want real estate exposure without the hassle of managing physical real estate.</span>
                </div>
              </div>
            </div>
            <div className="portfolio-right">
              <h3>Next step</h3>
              <p>Explore the smallcase, review the suitability, and evaluate whether REIT exposure fits your portfolio.</p>
              <a
                className="btn btn-red"
                href="https://bastionresearch.smallcase.com/smallcase/BARENM_0001"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open smallcase
              </a>
              <a
                className="btn btn-wa"
                href="https://wa.me/918780507966?text=Hi%20Bastion%20Research%2C%20I%20want%20to%20understand%20the%20Prime%20Real%20Estate%20Income%20REIT%20smallcase%20before%20investing."
                target="_blank"
                rel="noopener noreferrer"
                style={{ marginTop: "12px" }}
              >
                <svg className="wa-icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
                  <path
                    fill="currentColor"
                    d="M16.01 3.2c-7.04 0-12.76 5.72-12.76 12.76 0 2.25.59 4.44 1.72 6.37L3.2 28.8l6.64-1.74a12.7 12.7 0 0 0 6.17 1.57h.01c7.04 0 12.76-5.72 12.76-12.76S23.05 3.2 16.01 3.2Zm0 23.25h-.01c-1.84 0-3.64-.49-5.21-1.42l-.37-.22-3.94 1.03 1.05-3.84-.24-.39a10.5 10.5 0 0 1-1.6-5.65c0-5.7 4.64-10.34 10.35-10.34 2.76 0 5.36 1.08 7.31 3.03a10.27 10.27 0 0 1 3.03 7.31c0 5.7-4.64 10.34-10.36 10.34Zm5.67-7.75c-.31-.16-1.84-.91-2.12-1.01-.29-.1-.5-.16-.71.16-.21.31-.81 1.01-.99 1.22-.18.21-.36.24-.67.08-.31-.16-1.31-.48-2.49-1.53-.92-.82-1.54-1.83-1.72-2.14-.18-.31-.02-.48.14-.64.14-.14.31-.36.47-.54.16-.18.21-.31.31-.52.1-.21.05-.39-.03-.54-.08-.16-.71-1.71-.97-2.34-.26-.62-.52-.54-.71-.55h-.61c-.21 0-.54.08-.83.39-.29.31-1.09 1.06-1.09 2.58 0 1.52 1.12 2.99 1.27 3.2.16.21 2.2 3.36 5.33 4.71.75.32 1.33.52 1.78.66.75.24 1.43.21 1.97.13.6-.09 1.84-.75 2.1-1.48.26-.73.26-1.35.18-1.48-.08-.13-.29-.21-.6-.36Z"
                  />
                </svg>
                Have doubts? WhatsApp us
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
