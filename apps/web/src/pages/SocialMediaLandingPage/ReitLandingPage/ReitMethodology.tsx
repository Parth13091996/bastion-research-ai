import React from "react";

export default function ReitMethodology() {
  return (
    <>
      <style>
        {`
          .framework {
            --navy: #0B1229;
            background: var(--navy);
            color: #fff;
            position: relative;
            overflow: hidden;
            padding: 78px 0;
          }
          .framework h2, .framework h3 {
            color: #fff;
            font-family: Georgia, Cambria, "Times New Roman", Times, serif;
            font-weight: 700;
            margin: 10px 0 0 0;
          }
          .framework h2 {
            font-size: 2.2rem;
            line-height: 1.2;
          }
          @media (min-width: 768px) {
            .framework h2 {
              font-size: 3.6rem;
            }
          }
          .framework .muted {
            color: #D7DDED;
            font-size: 14px;
            margin-top: 16px;
            max-width: 700px;
            line-height: 1.6;
          }
          @media (min-width: 768px) {
            .framework .muted {
              font-size: 16px;
            }
          }
          .container {
            max-width: 1180px;
            width: 92vw;
            margin: 0 auto;
            position: relative;
            z-index: 10;
          }
          .section-head.center {
            text-align: center;
            margin-bottom: 30px;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .eyebrow {
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
          .eyebrow::before {
            content: "";
            width: 24px;
            height: 3px;
            background-color: #C6B68A;
            border-radius: 9999px;
            display: inline-block;
          }
          .chips-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin-top: 26px;
            justify-content: center;
          }
          .fw-chip {
            display: inline-block;
            border: 1px solid rgba(255, 255, 255, 0.18);
            background: rgba(255, 255, 255, 0.08);
            color: #fff;
            border-radius: 9999px;
            padding: 10px 20px;
            font-weight: 600;
            font-size: 14px;
            letter-spacing: 0.02em;
            transition: all 0.2s ease;
            cursor: default;
          }
          .fw-chip:hover {
            background: rgba(255, 255, 255, 0.12);
            transform: translateY(-1px);
          }
        `}
      </style>
      <section className="framework">
        <div className="container">
          <div className="section-head center">
            <div className="eyebrow">Research lens</div>
            <h2>Not every REIT is the same.</h2>
            <p className="muted">
              Yield is only the starting point. A REIT portfolio needs operating, valuation, balance sheet and distribution-quality checks.
            </p>
          </div>
          <div className="chips-grid">
            <span className="fw-chip">Occupancy</span>
            <span className="fw-chip">Mark-to-market rental potential</span>
            <span className="fw-chip">Debt / GAV</span>
            <span className="fw-chip">Tenant concentration</span>
            <span className="fw-chip">Sector concentration</span>
            <span className="fw-chip">Price / NAV</span>
            <span className="fw-chip">Distribution quality</span>
            <span className="fw-chip">Sponsor quality</span>
            <span className="fw-chip">Future pipeline</span>
            <span className="fw-chip">Management fees</span>
            <span className="fw-chip">Tax impact</span>
          </div>
        </div>
      </section>
    </>
  );
}

