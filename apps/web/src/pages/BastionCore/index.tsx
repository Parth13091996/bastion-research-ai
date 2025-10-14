import BackgroundShapes from "@/components/generic/framer-motion";
import Testimonial from "@/pages/Testimonials/Index";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
// Brand Colors
const COLORS = {
  red: "#C00000",
  blue: "#1C2852",
  beige: "#C4B696",
  gray: "#E6E6E6",
  white: "#ffffff",
  black: "#000000",
};

// Type definitions for FlipCard
type FlipCardProps = {
  front: { letter: string; caption: string };
  back: { title: string; text: string };
  color?: string;
};

// Flip Card for SMART boxes
function FlipCard({ front, back, color = COLORS.blue }: FlipCardProps) {
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

// Types for items array
type Item = {
  title: string;
  desc: string;
  img: string;
};

// FAQ type
type FAQItem = {
  q: string;
  a: React.ReactNode;
};

export default function BastionCoreProductPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const items: Item[] = [
    {
      title: "Detailed Business Notes",
      desc: "Clear, in-depth breakdowns of businesses we initiate coverage on, so you understand the story behind them.",
      img: "/media/Detailed-Business-Notes.png" as string,
    },
    {
      title: "Regular Company Updates",
      desc: "From quarterly results to key announcements and special situations, stay on top of every company under our active coverage.",
      img: "/media/Regular-Company-Updates.png" as string,
    },
    {
      title: "Scratch Pad Access",
      desc: "Not every idea makes the cut. We share the ones we passed on and the lessons behind those decisions so you learn as much from the misses as the hits.",
      img: "/media/Scratch-Pad-Access.png" as string,
    },
    {
      title: "Quarterly Interactions",
      desc: "Every quarter, we sit down with you to discuss how our covered businesses are progressing, share updated views, and answer your questions directly.",
      img: "/media/Quarterly-Interactions.png" as string,
    },
    {
      title: "Premium Webinars",
      desc: "Gain free access to our exclusive webinars, where we bring sharp perspectives and practical insights to the investing community.",
      img: "/media/premium-webinars.png" as string,
    },
    {
      title: "Subscriber-Only Model Portfolio Discounts",
      desc: "Want research plus execution? As a CORE subscriber, you get special discounts on our ready-to-use model portfolios.",
      img: "/media/modelPortfolio-compressed.png" as string,
    },
    {
      title: "Premium IPO Coverage",
      desc: "Get free access to our in-depth IPO notes, covering the positives, risks, and our perspective on businesses going public.",
      img: "/public/media/premium-ipo-coverage.png" as string,
    },
  ];

  // 👇 State for which item is active
  const [active, setActive] = useState<number>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqsNew: FAQItem[] = [
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
      a: "No. We focus on research and decision support, not portfolio products.No. We focus on research and decision support, not portfolio products.",
    },
  ];

  return (
    <div>
      <BackgroundShapes />
      <div className="min-h-screen w-full" style={{ background: COLORS.gray }}>
        {/* Section 1: Hero / Intro with two cards */}
        <section className="mx-auto max-w-7xl px-4 pt-10 md:pt-14">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Card: Text */}
            <div className="flex flex-col justify-center items-center md:items-start">
              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-center md:text-left"
                style={{
                  background: "linear-gradient(90deg, #1C2852, #C00000)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textShadow: "2px 2px 8px rgba(0,0,0,0.2)",
                }}
              >
                Research You Can Act With Conviction
              </h1>
            </div>

            {/* Right Card: Buttons */}
            <div className="p-8 flex flex-col gap-4 justify-center items-center md:items-start">
              <a
                href="/register"
                className="w-full md:w-auto px-6 py-3 bg-[#C00000] text-white rounded-xl hover:bg-[#a00000] transition-colors text-center font-semibold"
              >
                Subscribe to Quarterly Plan at Rs. 5,000 /-
              </a>
              <a
                href="/register"
                className="w-full md:w-auto px-6 py-3 border border-[#C00000] text-[#C00000] rounded-xl hover:bg-[#C00000] hover:text-white transition-colors text-center font-semibold"
              >
                View Research
              </a>
            </div>
          </div>
        </section>

        {/* Section 2: Pricing */}
        <section className="max-w-7xl px-4 mx-auto  py-10">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-6">
            Choose your plan
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Quarterly Plan */}
            <div className="relative rounded-2xl border border-[#E6E6E6] bg-white p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <h3 className="text-xl font-semibold">Quarterly Plan</h3>
                </div>
                <p className="mt-3 text-3xl font-bold text-[#C00000]">
                  Rs. 4,000/-
                </p>
                <p className="text-sm text-slate-500">Including GST</p>
                <p className="mt-1 text-[12px] text-slate-500">
                  * Valid Only Once
                </p>
              </div>
              <div id="subscribe-button-div" className="mt-6 flex justify-end">
                <a href="/register">
                  <button className="px-4 py-2 bg-[#C00000] text-white rounded-xl hover:bg-[#a00000] transition-colors">
                    Subscribe Now
                  </button>
                </a>
              </div>
            </div>

            {/* Yearly Plan */}
            <div className="relative rounded-2xl border border-[#C4B696]/40 bg-[#1C2852] p-6 shadow-sm hover:shadow-md transition-shadow text-white flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <h3 className="text-xl font-semibold">Yearly Plan</h3>
                  <span className="ml-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-[#C4B696] text-[#1C2852]">
                    Best value
                  </span>
                </div>
                <p className="mt-3 text-3xl font-bold">Rs. 18,750/-</p>
                <p className="text-sm text-gray-200">Including GST</p>
              </div>
              <div className="mt-6 flex justify-end">
                <a href="/register">
                  <button className="px-4 py-2 bg-[#C4B696] text-[#1C2852] rounded-xl hover:bg-[#b3a67d] transition-colors">
                    Subscribe Now
                  </button>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Content */}
        <section className="max-w-7xl px-4 mx-auto pb-16">
          <div className="rounded-3xl border border-[#E6E6E6] overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-5 items-stretch">
              {/* Left: Tabs */}
              <div className="md:col-span-2 bg-white">
                <div className="divide-y divide-[#E6E6E6]">
                  {items.map((it, idx) => (
                    <div key={it.title}>
                      <button
                        onClick={() => setActive(idx)}
                        onMouseEnter={() => setActive(idx)}
                        className={`group w-full text-left p-5 focus:outline-none transition-colors ${
                          active === idx
                            ? "bg-[#E6E6E6]/40"
                            : "bg-white hover:bg-[#E6E6E6]/30"
                        }`}
                        aria-current={active === idx ? "page" : undefined}
                        type="button"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-2.5 w-2.5 rounded-full transition-colors ${
                              active === idx
                                ? "bg-[#C00000]"
                                : "bg-[#C4B696] group-hover:bg-[#C00000]"
                            }`}
                          />
                          <h4 className="text-base md:text-lg font-semibold">
                            {it.title}
                          </h4>
                        </div>
                        <p className="mt-1 ml-5 text-sm text-slate-600">
                          {it.desc}
                        </p>
                      </button>

                      {/* Mobile Image */}
                      <div
                        className={`md:hidden overflow-hidden transition-all duration-300 ${
                          active === idx ? "max-h-[700px] mt-2" : "max-h-0"
                        }`}
                      >
                        <div className="relative bg-[#E6E6E6]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={it.img}
                            alt={it.title}
                            className="h-48 w-full object-cover rounded-b-xl"
                          />
                          <div className="absolute bottom-2 left-2 right-2 bg-white/85 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
                            <p className="text-sm font-medium text-[#1C2852]">
                              {it.title}
                            </p>
                            <p className="text-xs text-slate-600">{it.desc}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Image */}
              <div className="hidden md:block md:col-span-3 relative bg-[#E6E6E6] h-full">
                <div className="absolute inset-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    key={items[active].img}
                    src={items[active].img}
                    alt={items[active].title}
                    className="h-full w-full object-cover object-center"
                  />
                </div>
                <div className="absolute bottom-4 left-4 right-4 bg-white/85 backdrop-blur-sm rounded-xl px-4 py-3 shadow-sm">
                  <p className="text-sm font-medium text-[#1C2852]">
                    {items[active].title}
                  </p>
                  <p className="text-xs text-slate-600">{items[active].desc}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Testimonials */}
        <section
          id="testimonials"
          className="mx-auto max-w-7xl px-4 py-12 md:py-16"
        >
          <Testimonial />
        </section>

        {/* Section 5: Importance of Research */}
        <section
          id="research"
          className="mx-auto max-w-7xl px-4 py-12 md:py-16"
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
                of an investor&apos;s investing endeavours. Our unwavering
                commitment with Bastion CORE lies in providing best research
                while ensuring its accessibility to investors, irrespective of
                the size of their capital.
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
                &ldquo;Know What you Own and know why you own it&rdquo; &ndash;{" "}
                <span className="font-semibold">Peter Lynch</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Section 6: SMART Framework */}
        <section id="smart" className="mx-auto max-w-7xl px-4 py-12 md:py-16">
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
        {/* Section 7: FAQs */}
        <section className="mx-auto max-w-7xl px-4 pb-4">
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
                  type="button"
                  aria-expanded={openIndex === index}
                  aria-controls={`faq-content-${index}`}
                >
                  {faq.q}
                  <ChevronDown
                    className={`w-6 h-6 transform transition-transform duration-500 ${
                      openIndex === index ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </button>
                <div
                  id={`faq-content-${index}`}
                  className={`transition-[max-height] duration-300 ease-in-out overflow-hidden px-6 ${
                    openIndex === index ? "max-h-96" : "max-h-0"
                  }`}
                  aria-hidden={openIndex !== index}
                >
                  <div className="overflow-auto no-scrollbar max-h-96 pb-4">
                    {/* FAQ answer node: handle string or JSX */}
                    {typeof faq.a === "string" ? (
                      <p className="text-gray-700 leading-relaxed">{faq.a}</p>
                    ) : (
                      <div className="text-gray-700 leading-relaxed">
                        {faq.a}
                      </div>
                    )}
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
