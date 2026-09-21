import React from "react";

const Sample = () => {
  return (
    <section id="sample" className="py-16 md:py-20">
      {/* Sample Section */}
      <div className="container mx-auto max-w-7xl px-4">
        <div className="md:flex items-end justify-between">
          <h2 className="text-2xl md:text-3xl font-bold">What you'll receive</h2>
          <button
            onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            className="hidden md:inline-flex items-center rounded-xl bg-indigo-600 text-white px-4 py-2 text-sm font-semibold shadow hover:bg-indigo-700"
          >
            Start 14‑day trial ₹99
          </button>
        </div>
        <p className="mt-3 text-slate-600">
          Recommended IPOs get a full 4–5 page report with a 1‑page conclusion up top. IPOs we avoid get a 1‑page <strong>Quick Avoid</strong>: basic details, a short business overview, and our rationale.
        </p>

        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
            <h3 className="font-semibold">1) Executive summary</h3>
            <p className="mt-2 text-sm text-slate-600">Business in 4 bullets, Apply/Avoid/Watch, fair value band, key dates & price band.</p>
          </div>
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
            <h3 className="font-semibold">2) Business & model</h3>
            <p className="mt-2 text-sm text-slate-600">What they do, revenue mix, unit economics and working‑capital notes.</p>
          </div>
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
            <h3 className="font-semibold">3) Financials snapshot</h3>
            <p className="mt-2 text-sm text-slate-600">Growth, margins, profitability and cash conversion in plain English.</p>
          </div>
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
            <h3 className="font-semibold">4) Customers & order book</h3>
            <p className="mt-2 text-sm text-slate-600">Mix by government/private and geography, and order‑book context.</p>
          </div>
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
            <h3 className="font-semibold">5) Valuation vs peers</h3>
            <p className="mt-2 text-sm text-slate-600">P/E, EV/EBITDA, P/S vs listed peers with premium/discount rationale.</p>
          </div>
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
            <h3 className="font-semibold">6) Risks & challenges</h3>
            <p className="mt-2 text-sm text-slate-600">Concentration, governance, regulatory, working‑capital and execution risks.</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <button className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100">
            Download sample PDF
          </button>
          <button
            onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 text-white px-5 py-2.5 text-sm font-semibold shadow hover:bg-indigo-700"
          >
            Start 14‑day trial ₹99
          </button>
        </div>
      </div>
    </section>
  );
};

export default Sample;
