import React, { useEffect, useState } from "react";

const WebinarPopup: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [aisensyDateLabel, setAisensyDateLabel] = useState<string>("12th July 2026");
  const [aisensyTimeLabel, setAisensyTimeLabel] = useState<string>("11:30 AM onwards");

  useEffect(() => {
    const initPopup = async () => {
      // Remove by 11th July 2026, 6:00 PM IST
      const removalTime = new Date("2026-07-11T18:00:00+05:30").getTime();
      const now = Date.now();

      // Do not display if date has passed
      if (now >= removalTime) {
        return;
      }

      // Do not display if user has already seen the popup (first time visitor only)
      if (localStorage.getItem("br_webinar_popup_seen") === "true") {
        return;
      }

      setIsOpen(true);

      // Allow minor delay for css opacity/scale transitions to run
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 300);

      return () => clearTimeout(timer);
    };

    initPopup();
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("br_webinar_popup_seen", "true");

    // Unmount modal after transition completes
    setTimeout(() => {
      setIsOpen(false);
    }, 300);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            :root {
              --br-red: #9a002f;
              --br-red-2: #d1112a;
              --br-navy: #111d3d;
              --br-navy-2: #17254b;
              --br-white: #ffffff;
              --br-text: #101828;
              --br-muted: #667085;
              --br-border: #e7eaf0;
              --br-bg: #f7f8fb;
            }

            .br-webinar-overlay {
              position: fixed;
              inset: 0;
              z-index: 999999;
              display: grid;
              place-items: center;
              padding: 20px;
              background: rgba(5, 12, 32, .58);
              backdrop-filter: blur(7px);
              -webkit-backdrop-filter: blur(7px);
              opacity: 0;
              visibility: hidden;
              transition: opacity .22s ease, visibility .22s ease;
            }
            .br-webinar-overlay.is-visible {
              opacity: 1;
              visibility: visible;
            }
            .br-webinar-modal {
              width: min(840px, 92vw);
              max-height: calc(100vh - 30px);
              overflow: hidden;
              position: relative;
              border-radius: 24px;
              background: #fff;
              box-shadow: 0 24px 70px rgba(5, 12, 32, .3);
              transform: translateY(18px) scale(.98);
              transition: transform .22s ease;
            }
            .br-webinar-overlay.is-visible .br-webinar-modal {
              transform: translateY(0) scale(1);
            }
            .br-webinar-close {
              position: absolute;
              top: 14px;
              right: 14px;
              z-index: 4;
              width: 36px;
              height: 36px;
              border: 1px solid rgba(255, 255, 255, .25);
              border-radius: 999px;
              background: rgba(17, 29, 61, .74);
              color: #fff;
              font-size: 24px;
              line-height: 1;
              cursor: pointer;
              display: grid;
              place-items: center;
              transition: transform .18s ease, background .18s ease;
            }
            .br-webinar-close:hover {
              background: var(--br-red);
              transform: scale(1.04);
            }
            .br-webinar-grid {
              display: grid;
              grid-template-columns: 1.06fr .94fr;
              min-height: 440px;
            }
            .br-webinar-content {
              padding: 24px 32px;
              display: flex;
              flex-direction: column;
              justify-content: center;
            }
            .br-webinar-logo {
              width: 120px;
              height: auto;
              margin-bottom: 12px;
              display: block;
            }
            .br-webinar-kicker {
              width: fit-content;
              display: inline-flex;
              align-items: center;
              gap: 6px;
              padding: 5px 10px;
              border-radius: 999px;
              background: rgba(154, 0, 47, .09);
              color: var(--br-red);
              font-weight: 900;
              font-size: 11px;
              letter-spacing: .06em;
              text-transform: uppercase;
              margin-bottom: 12px;
            }
            .br-webinar-title {
              margin: 0;
              color: var(--br-navy);
              font-size: clamp(20px, 3vw, 30px);
              line-height: 1.05;
              letter-spacing: -.03em;
              font-weight: 950;
            }
            .br-webinar-title span {
              color: var(--br-red-2);
            }
            .br-webinar-subtitle {
              margin: 10px 0 0;
              color: var(--br-muted);
              font-size: 14px;
              line-height: 1.35;
            }
            .br-webinar-proof {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 10px;
              margin: 16px 0 0;
            }
            .br-proof-card {
              border: 1px solid var(--br-border);
              border-radius: 14px;
              padding: 8px 6px;
              background: #fff;
              box-shadow: 0 6px 16px rgba(17, 29, 61, .04);
            }
            .br-proof-number {
              display: block;
              color: var(--br-red);
              font-size: 18px;
              line-height: 1;
              font-weight: 950;
              letter-spacing: -.02em;
            }
            .br-proof-label {
              display: block;
              color: var(--br-navy);
              font-size: 10px;
              font-weight: 850;
              margin-top: 4px;
              line-height: 1.15;
              text-transform: uppercase;
            }
            .br-webinar-meta {
              display: flex;
              flex-wrap: wrap;
              gap: 10px;
              margin: 16px 0 0;
            }
            .br-meta-pill {
              display: inline-flex;
              align-items: center;
              gap: 6px;
              padding: 6px 10px;
              border-radius: 12px;
              background: #f4f6fb;
              color: var(--br-navy);
              font-size: 12px;
              font-weight: 850;
            }
            .br-meta-pill svg {
              flex: 0 0 auto;
              color: var(--br-red);
            }
            .br-webinar-actions {
              display: flex;
              align-items: center;
              flex-wrap: wrap;
              gap: 12px;
              margin-top: 18px;
            }
            .br-webinar-cta {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              min-height: 42px;
              padding: 0 20px;
              border-radius: 12px;
              border: none;
              background: linear-gradient(135deg, var(--br-red-2), var(--br-red));
              color: #fff;
              font-weight: 950;
              text-decoration: none;
              box-shadow: 0 10px 20px rgba(210, 15, 39, .2);
              transition: transform .18s ease, box-shadow .18s ease;
            }
            .br-webinar-cta:hover {
              transform: translateY(-1px);
              box-shadow: 0 12px 24px rgba(210, 15, 39, .3);
            }
            .br-webinar-secondary {
              color: var(--br-muted);
              font-size: 12px;
              line-height: 1.3;
            }
            .br-disclaimer {
              margin-top: 12px;
              color: #98a2b3;
              font-size: 10px;
              line-height: 1.3;
            }

            .br-webinar-visual {
              position: relative;
              min-height: 440px;
              padding: 24px 20px;
              color: #fff;
              background: linear-gradient(140deg, rgba(17, 29, 61, .97), rgba(86, 0, 33, .92));
              overflow: hidden;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            }
            .br-webinar-visual:before {
              content: "";
              position: absolute;
              inset: 0;
              background: linear-gradient(120deg, transparent 0 24%, rgba(255, 255, 255, .07) 24% 25%, transparent 25% 49%, rgba(255, 255, 255, .055) 49% 50%, transparent 50%), repeating-linear-gradient(90deg, rgba(255, 255, 255, .035) 0 1px, transparent 1px 48px);
              opacity: .75;
            }
            .br-webinar-visual:after {
              content: "";
              position: absolute;
              right: -70px;
              top: -90px;
              width: 270px;
              height: 270px;
              border-radius: 999px;
              background: rgba(210, 15, 39, .38);
              filter: blur(2px);
            }
            .br-big-10x {
              position: relative;
              z-index: 1;
              font-size: clamp(80px, 10vw, 110px);
              line-height: .8;
              font-weight: 1000;
              letter-spacing: -.08em;
              color: #fff;
              text-shadow: 0 24px 50px rgba(0, 0, 0, .26);
              margin-top: 10px;
            }
            .br-big-10x span {
              color: #ff3348;
            }
            .br-chart-line {
              position: absolute;
              left: 16px;
              right: 16px;
              bottom: 110px;
              height: 90px;
              z-index: 1;
              opacity: .95;
            }
            .br-visual-card {
              position: relative;
              z-index: 2;
              padding: 16px 14px;
              border: 1px solid rgba(255, 255, 255, .18);
              border-radius: 14px;
              background: rgba(255, 255, 255, .11);
              backdrop-filter: blur(8px);
              -webkit-backdrop-filter: blur(8px);
            }
            .br-visual-card h3 {
              margin: 0;
              font-size: 16px;
              line-height: 1.1;
              letter-spacing: -.02em;
            }
            .br-visual-card p {
              margin: 4px 0 0;
              color: rgba(255, 255, 255, .78);
              font-size: 12px;
              line-height: 1.4;
            }

            @media (max-width: 820px) {
              .br-webinar-modal {
                overflow-y: auto;
              }
              .br-webinar-grid {
                grid-template-columns: 1fr;
              }
              .br-webinar-visual {
                min-height: 180px;
                order: -1;
                padding: 16px;
              }
              .br-webinar-content {
                padding: 16px 12px;
              }
              .br-webinar-logo {
                width: 100px;
                margin-bottom: 8px;
              }
              .br-webinar-proof {
                grid-template-columns: 1fr;
              }
              .br-big-10x {
                font-size: clamp(60px, 10vw, 90px);
                margin-top: 4px;
              }
              .br-chart-line {
                bottom: 80px;
                height: 70px;
              }
            }
            @media (max-width: 520px) {
              .br-webinar-overlay {
                padding: 10px;
              }
              .br-webinar-modal {
                border-radius: 16px;
                max-height: calc(100vh - 20px);
                overflow-y: auto;
              }
              .br-webinar-title {
                font-size: clamp(18px, 5vw, 24px);
              }
              .br-webinar-actions, .br-webinar-cta {
                width: 100%;
              }
              .br-webinar-cta {
                min-height: 42px;
              }
            }
          `,
        }}
      />

      <section
        id="brWebinarPopup"
        className={`br-webinar-overlay ${isVisible ? "is-visible" : ""}`}
        aria-hidden={!isVisible}
        onClick={handleOverlayClick}
      >
        <div
          className="br-webinar-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="brWebinarTitle"
        >
          <button
            className="br-webinar-close"
            type="button"
            aria-label="Close webinar popup"
            onClick={handleClose}
          >
            &times;
          </button>

          <div className="br-webinar-grid">
            <div className="br-webinar-content">
              <img
                className="br-webinar-logo"
                src="/media/Bastion-Logo.png"
                alt="Bastion Research Logo"
              />
              <div className="br-webinar-kicker">LIVE WEBINAR · INVESTOR EDUCATION</div>
              <h2 className="br-webinar-title" id="brWebinarTitle">
                How to Identify <span>10x Stocks</span> Before They Become Obvious
              </h2>
              <div className="br-webinar-subtitle">
                We studied <strong>710 listed companies over 10 years</strong> to understand what separated 10x winners from the rest.
              </div>

              <div className="br-webinar-proof">
                <div className="br-proof-card">
                  <span className="br-proof-number">710</span>
                  <span className="br-proof-label">LISTED COMPANIES STUDIED</span>
                </div>
                <div className="br-proof-card">
                  <span className="br-proof-number">10Y</span>
                  <span className="br-proof-label">MARKET DATA ANALYSED</span>
                </div>
                <div className="br-proof-card">
                  <span className="br-proof-number">10x</span>
                  <span className="br-proof-label">WINNER FRAMEWORK</span>
                </div>
              </div>

              <div className="br-webinar-meta">
                <div className="br-meta-pill">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  {aisensyDateLabel}
                </div>
                <div className="br-meta-pill">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {aisensyTimeLabel}
                </div>
              </div>

              <div className="br-webinar-actions">
                <a
                  href="https://payments.cashfree.com/forms/10x_stocks?utm_source=substack&utm_medium=email"
                  onClick={handleClose}
                  className="br-webinar-cta"
                >
                  Register Now
                </a>
                <span className="br-webinar-secondary">Live polls · Q&A · Practical framework</span>
              </div>

              <div className="br-disclaimer">
                Investing in securities market is subject to market risks. Read all the related documents carefully before investing.
              </div>
            </div>

            <div className="br-webinar-visual">
              <div className="br-big-10x">
                10<span>X</span>
              </div>

              {/* Dynamic decorative line chart SVG */}
              <svg
                className="br-chart-line"
                viewBox="0 0 300 150"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 130 C 50 120, 70 80, 100 90 C 130 100, 150 40, 180 50 C 210 60, 230 10, 280 15"
                  stroke="#ff3348"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <path
                  d="M10 130 C 50 120, 70 80, 100 90 C 130 100, 150 40, 180 50 C 210 60, 230 10, 280 15 L 280 150 L 10 150 Z"
                  fill="url(#chartGrad)"
                  opacity="0.15"
                />
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff3348" />
                    <stop offset="100%" stopColor="#ff3348" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="br-visual-card">
                <h3>What did past 10x winners have in common?</h3>
                <p>
                  Market-cap hunting ground, entry valuations, future growth, cash flows and dilution — simplified into an actionable framework.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default WebinarPopup;
