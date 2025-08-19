import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import BackgroundShapes from "../../components/generic/framer-motion.tsx";

// Brand colors
const NAVY = "#1C2852";
const MAROON = "#C00000";

const tabs = [
  { key: "qualified", label: "Qualified Investor" },
  { key: "diy", label: "DIY Individual" },
  { key: "non_diy", label: "Non-DIY Individual" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

export default function LandingPage() {
  const [active, setActive] = useState<TabKey>("qualified");
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const activeIndex = tabs.findIndex((t) => t.key === active);

  useEffect(() => {
    if (paused) return;

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          const nextIndex = (activeIndex + 1) % tabs.length;
          setActive(tabs[nextIndex].key);
          return 0;
        }
        return prev + 100 / (4 * 20);
      });
    }, 50);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active, paused, activeIndex]);

  useEffect(() => {
    setProgress(0);
  }, [active]);

  return (
    <>
      <BackgroundShapes />
      <div className="relative min-h-screen">
        <div className="relative ">
          <div className="overflow-hidden" style={{ color: NAVY }}>
            <div className="h-full w-full flex flex-col max-w-6xl mx-auto px-6 py-5 relative">
              {/* Hero copy with enhanced styling */}
              <motion.section
                className="mt-8 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-3xl md:text-5xl font-semibold leading-tight mx-auto max-w-4xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                  Maximizing Your Research Quality Per Unit of Stress
                </h1>
                <p className="mt-4 text-base md:text-lg opacity-80 max-w-3xl mx-auto">
                  All investing is intelligent investing if it's based on
                  informed judgement and not speculation
                </p>
              </motion.section>

              {/* Enhanced tabbed card */}
              <motion.section
                className="mt-6 flex-1"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div
                  className="h-full w-full rounded-3xl shadow-2xl border overflow-hidden bg-white/90 backdrop-blur-sm flex flex-col"
                  style={{ borderColor: "#E6E6E6" }}
                  onMouseEnter={() => setPaused(true)}
                  onMouseLeave={() => setPaused(false)}
                >
                  {/* Enhanced progress bar */}
                  <div className="h-1 w-full bg-gray-200 relative overflow-hidden">
                    <motion.div
                      className="h-full"
                      style={{
                        background: `linear-gradient(90deg, ${NAVY}, ${MAROON})`,
                      }}
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

                  {/* Enhanced tab bar */}
                  <div className="relative">
                    <div className="grid grid-cols-3 text-sm md:text-base select-none">
                      {tabs.map((t) => (
                        <motion.button
                          key={t.key}
                          type="button"
                          onClick={() => setActive(t.key)}
                          className={`py-4 md:py-5 px-4 font-medium transition focus:outline-none focus-visible:ring-2 hover:bg-[rgba(28,40,82,0.06)] relative`}
                          style={{
                            color: active === t.key ? MAROON : NAVY,
                            opacity: active === t.key ? 1 : 0.85,
                          }}
                          aria-selected={active === t.key}
                          role="tab"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {t.label}
                        </motion.button>
                      ))}
                    </div>
                    <motion.div
                      className="absolute bottom-0 left-0 h-1 rounded"
                      style={{
                        background: `linear-gradient(90deg, ${MAROON}, ${NAVY})`,
                      }}
                      initial={false}
                      animate={{
                        width: `${100 / 3}%`,
                        x: `${100 * activeIndex}%`,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
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
                              "Quarterly result explainers you'll actually read",
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

                  {/* Enhanced CTA buttons */}
                  {active === "qualified" && (
                    <motion.div
                      className="p-5 text-center border-t flex justify-center gap-4 flex-wrap"
                      style={{ borderColor: "rgba(28,40,82,0.12)" }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <motion.button
                        className="px-5 py-2.5 rounded-xl font-medium shadow-sm border"
                        style={{
                          background: `linear-gradient(135deg, ${MAROON}, ${MAROON}dd)`,
                          color: "white",
                          borderColor: MAROON,
                        }}
                        whileHover={{
                          scale: 1.05,
                          boxShadow: "0 10px 25px rgba(192,0,0,0.3)",
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Request a Call
                      </motion.button>
                      <motion.button
                        className="px-5 py-2.5 rounded-xl font-medium shadow-sm border"
                        style={{
                          background: `linear-gradient(135deg, ${MAROON}, ${MAROON}dd)`,
                          color: "white",
                          borderColor: MAROON,
                        }}
                        whileHover={{
                          scale: 1.05,
                          boxShadow: "0 10px 25px rgba(192,0,0,0.3)",
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Download Product Note
                      </motion.button>
                    </motion.div>
                  )}

                  {active === "diy" && (
                    <motion.div
                      className="p-5 text-center border-t flex justify-center gap-4 flex-wrap"
                      style={{ borderColor: "rgba(28,40,82,0.12)" }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {[
                        "Request a Call",
                        "Access Research",
                        "Subscribe Now",
                      ].map((text, i) => (
                        <motion.button
                          key={text}
                          className="px-5 py-2.5 rounded-xl font-medium shadow-sm border"
                          style={{
                            background: `linear-gradient(135deg, ${MAROON}, ${MAROON}dd)`,
                            color: "white",
                            borderColor: MAROON,
                          }}
                          whileHover={{
                            scale: 1.05,
                            boxShadow: "0 10px 25px rgba(192,0,0,0.3)",
                          }}
                          whileTap={{ scale: 0.95 }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 + i * 0.1 }}
                        >
                          {text}
                        </motion.button>
                      ))}
                    </motion.div>
                  )}

                  {active === "non_diy" && (
                    <motion.div
                      className="p-5 text-center border-t flex justify-center gap-4 flex-wrap"
                      style={{ borderColor: "rgba(28,40,82,0.12)" }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <motion.button
                        className="px-5 py-2.5 rounded-xl font-medium shadow-sm border"
                        style={{
                          background: `linear-gradient(135deg, ${MAROON}, ${MAROON}dd)`,
                          color: "white",
                          borderColor: MAROON,
                        }}
                        whileHover={{
                          scale: 1.05,
                          boxShadow: "0 10px 25px rgba(192,0,0,0.3)",
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        View Product Page
                      </motion.button>
                      <motion.button
                        className="px-5 py-2.5 rounded-xl font-medium shadow-sm border"
                        style={{
                          background: `linear-gradient(135deg, ${MAROON}, ${MAROON}dd)`,
                          color: "white",
                          borderColor: MAROON,
                        }}
                        whileHover={{
                          scale: 1.05,
                          boxShadow: "0 10px 25px rgba(192,0,0,0.3)",
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Subscribe Portfolio
                      </motion.button>
                    </motion.div>
                  )}
                </div>
              </motion.section>

              <footer className="pt-4 text-xs opacity-60 text-center relative">
                © {new Date().getFullYear()} Bastion Research. All rights
                reserved.
              </footer>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Panel({ title, bullets }: { title: string; bullets: string[] }) {
  return (
    <motion.div
      className="flex-1 min-w-[260px] border rounded-2xl p-5 md:p-6 flex flex-col shadow-[0_10px_30px_rgba(28,40,82,0.08)] backdrop-blur-sm"
      style={{
        borderColor: "#E6E6E6",
        background: `linear-gradient(135deg, ${NAVY}, ${NAVY}f0)`,
        color: "white",
      }}
      whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(28,40,82,0.15)" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center gap-3">
        <motion.div
          className="h-1.5 w-8 rounded-full"
          style={{ background: `linear-gradient(90deg, white, ${MAROON})` }}
          whileHover={{ scaleX: 1.2 }}
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
          <motion.li
            key={i}
            className="pl-5 relative"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <motion.span
              className="absolute left-0 top-2 h-2 w-2 rounded-full"
              style={{ background: MAROON }}
              whileHover={{ scale: 1.5 }}
            />
            {b}
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}
