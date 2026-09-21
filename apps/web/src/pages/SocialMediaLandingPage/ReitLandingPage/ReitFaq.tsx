import React from "react";

export default function ReitFaq() {
  return (
    <>
      <style>
        {`
          #faq {
            padding: 80px 0;
            background: #fff;
            border-bottom: 1px solid #E4E7EF;
          }
          #faq .container {
            max-width: 1180px;
            width: 92vw;
            margin: 0 auto;
            position: relative;
            z-index: 10;
          }
          #faq .section-head.center {
            text-align: center;
            margin-bottom: 40px;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          #faq .eyebrow {
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
          #faq .eyebrow::before {
            content: "";
            width: 24px;
            height: 3px;
            background-color: #C6B68A;
            border-radius: 9999px;
            display: inline-block;
          }
          #faq h2 {
            font-family: Georgia, Cambria, "Times New Roman", Times, serif;
            font-weight: 700;
            font-size: 2.2rem;
            line-height: 1.2;
            color: #0B1229;
            margin: 10px 0 0 0;
          }
          @media (min-width: 768px) {
            #faq h2 {
              font-size: 3.6rem;
            }
          }
          #faq .myth-stack {
            display: grid;
            gap: 16px;
            max-width: 1180px;
            margin: 0 auto;
            width: 100%;
          }
          #faq details.card {
            background: #fff;
            border: 1px solid #E4E7EF;
            border-radius: 38px; /* High border-radius matching portfolio-card */
            padding: 20px 32px;
            box-shadow: 0 12px 35px rgba(11, 18, 41, 0.03);
            text-align: left;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            overflow: hidden;
          }
          #faq details.card[open] {
            box-shadow: 0 15px 40px rgba(11, 18, 41, 0.05);
            border-color: #C6B68A;
          }
          #faq summary {
            cursor: pointer;
            font-family: Georgia, Cambria, "Times New Roman", Times, serif;
            font-size: 1.05rem;
            font-weight: 700;
            color: #0B1229;
            user-select: none;
            outline: none;
            list-style: none; /* Hide default arrow */
            display: flex;
            align-items: center;
            gap: 14px;
          }
          #faq summary::-webkit-details-marker {
            display: none; /* Hide default WebKit arrow */
          }
          #faq details.card summary svg.faq-arrow {
            width: 14px;
            height: 14px;
            transition: transform 0.2s ease;
            transform: rotate(0deg);
            flex-shrink: 0;
          }
          #faq details.card[open] summary svg.faq-arrow {
            transform: rotate(90deg);
          }
          #faq summary b {
            font-weight: 700;
          }
          #faq .muted {
            color: #5B6882;
            font-size: 0.95rem;
            line-height: 1.6;
            margin: 0;
            padding-left: 28px; /* Align answer content with the question text (14px arrow + 14px gap) */
          }
          @media (max-width: 640px) {
            #faq details.card {
              border-radius: 28px;
              padding: 16px 20px;
            }
            #faq summary {
              font-size: 0.95rem;
              gap: 10px;
            }
            #faq details.card summary svg.faq-arrow {
              width: 12px;
              height: 12px;
            }
            #faq .muted {
              font-size: 0.88rem;
              padding-left: 22px; /* Align answer content (12px arrow + 10px gap) */
            }
          }
        `}
      </style>
      <section id="faq">
        <div className="container">
          <div className="section-head center">
            <div className="eyebrow">FAQ</div>
            <h2>Still thinking?</h2>
          </div>
          <div className="myth-stack">
            <details className="card" open>
              <summary>
                <svg className="faq-arrow" width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 5V19L19 12L8 5Z" fill="#0B1229" />
                </svg>
                <b>Are REITs like fixed deposits?</b>
              </summary>
              <p className="muted" style={{ marginTop: "12px" }}>
                No. REITs are listed, market-linked ownership units of income-generating real estate. Fixed deposits are fixed income products.
              </p>
            </details>
            <details className="card">
              <summary>
                <svg className="faq-arrow" width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 5V19L19 12L8 5Z" fill="#0B1229" />
                </svg>
                <b>Do REITs only give yield?</b>
              </summary>
              <p className="muted" style={{ marginTop: "12px" }}>
                No. Total return comes from distributions plus change in unit price / NAV over time.
              </p>
            </details>
            <details className="card">
              <summary>
                <svg className="faq-arrow" width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 5V19L19 12L8 5Z" fill="#0B1229" />
                </svg>
                <b>What exactly does the smallcase do?</b>
              </summary>
              <p className="muted" style={{ marginTop: "12px" }}>
                It provides a curated REIT model portfolio selected and tracked by Bastion Research using parameters like occupancy, tenant concentration, debt/GAV, price/NAV, distribution quality, sponsor strength and development pipeline.
              </p>
            </details>
            <details className="card">
              <summary>
                <svg className="faq-arrow" width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 5V19L19 12L8 5Z" fill="#0B1229" />
                </svg>
                <b>How are REIT distributions taxed?</b>
              </summary>
              <p className="muted" style={{ marginTop: "12px" }}>
                REIT distributions can come in three forms: interest, dividend and capital repayment. Interest is generally taxed at the investor’s slab rate. Dividend can be exempt or taxable depending on the SPV’s tax regime. Capital repayment is not taxed as income immediately; it reduces the cost of acquisition. Capital gains on listed REIT units are taxed separately when units are sold.
              </p>
            </details>
            <details className="card">
              <summary>
                <svg className="faq-arrow" width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 5V19L19 12L8 5Z" fill="#0B1229" />
                </svg>
                <b>Are returns guaranteed?</b>
              </summary>
              <p className="muted" style={{ marginTop: "12px" }}>
                No. REITs are listed market instruments. Unit prices, distributions and returns can fluctuate.
              </p>
            </details>
            <details className="card">
              <summary>
                <svg className="faq-arrow" width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 5V19L19 12L8 5Z" fill="#0B1229" />
                </svg>
                <b>I still have a question. What should I do?</b>
              </summary>
              <p className="muted" style={{ marginTop: "12px" }}>
                Click the WhatsApp button and send your question. Team Bastion Research will revert soon.
              </p>
            </details>
          </div>
        </div>
      </section>
    </>
  );
}
