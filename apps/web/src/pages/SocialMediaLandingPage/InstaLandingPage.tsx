import React, { useEffect, useState } from "react";

export default function InstaLandingPage() {
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowSticky(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="font-sans text-gray-900 bg-white pb-5">

      {/* Header */}
      <header className="bg-secondary text-center px-5 py-20 border-b-4 border-primary">
        <div className="bg-white px-3 py-1 rounded-full inline-block mb-5 max-w-[200px]">
          <img
            src="/media/Bastion-Logo.png"
            alt="Bastion Research"
            className="w-full"
          />
        </div>
        <div className="w-20 h-[2px] bg-primary mx-auto mb-8" />
        <p className="text-white text-base md:text-xl lg:text-2xl max-w-[700px] mx-auto font-light leading-relaxed">
          Institutional-grade equity research and market intelligence for decision-makers.
          Comprehensive analysis delivered to your inbox.
        </p>
      </header>

      {/* Main */}
      <main className="max-w-[1000px] mx-auto px-5">

        {/* Schedule */}
        <section className="bg-gray-100 border-l-8 border-primary px-6 md:px-12 py-10 md:py-14 my-10 md:my-16">
          <h2 className="text-xl md:text-2xl lg:text-3xl text-secondary mb-6 md:mb-10 font-normal hover:text-primary transition cursor-pointer">
            When will I receive Newsletters from Bastion?
          </h2>

          <div className="grid md:grid-cols-2 gap-10 max-w-[600px]">
            {[
              { num: "01", day: "Wednesday", desc: "Mid-week analysis and insights" },
              { num: "02", day: "Saturday", desc: "Comprehensive weekend report" }
            ].map((item) => (
              <div key={item.num} className="flex gap-5 items-center">
                <div className="text-5xl font-bold text-primary min-w-[60px]">
                  {item.num}
                </div>
                <div>
                  <div className="text-base md:text-lg font-semibold uppercase tracking-widest text-secondary">
                    {item.day}
                  </div>
                  <p className="text-xs md:text-sm text-gray-600 font-light">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Free Banner */}
        <section className="bg-secondary text-center py-10 my-10 border-y-4 border-primary">
          <div className="inline-block bg-primary/20 border-2 border-primary text-white px-12 py-3 text-2xl font-bold tracking-widest mb-5 rounded-full">
            FREE
          </div>
          <p className="text-white text-lg font-light tracking-wide">
            Professional research insights at no cost. No subscription fees.
          </p>
        </section>

        {/* Value */}
        <section className="py-10 md:py-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl text-secondary font-normal hover:text-primary transition cursor-pointer">
            What will I get to read?
          </h2>
          <p className="text-gray-600 font-light mt-3 mb-8 md:mb-12 text-sm md:text-base">
            Comprehensive analysis across markets, sectors, and investment themes
          </p>

          <div className="divide-y border-t">
            {[
              "Macroeconomic trends and market-moving developments",
              "Company analysis covering strategy, financials, and competitive positioning",
              "Pre-IPO evaluations and public market debut analysis",
              "Investment frameworks and valuation methodologies explained",
              "On-ground research from management meetings and facility visits",
              "Business model breakdowns and value chain analysis",
              "Sector deep-dives with comprehensive industry coverage"
            ].map((text, index) => (
              <div
                key={index}
                className="flex gap-6 py-8 hover:bg-gray-50 hover:pl-5 transition"
              >
                <span className="text-primary font-semibold text-lg md:text-xl">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="font-light text-sm md:text-base lg:text-lg leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Initial CTA */}
        <section className="py-16 md:py-24 px-5">
          <div className="group relative overflow-hidden bg-secondary text-center py-10 my-16 border-y-4 border-primary">

            {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -ml-32 -mb-32 transition-transform duration-700 group-hover:scale-110" />

            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-white mb-8 tracking-wide leading-tight">
                Begin your access to <span className="font-semibold text-primary-foreground">crisp Investing Insights</span>
              </h2>

              <div className="flex flex-col items-center gap-6">
                <a
                  href="https://bastionresearch.substack.com/"
                  className="inline-block bg-primary text-white px-16 py-5 font-bold tracking-[0.2em] uppercase border-2 border-primary hover:bg-transparent hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(201,18,45,0.3)] hover:shadow-[0_0_30px_rgba(201,18,45,0.5)] transform hover:-translate-y-1"
                >
                  Subscribe Now
                </a>

                <p className="text-sm text-gray-400 font-light flex items-center justify-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/60"></span>
                  Free access
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/60"></span>
                  Professional insights
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/60"></span>
                  Cancel anytime
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Sticky CTA */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-primary px-5 py-5 shadow-2xl transition-transform duration-300 z-50 ${showSticky ? "translate-y-0" : "translate-y-full"
          }`}
      >
        <div className="max-w-[1000px] mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
          <p className="text-white font-light text-base md:text-lg lg:text-xl text-center md:text-left">
            Start receiving institutional-grade research
          </p>
          <a
            href="https://bastionresearch.substack.com/"
            className="bg-white text-primary px-14 py-4 font-bold tracking-widest border-4 border-white hover:bg-transparent hover:text-white transition shadow-lg"
          >
            SUBSCRIBE
          </a>
        </div>
      </div>
    </div>
  );
}
