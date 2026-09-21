import React from "react";

const Fit = () => {
  return (
    <section id="fit" className="py-14 md:py-16 bg-slate-100">
      {/* Fit Section */}
      <div className="container mx-auto max-w-7xl px-4">
        <h2 className="text-2xl md:text-3xl font-bold">Is this for you?</h2>
        <div className="mt-6 grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
            <div className="text-slate-500 text-xs font-semibold">For</div>
            <ul className="mt-2 space-y-2 text-slate-800 text-sm">
              <li>• New‑to‑IPO investors who want clarity fast</li>
              <li>• Long‑term investors focused on fundamentals</li>
              <li>• Busy professionals who prefer a clear Apply/Avoid</li>
            </ul>
          </div>
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
            <div className="text-slate-500 text-xs font-semibold">Not for</div>
            <ul className="mt-2 space-y-2 text-slate-700 text-sm">
              <li>• Listing‑pop chasing</li>
              <li>• Tips/guarantees or intraday signals</li>
              <li>• Anyone seeking GMP‑driven calls</li>
            </ul>
          </div>
        </div>
        <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          <strong>Note:</strong> We do <em>not</em> predict listing‑day pops. We analyze the business, valuation vs peers, and risks, then give a single clear call.
        </div>
      </div>
    </section>
  );
};

export default Fit;
