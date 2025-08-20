import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Star, Sparkles, ChevronDown, CheckCircle2 } from "lucide-react";
import Testimonial from "../components/generic/Testimonial.tsx";
import Lottie from "lottie-react";
import priceTag from "../files/price-core.json";
import BackgroundShapes from "../components/generic/framer-motion.tsx";

// Brand Colors
const COLORS = {
  red: "#C00000",
  blue: "#1C2852",
  beige: "#C4B696",
  gray: "#E6E6E6",
  white: "#ffffff",
  black: "#000000",
};

function TypingLoop({ phrases, typingSpeed = 30, pauseTime = 2000 }) {
  const [text, setText] = React.useState("");
  const [index, setIndex] = React.useState(0);
  const [charIndex, setCharIndex] = React.useState(0);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    let timer;

    if (!deleting && charIndex < phrases[index].length) {
      // typing forward
      timer = setTimeout(() => {
        setText((prev) => prev + phrases[index][charIndex]);
        setCharIndex((c) => c + 1);
      }, typingSpeed);
    } else if (!deleting && charIndex === phrases[index].length) {
      // pause before deleting
      timer = setTimeout(() => setDeleting(true), pauseTime);
    } else if (deleting && charIndex > 0) {
      // deleting backward
      timer = setTimeout(() => {
        setText((prev) => prev.slice(0, -1));
        setCharIndex((c) => c - 1);
      }, typingSpeed / 2);
    } else if (deleting && charIndex === 0) {
      // move to next phrase
      setDeleting(false);
      setIndex((i) => (i + 1) % phrases.length);
    }

    return () => clearTimeout(timer);
  }, [charIndex, deleting, phrases, index, typingSpeed, pauseTime]);

  // Function to highlight first letter of each word
  const renderHighlightedText = (txt) => {
    return txt.split(/(\s+)/).map((part, i) => {
      if (part.trim().length === 0) {
        // It's just whitespace, render as-is
        return <span key={i}>{part}</span>;
      }

      // Word case → first letter red
      return (
        <span key={i}>
          <span className="text-red-600">{part[0]}</span>
          {part.slice(1)}
        </span>
      );
    });
  };

  return (
    <div className="font-semibold text-2xl md:text-3xl lg:text-4xl tracking-tight text-center">
      {text.length > 0 && renderHighlightedText(text)}
      <span
        className="inline-block w-[2px] h-[1.2em] align-[-0.15em] ml-1 animate-pulse"
        style={{ background: "red" }}
      />
    </div>
  );
}

// Flip Card for SMART boxes
function FlipCard({ front, back, color = COLORS.blue }) {
  return (
    <div className="group [perspective:1000px]">
      <div className="relative w-full h-40 md:h-48 [transform-style:preserve-3d] transition-transform duration-500 group-hover:[transform:rotateY(180deg)]">
        {/* Front */}
        <div
          className="absolute inset-0 flex items-center justify-center rounded-2xl shadow-lg p-6 [backface-visibility:hidden]"
          style={{ background: color, color: COLORS.white }}
        >
          <div className="text-center">
            <div className="text-5xl md:text-6xl font-black">
              {front.letter}
            </div>
            <div className="mt-2 text-sm md:text-base opacity-90">
              {front.caption}
            </div>
          </div>
        </div>
        {/* Back */}
        <div
          className="absolute inset-0 rounded-2xl shadow-lg py-6 px-2 [transform:rotateY(180deg)] [backface-visibility:hidden] flex flex-col gap-2 items-center justify-center text-center"
          style={{
            background: COLORS.white,
            color: COLORS.blue,
            border: `2px solid ${color}`,
          }}
        >
          <div className="text-m md:text-m font-bold leading-snug">
            {back.title}
          </div>
          <div className="text-sm md:text-base font-medium leading-snug">
            {back.text}
          </div>
        </div>
      </div>
    </div>
  );
}

const faqsNew = [
  {
    q: "How do I subscribe and What are the Subscription Charges?",
    a: (
      <span>
        You can subscribe via the button below at{" "}
        <strong>Rs. 18,750 per year</strong>. After checkout, you’ll receive
        instant access to research, archives, and updates.
      </span>
    ),
  },
  {
    q: "Can I get refund after I subscribe?",
    a: "Subscriptions are non-refundable. If you have issues, reach out to connect@bastionresearch.in and we’ll help.",
  },
  {
    q: "Is Bastion CORE Sector and Market Cap Agnostic?",
    a: "Yes. We are sector and market-cap agnostic. We go where the risk-adjusted opportunity is.",
  },
  {
    q: "For Whom is this Service Suitable?",
    a: "DIY investors who want high-quality, objective research with timely updates and a clean process.",
  },
  {
    q: "For Whom is this Service Not Suitable?",
    a: "Anyone looking for intraday tips, F&O calls, or guaranteed returns.",
  },
  {
    q: "Do you Provide Free Trials?",
    a: "We currently do not offer free trials.",
  },
  {
    q: "What is not Provided as Part of the Service?",
    a: "No intraday calls, no F&O recommendations, and no personalized portfolio management.",
  },
  {
    q: "Frequency of New Ideas?",
    a: "We publish new ideas regularly and maintain active coverage with quarterly tracking and updates.",
  },
  {
    q: "Do I Get Constant Access to Important Updates and Results of Companies under Coverage?",
    a: "Yes. We provide timely result notes and updates for companies under our coverage.",
  },
  {
    q: "Do I get Analyst Access to Further Clarify My Doubts?",
    a: "Yes, we offer reasonable analyst access for subscribers for clarifications related to our research.",
  },
  {
    q: "What do I get as a subscriber?",
    a: "Stock ideas, deep-dive research reports, quarterly tracking, archives, and updates—delivered via our SMART framework.",
  },
  {
    q: "Do you provide research on demand?",
    a: "On-demand custom research is part of our Research Ally offering, not Bastion CORE.",
  },
  {
    q: "Do you provide ready-made portfolios?",
    a: "No. We focus on research and decision support, not portfolio products.No. We focus on research and decision support, not portfolio products.No. We focus on research and decision support, not portfolio products.No. We focus on research and decision support, not portfolio products.No. We focus on research and decision support, not portfolio products.No. We focus on research and decision support, not portfolio products.No. We focus on research and decision support, not portfolio products.No. We focus on research and decision support, not portfolio products.No. We focus on research and decision support, not portfolio products.No. We focus on research and decision support, not portfolio products.No. We focus on research and decision support, not portfolio products.No. We focus on research and decision support, not portfolio products.No. We focus on research and decision support, not portfolio products.No. We focus on research and decision support, not portfolio products.No. We focus on research and decision support, not portfolio products.No. We focus on research and decision support, not portfolio products.No. We focus on research and decision support, not portfolio products.No. We focus on research and decision support, not portfolio products.No. We focus on research and decision support, not portfolio products.No. We focus on research and decision support, not portfolio products.No. We focus on research and decision support, not portfolio products.No. We focus on research and decision support, not portfolio products.No. We focus on research and decision support, not portfolio products.No. We focus on research and decision support, not portfolio products.No. We focus on research and decision support, not portfolio products.",
  },
];

export default function BastionCoreProductPage() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div>
      <BackgroundShapes />
      <div className="min-h-screen w-full" style={{ background: COLORS.gray }}>
        {/* Sub-header typing banner */}
        <section className="mx-auto max-w-6xl px-4 pt-10 md:pt-14">
          <div
            className="rounded-3xl p-6 md:p-10 shadow-lg text-center"
            style={{ background: COLORS.white }}
          >
            <TypingLoop phrases={["Comprehensive Objective Research Edge"]} />
            <div
              className="mt-3 text-sm md:text-base opacity-70"
              style={{ color: COLORS.blue }}
            >
              Built for DIY investors who want serious, clean, decision-useful
              research.
            </div>
          </div>
        </section>

        {/* Section 4: Pricing */}
        <section id="pricing" className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Pricing Box */}
            <div className="rounded-3xl overflow-hidden shadow-2xl h-full max-h-[500px] flex flex-col">
              <div
                className="text-center py-2 font-bold tracking-wide"
                style={{ background: COLORS.red, color: COLORS.white }}
              >
                Subscribe Now!
              </div>
              <div
                className="p-6 md:p-8 flex-1 flex flex-col justify-end"
                style={{ background: COLORS.white }}
              >
                <div className="text-center flex flex-col items-center">
                  {/* Lottie Animation */}
                  <Lottie
                    animationData={priceTag}
                    loop={true}
                    style={{ width: 155, height: 155 }}
                  />

                  {/* Title & Price */}
                  <div
                    className="text-2xl md:text-3xl font-extrabold mt-2"
                    style={{ color: COLORS.blue }}
                  >
                    Bastion CORE
                  </div>
                  <div
                    className="mt-2 text-lg md:text-xl font-semibold"
                    style={{ color: COLORS.blue }}
                  >
                    Rs. 18,750 / Annually
                  </div>
                  <div
                    className="mt-2 text-xs opacity-70"
                    style={{ color: COLORS.blue }}
                  >
                    * Above Price is Inclusive of GST
                  </div>
                  <button
                    className="mt-5 w-full rounded-xl py-3 font-semibold hover:opacity-90"
                    style={{ background: COLORS.red, color: COLORS.white }}
                  >
                    Start Taking Informed Decisions
                  </button>
                </div>
              </div>
            </div>

            {/* Testimonial Box */}
            <div
              className="rounded-3xl  max-h-[500px] rounded-3xl overflow-hidden shadow-2xl"
              style={{ background: COLORS.white }}
            >
              <div
                className="text-center py-2 font-bold tracking-wide"
                style={{ background: COLORS.red, color: COLORS.white }}
              >
                Add Your Testimonial
              </div>
              <div className="p-6 md:p-8 flex flex-col gap-4 h-full">
                {/* First + Last Name */}
                <div className="flex gap-4">
                  <input
                    placeholder="First Name *"
                    required
                    className="w-1/2 rounded-xl p-3 border focus:outline-none"
                    style={{ borderColor: COLORS.gray }}
                  />
                  <input
                    placeholder="Last Name *"
                    required
                    className="w-1/2 rounded-xl p-3 border focus:outline-none"
                    style={{ borderColor: COLORS.gray }}
                  />
                </div>

                {/* Email */}
                <input
                  type="email"
                  placeholder="Email *"
                  required
                  className="w-full rounded-xl p-3 border focus:outline-none"
                  style={{ borderColor: COLORS.gray }}
                />

                {/* Testimonial */}
                <textarea
                  placeholder="Write your testimonial... *"
                  required
                  className="w-full rounded-xl p-3 border h-28 resize-none focus:outline-none"
                  style={{ borderColor: COLORS.gray }}
                />

                {/* Submit */}
                <button
                  className="mt-5 w-full rounded-xl py-3 font-semibold hover:opacity-90"
                  style={{ background: COLORS.red, color: COLORS.white }}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 1: Importance of Research */}
        <section
          id="research"
          className="mx-auto max-w-6xl px-4 py-12 md:py-16"
        >
          <div className="grid md:grid-cols-1 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-3xl p-6 md:p-8 shadow-lg flex flex-col justify-center text-left"
              style={{ background: COLORS.white }}
            >
              <h2
                className="text-2xl md:text-3xl font-bold w-max mb-4 relative"
                style={{ color: COLORS.blue }}
              >
                Why Research Matters
                <div
                  className="absolute bottom-[-28%] left-0 w-full h-1"
                  style={{ background: COLORS.red }}
                ></div>
              </h2>
              <p
                className="mt-4 leading-relaxed"
                style={{ color: COLORS.blue }}
              >
                Research constitutes the <strong>FUNDAMENTAL</strong> component
                of an investor's investing endeavours. Our unwavering commitment
                with Bastion CORE lies in providing best research while ensuring
                its accessibility to investors, irrespective of the size of
                their capital.
              </p>
              <p
                className="mt-3 leading-relaxed"
                style={{ color: COLORS.blue }}
              >
                With thorough business comprehension and insights aiding your
                investment decisions, we guide you through your investment
                journey with detailed research reports and timely updates
                through our proprietary <strong>SMART Framework</strong>.
              </p>
              <div
                className="mt-6 border-l-4 pl-4 italic text-sm md:text-base"
                style={{ borderColor: COLORS.red, color: COLORS.blue }}
              >
                “Know What you Own and know why you own it” –{" "}
                <span className="font-semibold">Peter Lynch</span>
              </div>
            </motion.div>

            {/* <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-3xl p-6 md:p-8 shadow-lg flex flex-col items-center justify-center"
              style={{ background: COLORS.blue }}
            >
              <div className="relative mb-4">
                <div className="overflow-visible rounded-3xl shadow-2xl transition-transform duration-500 transform">
                  <img
                    src="src/files/peter-lynch-portrait.webp"
                    alt="Peter Lynch"
                    className="w-64 md:w-80 h-auto rounded-3xl object-contain"
                  />
                </div>
                <div className="mt-3 text-center text-white text-lg md:text-xl font-semibold">
                  Peter Lynch
                </div>
              </div>

              <div className="text-center text-white">
                <div className="text-2xl md:text-3xl font-semibold">
                  Clean. Objective. Actionable.
                </div>
                <div className="opacity-80 mt-2 text-lg md:text-base">
                  No fluff. Just high-quality research you can actually use.
                </div>
              </div>
            </motion.div> */}
          </div>
        </section>

        {/* Section 2: SMART Framework */}
        <section id="smart" className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <div className="flex items-end justify-between mb-8">
            <h2
              className="text-2xl md:text-3xl font-bold"
              style={{ color: COLORS.blue }}
            >
              SMART Framework
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            <FlipCard
              front={{ letter: "S", caption: "Strong Business" }}
              back={{
                title: "Strong Business",
                text: "Avoid businesses exhibiting signs of weakness",
              }}
              color={COLORS.blue}
            />

            <FlipCard
              front={{ letter: "M", caption: "Strong Management" }}
              back={{
                title: "Strong Management",
                text: "Not partnering with managements unwilling to share upside",
              }}
              color={COLORS.red}
            />

            <FlipCard
              front={{ letter: "A", caption: "Clean Accounts" }}
              back={{
                title: "Clean Accounts",
                text: "Making sure the numbers are reliable to form decisions",
              }}
              color={COLORS.blue}
            />

            <FlipCard
              front={{ letter: "R", caption: "Reasonable Valuations" }}
              back={{
                title: "Reasonable Valuations",
                text: "Not buying anything at any price",
              }}
              color={COLORS.red}
            />

            <FlipCard
              front={{ letter: "T", caption: "Business Tailwinds" }}
              back={{
                title: "Business Tailwinds",
                text: "Steer clear of businesses belonging to a dying or stagnant industry",
              }}
              color={COLORS.blue}
            />
          </div>
        </section>

        {/* Section 3: Testimonials */}
        <section
          id="testimonials"
          className="mx-auto max-w-6xl px-4 py-12 md:py-16"
        >
          <Testimonial />
        </section>

        {/* Section 5: FAQs */}
        <section className="mx-auto max-w-6xl px-4 pb-4">
          <h2 className="text-3xl font-bold text-left mb-4">FAQs</h2>
          <div className="space-y-4">
            {faqsNew.map((faq, index) => (
              <div
                key={index}
                className="rounded-2xl bg-white shadow-lg border border-gray-100 overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex focus:outline-none focus:ring-0 justify-between items-center px-6 py-4 text-left font-semibold text-lg"
                >
                  {faq.q}
                  <ChevronDown
                    className={`w-6 h-6 transform transition-transform duration-500 ${
                      openIndex === index ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </button>
                <div
                  className={`transition-[max-height] duration-300 ease-in-out overflow-hidden px-6 ${
                    openIndex === index ? "max-h-96" : "max-h-0"
                  }`}
                >
                  <div className="overflow-auto no-scrollbar max-h-96 pb-4">
                    <p className="text-gray-700 leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer
          className="py-8 text-center text-xs"
          style={{ color: COLORS.blue }}
        >
          © {new Date().getFullYear()} Bastion Research. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
