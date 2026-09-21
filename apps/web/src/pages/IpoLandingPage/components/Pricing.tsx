import React from "react";

const Pricing = () => {
  return (
    <section id="pricing" className="py-16 md:py-20 bg-slate-900 text-slate-100">
      {/* Pricing */}
      <div className="container mx-auto max-w-7xl px-4">
        <div className="md:flex items-end justify-between">
          <h2 className="text-2xl md:text-3xl font-bold">Simple pricing</h2>
          <p className="mt-2 md:mt-0 text-slate-300">Trial now, continue only if it's useful.</p>
        </div>

        <div className="mt-8 grid lg:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-white text-slate-900 p-6 shadow-xl border border-slate-200">
            <div className="text-xs font-semibold text-slate-500">Start here</div>
            <div className="mt-2 flex items-baseline gap-2">
              <div className="text-3xl font-extrabold">₹99</div>
              <div className="text-sm text-slate-500">for 14 days</div>
            </div>
            <p className="mt-2 text-sm text-slate-600">Then ₹1,500/year (GST extra) unless you cancel during trial.</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>• All live IPO briefs during your trial (Mainboard + SME)</li>
              <li>• Occasional material updates</li>
              <li>• 5‑line TL;DR on email/WhatsApp</li>
              <li>• Short Q&A thread per IPO</li>
            </ul>
            <button className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 text-white px-5 py-3 font-semibold shadow hover:bg-indigo-700">
              Start 14‑day trial ₹99
            </button>
            <p className="mt-3 text-xs text-slate-500">If you don't find it useful, reply "REFUND" during your 14‑day trial — we'll refund ₹99.</p>
          </div>

          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-6">
            <div className="text-xs font-semibold text-slate-400">After trial</div>
            <div className="mt-2 flex items-baseline gap-2">
              <div className="text-3xl font-extrabold text-white">₹1,500</div>
              <div className="text-sm text-slate-400">per year</div>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              <li>• Coverage of each IPO during the bid window</li>
              <li>• Quick Avoid 1‑pagers for weak issues</li>
              <li>• Archive access to your past briefs</li>
              <li>• WhatsApp Broadcast + email delivery</li>
            </ul>
            <p className="mt-4 text-xs text-slate-400">Cancel any time before renewal. GST extra.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
