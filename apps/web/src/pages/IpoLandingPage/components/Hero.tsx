import React from 'react';

const Hero: React.FC = () => {
  return (
    <section id="top" className="relative overflow-hidden">
      {/* Hero Section */}
      <div className="absolute inset-0 -z-10 opacity-60" aria-hidden="true">
        <div className="w-full h-full bg-gradient-to-br from-blue-50 to-slate-50"></div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
            IPO decisions in 5 minutes. <span className="text-indigo-700">Apply or Avoid</span> with evidence.
          </h1>
          <p className="mt-4 text-slate-700 text-lg">
            SEBI‑RA research for retail investors. One page of conclusions, four pages of proof: business overview, valuation vs peers, and risk flags. No GMP hype. No listing‑pop predictions.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 text-white px-5 py-3 font-semibold shadow hover:bg-indigo-700"
            >
              Start 14‑day trial ₹99
            </button>
            <button 
              onClick={() => document.getElementById('sample')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-5 py-3 font-medium hover:bg-slate-100"
            >
              See sample brief
            </button>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500"></span> 
              SEBI RA Regn: <span className="font-medium">{"INH000013712"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-indigo-500"></span> 
              Covers Mainboard + SME
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-sky-500"></span> 
              3–4 hr turnaround
            </div>
          </div>
        </div>
        <div className="relative">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 md:p-6">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-100 aspect-[4/3] grid place-items-center text-slate-500 text-sm">
                Executive Summary (preview)
              </div>
              <div className="rounded-xl bg-slate-100 aspect-[4/3] grid place-items-center text-slate-500 text-sm">
                Scorecard (preview)
              </div>
              <div className="rounded-xl bg-slate-100 aspect-[4/3] grid place-items-center text-slate-500 text-sm">
                Peers Table (preview)
              </div>
              <div className="rounded-xl bg-slate-100 aspect-[4/3] grid place-items-center text-slate-500 text-sm">
                Risk Matrix (preview)
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-slate-500">Sample pages, redacted for demo</span>
              <button 
                onClick={() => document.getElementById('sample')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-sm font-medium text-indigo-700 hover:underline"
              >
                Open sample
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
