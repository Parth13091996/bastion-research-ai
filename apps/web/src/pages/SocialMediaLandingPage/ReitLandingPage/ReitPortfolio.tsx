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
          #portfolio .btn-gold-outline {
            background: transparent;
            color: #C6B68A;
            border: 2px solid #C6B68A;
            box-shadow: 0 12px 24px rgba(198, 182, 138, 0.15);
          }
          #portfolio .btn-gold-outline:hover {
            background: #C6B68A;
            color: #0B1229;
            transform: translateY(-2px);
            box-shadow: 0 16px 32px rgba(198, 182, 138, 0.25);
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
                className="btn btn-gold-outline"
                href="https://payments.cashfree.com/forms/REIT_bastionresearch"
                target="_blank"
                rel="noopener noreferrer"
                style={{ marginTop: "12px" }}
              >
                Understand REITs
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
