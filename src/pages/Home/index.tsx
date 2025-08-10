import React, { useState, useEffect, useRef } from "react";
import Footer from "@/components/generic/Footer";
import Header from "@/components/generic/Header";
import MainBanner from "@/files/main-banner.svg";
import mainPageImage from "@/files/main-page-textimage.svg";
import { CheckCircle, ArrowRight, BookOpen, FileText } from "lucide-react";

const TRANSITION_MS = 500;

const Home = () => {
  const tabs = [
    {
      title: "Research Ally",
      type: "DIY Individual",
      bullets: [
        "I am a seasoned investor responsible for the financial position of the company.",
        "I am looking for healthcare research and technology to improve my health and wellbeing.",
        "I want a team who can work as an external researcher on our own."
      ],
      button: {
        text: "Book a Call",
        icon: <ArrowRight size={16} />
      },
      start: "#6366F1",
      end: "#7C3AED"
    },
    {
      title: "Bastion Core",
      type: "Non-DIY Traduction",
      bullets: [
        "I have time to go through quality research output",
        "I have a good judgement of taking investment decisions",
        "I enjoy short kicking losses on quality inputs"
      ],
      buttons: [
        {
          text: "Book a Call",
          icon: <ArrowRight size={16} />
        },
        {
          text: "View Sample Research",
          icon: <FileText size={16} />
        },
        {
          text: "Subscribe Now",
          icon: <BookOpen size={16} />
        }
      ],
      start: "#10B981",
      end: "#0D9488"
    },
    {
      title: "Qualified Investor",
      type: "DTV Traduction",
      bullets: [
        "I want to take research located in/real market decision.",
        "I don't want to spend time sending research.",
        "I don't want to speculate.",
        "I need professional help with portfolio creation."
      ],
      button: {
        text: "View Portfolios",
        icon: <ArrowRight size={16} />
      },
      start: "#F59E0B",
      end: "#F97316"
    }
  ];

  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [tabPos, setTabPos] = useState({ x: 50, y: 50 });
  const [activeTab, setActiveTab] = useState(0);
  const activeTabRef = useRef(activeTab);
  const [isHovered, setIsHovered] = useState(false);
  const [interactionCount, setInteractionCount] = useState(0);

  const [isLayerAActive, setIsLayerAActive] = useState(true);
  const [layerA, setLayerA] = useState({ start: tabs[0].start, end: tabs[0].end });
  const [layerB, setLayerB] = useState(null);
  const [visibleA, setVisibleA] = useState(true);
  const [visibleB, setVisibleB] = useState(false);

  const intervalRef = useRef(null);
  const transitionTimeoutRef = useRef(null);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  const handleTabChange = (index, opts = { fromAutoplay: false }) => {
    if (index === activeTab) return;

    const prevLayerAActive = isLayerAActive;

    const next = tabs[index];

    if (prevLayerAActive) {
      setLayerB({ start: next.start, end: next.end });
      setVisibleB(true);
      setVisibleA(false);
      setIsLayerAActive(false);
    } else {
      setLayerA({ start: next.start, end: next.end });
      setVisibleA(true);
      setVisibleB(false);
      setIsLayerAActive(true);
    }

    setActiveTab(index);

    if (!opts.fromAutoplay) setInteractionCount((c) => c + 1);

    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    transitionTimeoutRef.current = setTimeout(() => {
      if (prevLayerAActive) {
        setLayerA(null);
        setVisibleA(false);
      } else {
        setLayerB(null);
        setVisibleB(false);
      }
    }, TRANSITION_MS + 40);
  };

  useEffect(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (!isHovered) {
        const nextIndex = (activeTabRef.current + 1) % tabs.length;
        handleTabChange(nextIndex, { fromAutoplay: true });
      }
    }, 7000);

    return () => clearInterval(intervalRef.current);
  }, [isHovered, interactionCount]);

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    };
  }, []);

  const handleMouseMove = (e) => {
    if (tabSectionRef.current) {
      const { left, top, width, height } = tabSectionRef.current.getBoundingClientRect();
      const x = ((e.clientX - left) / width) * 100;
      const y = ((e.clientY - top) / height) * 100;
      setTabPos({ x, y });
    }
  };

  const tabSectionRef = useRef(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex flex-col">
      <main className="flex-grow">
        <section
          className="relative bg-[#1B2852] w-full min-h-[300px] md:min-h-[500px] flex items-center justify-center overflow-hidden"
          onMouseMove={(e) => {
            const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
            const x = ((e.clientX - left) / width) * 100;
            const y = ((e.clientY - top) / height) * 100;
            setPos({ x, y });
          }}
        >
          <div className="absolute inset-0">
            <div
              className="absolute inset-0 opacity-20 transition-transform duration-300"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
                transform: `translate(${(pos.x - 50) / 20}px, ${(pos.y - 50) / 20}px)`,
              }}
            />
            <div
              className="absolute inset-0 opacity-20 transition-transform duration-300"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
                transform: `translate(${(pos.x - 50) / 10}px, ${(pos.y - 50) / 10}px)`,
              }}
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(circle at ${pos.x}% ${pos.y}%, rgba(255,255,255,0.08), transparent 40%)`,
              }}
            />
          </div>

          <div className="w-full max-w-7xl mx-auto px-6 md:px-8 relative z-10">
            <img
              src={MainBanner}
              alt="Research Banner"
              className="absolute right-0 top-1/2 -translate-y-1/2 h-auto w-full md:w-[55%] object-contain pointer-events-none z-0"
            />
            <div className="relative z-10 max-w-[700px]">
              <div className="absolute inset-0 bg-[#1B2852]/80 md:hidden -z-10 rounded-lg" />
              <h1 className="text-white text-2xl md:text-[4rem] font-semibold leading-snug drop-shadow-md">
                Maximizing Your <br className="hidden sm:block" />
                Research Quality <br className="hidden sm:block" />
                Per Unit Of Stress
              </h1>
            </div>
          </div>
        </section>

        <section
          className="relative w-full py-16 overflow-hidden"
          onMouseMove={handleMouseMove}
          ref={tabSectionRef}
        >
          <div className="absolute inset-0 pointer-events-none">
            {layerA && (
              <div
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out`
                }
                style={{
                  background: `linear-gradient(135deg, ${layerA.start}, ${layerA.end})`,
                  opacity: visibleA ? 1 : 0,
                }}
              />
            )}

            {layerB && (
              <div
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out`
                }
                style={{
                  background: `linear-gradient(135deg, ${layerB.start}, ${layerB.end})`,
                  opacity: visibleB ? 1 : 0,
                }}
              />
            )}

            <div
              className="absolute inset-0 transition-opacity duration-500 pointer-events-none"
              style={{
                background: `radial-gradient(circle at ${tabPos.x}% ${tabPos.y}%, rgba(255,255,255,0.06), transparent 60%)`,
                mixBlendMode: 'overlay',
                opacity: 0.9,
              }}
            />

            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(45deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0) 100%)',
              }}
            />
          </div>

          <div
            className="relative w-full max-w-4xl mx-auto z-10 transition-all duration-500"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="flex justify-center gap-0 mb-0">
              {tabs.map((tab, index) => {
                const isActive = index === activeTab;
                return (
                  <button
                    key={index}
                    onClick={() => handleTabChange(index)}
                    className={`px-6 py-3 font-medium rounded-t-lg border border-white/20 relative transition-all duration-300 ${
                      isActive ? '-mb-px z-30 border-b-0 shadow-lg' : 'z-20 bg-transparent hover:bg-white/10'
                    }`}
                    style={
                      isActive
                        ? { backgroundImage: `linear-gradient(90deg, ${tab.start}, ${tab.end})`, color: '#fff' }
                        : { color: 'rgba(255,255,255,0.95)' }
                    }
                  >
                    {tab.type}
                  </button>
                );
              })}
            </div>

            <div className="relative">
              <div className="rounded-b-xl border border-white/20 bg-transparent shadow-2xl p-8 min-h-[400px] flex flex-col backdrop-blur-sm">
                <div className="mb-4">
                  <span className="text-sm font-medium text-white/80">{tabs[activeTab].type}</span>
                  <h2 className="text-3xl font-bold text-white mt-1">{tabs[activeTab].title}</h2>
                </div>

                <div className="flex-grow">
                  <ul className="space-y-3 mb-8">
                    {tabs[activeTab].bullets.map((bullet, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircle className="flex-shrink-0 h-5 w-5 text-white mt-0.5 mr-3" />
                        <span className="text-white/90">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex justify-center gap-4 mt-auto">
                  {tabs[activeTab].buttons ? (
                    tabs[activeTab].buttons.map((button, idx) => (
                      <button
                        key={idx}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                          idx === 0
                            ? 'bg-white text-black hover:bg-white/90 shadow-lg'
                            : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/20 shadow-md'
                        }`}
                      >
                        {button.text}
                        {button.icon}
                      </button>
                    ))
                  ) : (
                    <button className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium bg-white text-[#C9122D] hover:bg-white/90 transition-all duration-300 shadow-lg">
                      {tabs[activeTab].button.text}
                      {tabs[activeTab].button.icon}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
