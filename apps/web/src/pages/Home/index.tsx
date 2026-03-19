import { AnimatePresence, motion, AnimatePresenceProps } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import BackgroundShapes from "../../components/generic/framer-motion.tsx";
import SignUpForm from "../Register/SignupForm.tsx";

const NAVY = "#1C2852";
const MAROON = "#C00000";

const tabs = [
  { key: "qualified", label: "Fund Manager / Family Office" },
  { key: "diy", label: "DIY Individual Investor" },
  { key: "non_diy", label: "Effortless Investor" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

// ===== Countdown Component (revamped with animations & true center) =====

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => { ref.current = value }, [value]);
  return ref.current;
}

function useCountdown(targetDate: Date) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const tick = () => setNow(new Date());
    const interval = 1000;
    const id = setInterval(tick, interval);
    return () => clearInterval(id);
  }, [targetDate]);

  const diff = targetDate.getTime() - now.getTime();
  const negative = diff < 0;
  const d = Math.max(0, Math.floor(diff / (24 * 60 * 60 * 1000)));
  const h = Math.max(0, Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)));
  const m = Math.max(0, Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000)));
  const s = Math.max(0, Math.floor((diff % (60 * 1000)) / 1000));
  const oneDayLeft = diff <= 24 * 60 * 60 * 1000 && !negative;
  return { days: d, hours: h, minutes: m, seconds: s, oneDayLeft, negative };
}

// Single animated timer digit (with nice vertical swipe for each change)
function AnimatedTimerDigit({ value }: { value: number | string }) {
  // Convert to string, pad with zero to always 2 chars (should work for all values except days, which can be >99)
  const strValue = typeof value === "number"
    ? value.toString().padStart(2, "0")
    : value;

  // Key each digit so that both digits animate independently
  return (
    <span className="inline-flex">
      {strValue.split("").map((digit, i) => (
        <motion.span
          key={digit + "-" + i}
          className="min-w-[1ch] block"
          initial={{ y: -24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 16,
          }}
          style={{
            display: "inline-block"
          }}
        >
          {digit}
        </motion.span>
      ))}
    </span>
  );
}

// Animated timer block
function CountdownAnimatedBlock({
  value,
  prevValue,
  label,
}: {
  value: number;
  prevValue?: number;
  label: string;
}) {
  // If days go triple digit, 3 digits will animate, else always 2
  const displayValue = value.toString().padStart(2, "0");

  return (
    <div className="flex flex-col items-center px-2 md:px-3">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.div
          key={value}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{
            duration: 0.35,
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
          className="text-2xl md:text-3xl font-mono font-bold text-[#881a1a] bg-gradient-to-br from-[#fff6] to-[#eadc] px-3 py-1.5 rounded-lg shadow-lg border border-[#fff8]"
          style={{
            letterSpacing: 1.5,
            minWidth: label === "days" ? "2.8ch" : "2ch",
            userSelect: "none",
          }}
        >
          {displayValue}
        </motion.div>
      </AnimatePresence>
      <span className="block text-xs md:text-sm mt-1 font-medium uppercase text-[#911b1b] tracking-wider opacity-80">
        {label}
      </span>
    </div>
  );
}

const LAUNCH_DATE = new Date("2026-03-20T00:00:00+05:30");

function LaunchCountdown() {
  const { days, hours, minutes, seconds, negative } = useCountdown(LAUNCH_DATE);

  // Store previous values for animation direction (optional enhancement)
  const prev = {
    days: usePrevious(days),
    hours: usePrevious(hours),
    minutes: usePrevious(minutes),
    seconds: usePrevious(seconds),
  };

  if (negative) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          color: MAROON,
          fontSize: "1.2rem",
          fontWeight: 600,
          letterSpacing: 1,
        }}
      >
        🎉 Now Launched!
      </motion.div>
    );
  }

  // Center the timer feature both vertically and horizontally within the parent container!
  return (
    <div
      className="flex flex-col items-center justify-center w-full h-full py-6 z-10"
      style={{
        minHeight: "220px", // ensures some space for timer block
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.33, type: "spring", damping: 26 }}
      >
        <div className="mb-4 text-center">
          <span
            className="text-base md:text-lg font-medium"
            style={{
              color: MAROON,
              letterSpacing: 1,
              fontWeight: 600,
            }}
          >
            🚀 <span className="opacity-90">Launching March 20, 2024</span>
          </span>
        </div>
        <div
          className="flex flex-row justify-center items-end gap-2 md:gap-4 px-2 py-2 bg-[#fff8] rounded-lg shadow-md border border-[#fff7] backdrop-blur-md"
        >
          <CountdownAnimatedBlock value={days} prevValue={prev.days} label="days" />
          <motion.span className="text-lg md:text-2xl text-[#910] font-mono font-bold px-0.5 select-none">:</motion.span>
          <CountdownAnimatedBlock value={hours} prevValue={prev.hours} label="hours" />
          <motion.span className="text-lg md:text-2xl text-[#910] font-mono font-bold px-0.5 select-none">:</motion.span>
          <CountdownAnimatedBlock value={minutes} prevValue={prev.minutes} label="mins" />
          <motion.span className="text-lg md:text-2xl text-[#910] font-mono font-bold px-0.5 select-none">:</motion.span>
          <CountdownAnimatedBlock value={seconds} prevValue={prev.seconds} label="secs" />
        </div>
      </motion.div>
    </div>
  );
}

// ===== /Countdown Component (revamped) =====

export default function LandingPage() {
  const [active, setActive] = useState<TabKey>("qualified");
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);

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

  // pdf download functionality
  const PDF_URL = "/media/Research-Ally-Product-Note-BRH.pdf";
  const downloadPdf = async (filename = "Research-Ally-Product-Note-BRH.pdf") => {
    try {
      const res = await fetch(PDF_URL, { cache: "no-cache" });
      if (!res.ok) throw new Error("Network response was not ok");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      window.open(PDF_URL, "_blank");
    }
  };

  // Function to open popup browser
  const openPopup = (url: string) => {
    const width = 800;
    const height = 500;
    const left = 20;
    const top = 10;
    window.open(
      url,
      "PopupWindow",
      `width=${width},height=${height},top=${top},left=${left},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
    );
  };

  // For blur management
  const { negative } = useCountdown(LAUNCH_DATE);

  return (
    <>
      <BackgroundShapes />
      <div
        className="relative min-h-screen"
        developer-info={"1e4c65ec691efe38b034fc2fcbbd9824"}
      >
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
                    Which type of Investor are you ?
                  </div>
                  <p className="mb-4 p-2 text-base md:text-lg opacity-80 max-w-3xl mx-auto items-center text-center">
                    We’ve built different Bastion products for different kinds
                    of investors. Pick the profile that feels closest to you and
                    see what’s a fit.
                  </p>

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
                  <div className="flex-1 p-5 md:p-8 overflow-hidden flex flex-col justify-center relative">
                    {/* --- Centered Countdown for "Effortless Investor" tab --- */}
                    {active === "non_diy" && (
                      <LaunchCountdown />
                    )}

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
                            title="Product Suitability"
                            bullets={[
                              "I take independent allocation decisions",
                              "I need high-quality, bespoke equity research",
                              "I manage public or family money",
                              "I want a full-stack research partner",
                            ]}
                          />
                          <Panel
                            title="Product Features"
                            bullets={[
                              "End-to-end research solutions: from idea generation to allocation support",
                              "Access to fresh investment ideas",
                              "Ongoing maintenance research on covered names",
                              "Knowledge transfer (business understanding + data packs)",
                              "Analyst access across multiple sectors",
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
                            title="Product Suitability"
                            bullets={[
                              "I want to invest with quality research at the core",
                              "I have time to read serious and decision-useful research",
                              "I am willing to learn and track the businesses I invest in",
                              "I want expert handholding, not tips and noise",
                              "I think in 3–5 year horizons",
                            ]}
                          />
                          <Panel
                            title="Product Features"
                            bullets={[
                              "Business understanding notes (clear, in-depth breakdowns)",
                              "Regular company updates and quarterly reports",
                              "Access to our Scratchpad (near-miss ideas with reasons)",
                              "IPO notes on interesting listings",
                              "Discounted access to Adaptive Quality portfolios",
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
                          className={`h-full flex flex-col md:flex-row gap-6${negative ? "" : " blur-sm"}`}
                        >
                          <Panel
                            title="Product Suitability"
                            bullets={[
                              "I want research-backed investing without the heavy lifting",
                              "I don’t have time to read reports or track businesses",
                              "I prefer ready-to-execute portfolios with a 3–5 year view",
                            ]}
                          />
                          <Panel
                            title="Product Features"
                            bullets={[
                              "Curated, execution-ready portfolios matched to your risk appetite",
                              {
                                text: "Portfolio choices:",
                                sublist: [
                                  "Adaptive Quality (Techno-Funda)",
                                  "Triple Edge (Quant-based)",
                                  "ETF Optimiser (Smart ETF investing)",
                                ],
                              },
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
                        onClick={() => window.location.href = "/contact-us"}
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
                        onClick={() => downloadPdf()}
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
                        { label: "Bastion CORE", href: "/bastion-core" },
                        { label: "Access Research", action: () => setIsSignUpOpen(true) },
                        { label: "Subscribe Now", action: () => setIsSignUpOpen(true) },
                      ].map((item, i) => (
                        <motion.button
                          key={item.label}
                          aria-label={item.label}
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
                          onClick={() =>
                            item.action ? item.action() : (window.location.href = item.href!)
                          }
                        >
                          {item.label}
                        </motion.button>
                      ))}

                    </motion.div>
                  )}


                  {active === "non_diy" && (
                    <div className={`${negative ? "" : "blur-sm pointer-events-none"}`}>
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
                          onClick={() => openPopup("/coming-soon")}
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
                          onClick={() => openPopup("/coming-soon")}
                        >
                          Subscribe Portfolio
                        </motion.button>
                      </motion.div>
                    </div>
                  )}
                </div>
              </motion.section>

              <footer className="pt-4 text-lg opacity-60 text-center items-center relative">
                Don’t fit neatly into these categories? You can still join in.{" "}
                <a href="/contact-us" className="underline">
                  Contact us
                </a>
                <br />
                Read our free newsletters and watch our podcast (Made in India),
                deep dives into India’s most fascinating companies and their
                untold stories.
              </footer>
            </div>
          </div>
        </div>
      </div>
      {isSignUpOpen && (
        <SignUpForm
          isOpen={isSignUpOpen}
          onClose={() => setIsSignUpOpen(false)}
        />
      )}
    </>
  );
}

type BulletItem = string | { text: string; sublist: string[] };

function Panel({ title, bullets }: { title: string; bullets: BulletItem[] }) {
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
        {bullets.map((item, index) =>
          typeof item === "string" ? (
            <motion.li
              key={index}
              className="pl-5 relative"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <motion.span
                className="absolute left-0 top-2 h-2 w-2 rounded-full"
                style={{ background: MAROON }}
                whileHover={{ scale: 1.5 }}
              />
              {item}
            </motion.li>
          ) : (
            <motion.li
              key={index}
              className="pl-5 relative"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <motion.span
                className="absolute left-0 top-2 h-2 w-2 rounded-full"
                style={{ background: MAROON }}
                whileHover={{ scale: 1.5 }}
              />
              {item.text}
              <ul className="list-disc ml-6 mt-1 space-y-1">
                {item.sublist.map((sub, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + i * 0.05 }}
                  >
                    {sub}
                  </motion.li>
                ))}
              </ul>
            </motion.li>
          )
        )}
      </ul>
    </motion.div>
  );
}
