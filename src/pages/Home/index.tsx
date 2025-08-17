import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Brand colors
const NAVY = "#1C2852";
const MAROON = "#C00000";

const tabs = [
  { key: "qualified", label: "Qualified Investor" },
  { key: "diy", label: "DIY Individual" },
  { key: "non_diy", label: "Non-DIY Individual" },
] as const;

type TabKey = typeof tabs[number]["key"];

export default function LandingPage() {
  const [active, setActive] = useState<TabKey>("qualified");
  const [progress, setProgress] = useState(0); // progress % for bar
  const [paused, setPaused] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const activeIndex = tabs.findIndex((t) => t.key === active);

  // auto switch logic
  useEffect(() => {
    if (paused) return;

    // progress runs in small steps
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // move to next tab when full
          const nextIndex = (activeIndex + 1) % tabs.length;
          setActive(tabs[nextIndex].key);
          return 0; // reset
        }
        return prev + 100 / (4 * 20); // 20 steps per second → 4s total
      });
    }, 50); // update every 50ms

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active, paused, activeIndex]);

  // reset progress whenever tab changes
  useEffect(() => {
    setProgress(0);
  }, [active]);

  return (
    <div
      className="overflow-hidden bg-white"
      style={{ color: NAVY }}
    >
      <div className="h-full w-full flex flex-col max-w-6xl mx-auto px-6 py-5 relative">

        {/* Hero copy */}
        <section className="mt-8 text-center">
          <h1 className="text-3xl md:text-5xl font-semibold leading-tight mx-auto max-w-4xl">
            Maximizing Your Research Quality Per Unit of Stress
          </h1>
          <p className="mt-4 text-base md:text-lg opacity-80 max-w-3xl mx-auto">
            All investing is intelligent investing if it’s based on informed judgement and not speculation
          </p>
        </section>

        {/* Body: Tabbed card */}
        <section className="mt-6 flex-1">
          <div
            className="h-full w-full rounded-3xl shadow-xl border overflow-hidden bg-white flex flex-col"
            style={{ borderColor: "#E6E6E6" }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {/* Progress bar */}
            <div className="h-1 w-full bg-gray-200 relative overflow-hidden">
              <motion.div
                className="h-full"
                style={{ background: NAVY }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "linear", duration: 0.05 }}
              />
            </div>

            {/* Prompt */}
            <div
              className="px-6 py-4 text-center font-semibold text-xl md:text-2xl"
              style={{ color: "black" }}
            >
              What type of Investor are you?
            </div>

            {/* Tab bar */}
            <div className="relative">
              <div className="grid grid-cols-3 text-sm md:text-base select-none">
                {tabs.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setActive(t.key)}
                    className={`py-4 md:py-5 px-4 font-medium transition focus:outline-none focus-visible:ring-2 hover:bg-[rgba(28,40,82,0.06)]`}
                    style={{
                      color: active === t.key ? MAROON : NAVY,
                      opacity: active === t.key ? 1 : 0.85,
                    }}
                    aria-selected={active === t.key}
                    role="tab"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <motion.div
                className="absolute bottom-0 left-0 h-1 rounded"
                style={{ background: MAROON }}
                initial={false}
                animate={{
                  width: `${100 / 3}%`,
                  x: `${100 * activeIndex}%`,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
              <div
                className="absolute inset-x-0 bottom-0 h-px"
                style={{ background: "rgba(28,40,82,0.15)" }}
              />
            </div>

            {/* Content area */}
            <div className="flex-1 p-5 md:p-8 overflow-hidden">
              <AnimatePresence mode="wait">
                {active === "qualified" && (
                  <motion.div
                    key="qualified"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="h-full flex flex-col md:flex-row gap-6"
                  >
                    <Panel
                      title="Institutional-Grade Coverage"
                      bullets={[
                        "Deep dives built for CIOs, PMs, and analysts",
                        "Source-first: filings, transcripts, and on-ground checks",
                        "Actionable scenarios with base/bull/bear valuations",
                      ]}
                    />
                    <Panel
                      title="What You Get"
                      bullets={[
                        "Weekly notes + event-driven briefs",
                        "Allocator-ready models & tear sheets",
                        "Priority access for management Q&A",
                      ]}
                    />
                  </motion.div>
                )}

                {active === "diy" && (
                  <motion.div
                    key="diy"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="h-full flex flex-col md:flex-row gap-6"
                  >
                    <Panel
                      title="For Self-Directed Investors"
                      bullets={[
                        "Plain-English breakdowns of complex businesses",
                        "Templates for thesis, risk, and exit rules",
                        "Curated learning paths for 30 minutes a week",
                      ]}
                    />
                    <Panel
                      title="Tools Included"
                      bullets={[
                        "Idea checklists & red-flag scanner",
                        "Quarterly result explainers you’ll actually read",
                        "Workspace to track positions & catalysts",
                      ]}
                    />
                  </motion.div>
                )}

                {active === "non_diy" && (
                  <motion.div
                    key="non_diy"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="h-full flex flex-col md:flex-row gap-6"
                  >
                    <Panel
                      title="Hands-Off, High-Conviction"
                      bullets={[
                        "Model portfolios with disciplined risk controls",
                        "Clear rationale for every add/trim/exit",
                        "Quarterly calls to align goals & risk",
                      ]}
                    />
                    <Panel
                      title="White-Glove Experience"
                      bullets={[
                        "Concise updates—no jargon, no noise",
                        "Access to our research vault on demand",
                        "Dedicated point of contact",
                      ]}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* CTA buttons */}
            {active === "qualified" && (
              <div
                className="p-5 text-center border-t flex justify-center gap-4 flex-wrap"
                style={{ borderColor: "rgba(28,40,82,0.12)" }}
              >
                <button
                  className="px-5 py-2.5 rounded-xl font-medium shadow-sm border"
                  style={{
                    background: MAROON,
                    color: "white",
                    borderColor: MAROON,
                  }}
                >
                  Request a Call
                </button>
                <button
                  className="px-5 py-2.5 rounded-xl font-medium shadow-sm border"
                  style={{
                    background: MAROON,
                    color: "white",
                    borderColor: MAROON,
                  }}
                >
                  Download Product Note
                </button>
              </div>
            )}

            {active === "diy" && (
              <div
                className="p-5 text-center border-t flex justify-center gap-4 flex-wrap"
                style={{ borderColor: "rgba(28,40,82,0.12)" }}
              >
                <button
                  className="px-5 py-2.5 rounded-xl font-medium shadow-sm border"
                  style={{
                    background: MAROON,
                    color: "white",
                    borderColor: MAROON,
                  }}
                >
                  Request a Call
                </button>
                <button
                  className="px-5 py-2.5 rounded-xl font-medium shadow-sm border"
                  style={{
                    background: MAROON,
                    color: "white",
                    borderColor: MAROON,
                  }}
                >
                  Access Research
                </button>
                <button
                  className="px-5 py-2.5 rounded-xl font-medium shadow-sm border"
                  style={{
                    background: MAROON,
                    color: "white",
                    borderColor: MAROON,
                  }}
                >
                  Subscribe Now
                </button>
              </div>
            )}

            {active === "non_diy" && (
              <div
                className="p-5 text-center border-t flex justify-center gap-4 flex-wrap"
                style={{ borderColor: "rgba(28,40,82,0.12)" }}
              >
                <button
                  className="px-5 py-2.5 rounded-xl font-medium shadow-sm border"
                  style={{
                    background: MAROON,
                    color: "white",
                    borderColor: MAROON,
                  }}
                >
                  View Product Page
                </button>
                <button
                  className="px-5 py-2.5 rounded-xl font-medium shadow-sm border"
                  style={{
                    background: MAROON,
                    color: "white",
                    borderColor: MAROON,
                  }}
                >
                  Subscribe Portfolio
                </button>
              </div>
            )}
          </div>
        </section>

        <footer className="pt-4 text-xs opacity-60 text-center">
          © {new Date().getFullYear()} Bastion Research. All rights reserved.
        </footer>
      </div>
    </div>
  );
}

function Panel({ title, bullets }: { title: string; bullets: string[] }) {
  return (
    <div
      className="flex-1 min-w-[260px] border rounded-2xl p-5 md:p-6 flex flex-col shadow-[0_10px_30px_rgba(28,40,82,0.08)]"
      style={{ borderColor: "#E6E6E6", background: NAVY, color: "white" }}
    >
      <div className="flex items-center gap-3">
        <div
          className="h-1.5 w-8 rounded-full"
          style={{ background: `linear-gradient(90deg, white, ${MAROON})` }}
        />
        <h3
          className="text-lg md:text-xl font-semibold"
          style={{ color: "white" }}
        >
          {title}
        </h3>
      </div>
      <ul className="mt-3 space-y-2 text-sm md:text-base leading-relaxed">
        {bullets.map((b, i) => (
          <li key={i} className="pl-5 relative">
            <span
              className="absolute left-0 top-2 h-2 w-2 rounded-full"
              style={{ background: MAROON }}
            />
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}
