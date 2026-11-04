import { motion } from "framer-motion";
import Lottie from "lottie-react";
import React, { useRef, useState } from "react";
import BackgroundShapes from "../../components/generic/framer-motion.tsx";
import TeamProfile from "./TeamProfile";

// Import your Lottie JSON files
import adaptiveQualityAnim from "@/../public/media/adaptiveQuality.json";
import bastionCoreAnim from "@/../public/media/bastionCore.json";
import researchAllyAnim from "@/../public/media/researchAlly.json";

const About: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const headerRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);

      const firstChild = scrollRef.current.firstElementChild as HTMLElement | null;
      const itemWidth = (firstChild?.clientWidth || clientWidth / 2) + 24;
      const index = Math.round(scrollLeft / itemWidth);
      setActiveIndex(Math.min(Math.max(0, index), services.length - 1));
    }
  };

  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const firstChild = scrollRef.current.firstElementChild as HTMLElement | null;
      const scrollAmount = (firstChild?.clientWidth || 300) + 24;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const scrollToIndex = (index: number) => {
    if (scrollRef.current) {
      const firstChild = scrollRef.current.firstElementChild as HTMLElement | null;
      const scrollAmount = (firstChild?.clientWidth || 300) + 24;
      scrollRef.current.scrollTo({
        left: index * scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const renderCard = (service: (typeof services)[0], className?: string) => (
    <div
      key={service.id}
      className={`flex flex-col p-6 sm:p-8 rounded-2xl text-center border-2 border-gray-200 bg-white shadow-md hover:shadow-lg transition-all ${className || ""}`}
    >
      <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-4 flex items-center justify-center">
        <Lottie animationData={service.lottie} loop autoplay />
      </div>
      <h3 className="text-xl font-bold mb-3 text-blue-900">
        {service.title}
      </h3>
      <p className="text-sm leading-relaxed text-gray-600 flex-grow">
        {service.description}
      </p>
    </div>
  );

  const services = [
    {
      id: "research-ally",
      lottie: researchAllyAnim,
      title: "Research Ally",
      description:
        "Custom research for institutions, fund managers, and family offices who need deep dives and execution-ready ideas.",
    },
    {
      id: "bastion-core",
      lottie: bastionCoreAnim,
      title: "Bastion CORE",
      description:
        "A subscription platform for individual investors. Access high-quality company research, stock ideas, quarterly updates, and our Scratch Pad of useful learnings.",
    },
    {
      id: "adaptive-quality",
      lottie: adaptiveQualityAnim,
      title: "Adaptive Quality",
      description:
        "Ready-to-execute model portfolios for investors who prefer to let our framework guide their investments.",
    },
  ];

  // Handle mouse movement for cursor light effect
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (headerRef.current) {
      const rect = headerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMousePosition({ x, y });
    }
  };

  // Split text effect for heading
  const splitText = "About Us".split("");

  return (
    <div className="bg-white text-gray-800 font-sans leading-relaxed">
      {/* Header with grid + interactive cursor */}
      <header
        ref={headerRef}
        className="relative bg-gradient-to-br from-[#1C2852] to-[#1C2852] text-white py-16 text-center overflow-hidden"
        onMouseMove={handleMouseMove}
      >
        {/* Interactive cursor light effect */}
        <div
          className="absolute pointer-events-none transition-all duration-300 ease-out opacity-20"
          style={{
            left: `${mousePosition.x}%`,
            top: `${mousePosition.y}%`,
            width: "300px",
            height: "300px",
            background: `radial-gradient(circle, rgba(255,255,255,0.25) 0%, transparent 70%)`,
            transform: "translate(-50%, -50%)",
            filter: "blur(30px)",
          }}
        />

        <div className="container mx-auto px-8 relative z-10">
          <motion.h1
            className="text-6xl font-bold mb-4 flex justify-center gap-1"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.05 } },
            }}
          >
            {splitText.map((char, i) => (
              <motion.span
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.5 }}
              >
                {char}
              </motion.span>
            ))}
          </motion.h1>
        </div>
      </header>

      <div className="relative z-10">
        <BackgroundShapes />

        {/* Team profiles */}
        <TeamProfile />

        {/* Section 1 */}
        <section className="py-20">
          <div className="container mx-auto px-8 max-w-7xl">
            <h2 className="text-4xl font-bold text-blue-900 mb-12 text-center">
              Investing with Clarity and Conviction
            </h2>
            <div className="text-xl leading-relaxed">
              <p className="mb-6">
                At Bastion Research, we believe good investing shouldn't be
                reserved for those with big teams and endless hours to research.
                Every investor, whether managing a family office or their own
                savings deserves access to honest, in-depth research that makes
                decisions clearer and more confident.
              </p>
              <p className="mb-8">
                We're a boutique equity research firm focused exclusively on
                Indian listed companies. Our work supports a wide spectrum of
                investors:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="pt-4 border-t-4 border-red-600 shadow-md rounded-md p-4">
                  <strong className="text-blue-900 text-lg block mb-2">
                    Institutions, fund managers, and family offices
                  </strong>
                  <span className="text-gray-700">
                    who rely on us for sharp, independent insights.
                  </span>
                </div>

                <div className="pt-4 border-t-4 border-red-600 shadow-md rounded-md p-4">
                  <strong className="text-blue-900 text-lg block mb-2">
                    Individual investors
                  </strong>
                  <span className="text-gray-700">
                    who want to take charge of their wealth with the same
                    quality of research the pros use.
                  </span>
                </div>
              </div>

              <p className="mt-8">
                What ties it all together is our philosophy: rigorous research,
                presented in a way that makes sense and helps you act. From
                digging into annual reports to speaking with industry experts,
                we put in the hard work so you don't have to.
              </p>
            </div>
          </div>
        </section>



        {/* Section 2 - Responsive: Mobile (vertical), Tablet (2-card horizontal scroll), Desktop (3-card grid) */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-8 max-w-6xl">
            <h2 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-4 text-center">
              Research Built Around You
            </h2>
            <p className="text-center text-base sm:text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
              No matter the size of your portfolio or how you manage it, we've
              built offerings to meet you where you are:
            </p>

            <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl">
              {/* Mobile View (< 768px): Vertical Stack */}
              <div className="block md:hidden space-y-6">
                {services.map((service) => renderCard(service, "w-full"))}
              </div>

              {/* Tablet View (768px - 1024px): 2 cards with horizontal scroll */}
              <div className="hidden md:block lg:hidden">
                <div
                  ref={scrollRef}
                  onScroll={checkScroll}
                  className="flex gap-6 overflow-x-auto pb-4 pt-2 px-1 scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                >
                  {services.map((service) =>
                    renderCard(service, "flex-none snap-start w-[calc(50%-12px)]")
                  )}
                </div>

                {/* Pagination Dots (Tablet Only) */}
                <div className="flex justify-center items-center gap-2 mt-4">
                  {services.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => scrollToIndex(idx)}
                      className={`h-2 rounded-full transition-all ${
                        activeIndex === idx
                          ? "w-7 bg-blue-900"
                          : "w-2 bg-gray-300 hover:bg-gray-400"
                      }`}
                      aria-label={`Go to card ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Website / Desktop View (>= 1024px): All 3 cards side-by-side */}
              <div className="hidden lg:grid lg:grid-cols-3 gap-8 items-stretch">
                {services.map((service) => renderCard(service, "w-full"))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section className="py-20">
          <div className="container mx-auto px-8 max-w-7xl">
            <h2 className="text-4xl font-bold text-blue-900 mb-12 text-center">
              More Than Just Reports
            </h2>
            <div className="text-xl leading-relaxed text-center">
              <p>
                At Bastion, we're building more than research deliverables.
                We're building a community of serious investors—people who value
                diligence, clarity, and the conviction that comes from knowing
                what you own and why.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
