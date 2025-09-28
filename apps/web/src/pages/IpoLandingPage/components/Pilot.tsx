import React from "react";

const Pilot = () => {
  return (
    <section id="pilot" className="py-14 md:py-16">
      {/* Pilot section */}
      <div className="container mx-auto max-w-7xl px-4">
        <h2 className="text-2xl md:text-3xl font-bold">This is a time‑bound pilot</h2>
        <p className="mt-3 text-slate-600">
          We're running a public beta to test whether we can consistently deliver high‑quality IPO briefs at speed. During this pilot we may pause or proceed based on usage and satisfaction data. If we pause, we'll cancel auto‑renewals and make things right for members. You'll keep access to delivered briefs.
        </p>
        <ul className="mt-4 grid md:grid-cols-3 gap-3 text-sm text-slate-700">
          <li className="rounded-xl border border-slate-200 bg-white p-4">• Transparent pricing: ₹99 for 14 days → ₹1,500/year</li>
          <li className="rounded-xl border border-slate-200 bg-white p-4">• All live IPOs during your trial window, Mainboard + SME</li>
          <li className="rounded-xl border border-slate-200 bg-white p-4">• Fundamentals only — no listing‑pop predictions</li>
        </ul>
      </div>
    </section>
  );
};

export default Pilot;
