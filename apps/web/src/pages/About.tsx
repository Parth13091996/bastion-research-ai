import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import BackgroundShapes from "../components/generic/framer-motion.tsx";

// Import your Lottie JSON files
import researchAllyAnim from "@/files/researchAlly.json";
import bastionCoreAnim from "@/files/bastionCore.json";
import adaptiveQualityAnim from "@/files/adaptiveQuality.json";

const COLORS = {
  red: "#C00000",
  blue: "#1C2852",
  beige: "#C4B696",
  gray: "#E6E6E6",
  white: "#ffffff",
  black: "#000000",
};

interface ServiceCard {
  id: string;
  lottie: any;
  title: string;
  description: string;
}

interface MousePosition {
  x: number;
  y: number;
}

const About: React.FC = () => {
  const [activeService, setActiveService] = useState<string>("bastion-core");
  const [mousePosition, setMousePosition] = useState<MousePosition>({
    x: 0,
    y: 0,
  });
  const headerRef = useRef<HTMLElement>(null);

  const services: ServiceCard[] = [
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

  // Auto-rotate services
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveService((prevActive) => {
        const currentIndex = services.findIndex((s) => s.id === prevActive);
        const nextIndex = (currentIndex + 1) % services.length;
        return services[nextIndex].id;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [services]);

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
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, ${COLORS.gray} 1px, transparent 1px),
              linear-gradient(to bottom, ${COLORS.gray} 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

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
        {/* Section 1: Investing with Clarity and Conviction */}
        <section className="py-20">
          <div className="container mx-auto px-8 max-w-4xl">
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

              <div className="bg-white rounded-xl p-8 shadow-lg border-l-4 border-red-600">
                <div className="mb-6 pl-4 border-l-4 border-red-600">
                  <strong className="text-blue-900 text-lg block mb-2">
                    Institutions, fund managers, and family offices
                  </strong>
                  <span className="text-gray-700">
                    who rely on us for sharp, independent insights.
                  </span>
                </div>
                <div className="pl-4 border-l-4 border-red-600">
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

        {/* Section 2: Research Built Around You */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-8 max-w-5xl">
            <h2 className="text-4xl font-bold text-blue-900 mb-12 text-center">
              Research Built Around You
            </h2>

            <p className="text-center text-xl mb-12">
              No matter the size of your portfolio or how you manage it, we've
              built offerings to meet you where you are:
            </p>

            <div className="bg-white rounded-3xl p-12 shadow-xl">
              <div className="flex justify-center items-center gap-8 relative max-w-4xl mx-auto">
                {services.map((service, index) => (
                  <React.Fragment key={service.id}>
                    <div
                      className={`
                      relative z-10 w-72 p-8 rounded-2xl text-center border-2
                      ${
                        activeService === service.id
                          ? `bg-gradient-to-br from-[${COLORS.blue}] to-[${COLORS.blue}] text-white border-[${COLORS.red}]`
                          : `bg-gradient-to-br from-${COLORS.gray} to-${COLORS.white} text-gray-800 border-gray-200`
                      }
                    `}
                    >
                      <div className="w-24 h-24 mx-auto mb-4">
                        <Lottie animationData={service.lottie} loop autoplay />
                      </div>
                      <h3 className="text-xl font-bold mb-4 text-blue-900">
                        {service.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-gray-600">
                        {service.description}
                      </p>
                    </div>

                    {index < services.length - 1 && (
                      <div className="hidden lg:block w-16 h-0.5 bg-gradient-to-r from-red-600 to-blue-900 relative z-0 opacity-70" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: More Than Just Reports */}
        <section className="py-20">
          <div className="container mx-auto px-8 max-w-4xl">
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
