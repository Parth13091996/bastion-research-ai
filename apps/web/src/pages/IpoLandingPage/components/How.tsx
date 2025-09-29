import React from "react";

const How = () => {
  return (
    <section id="how" className="py-16 md:py-20 bg-white">
      {/* How it works */}
      <div className="container mx-auto max-w-7xl px-4">
        <h2 className="text-2xl md:text-3xl font-bold">How it works</h2>
        <div className="mt-8 grid md:grid-cols-4 gap-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <div className="text-xs font-semibold text-slate-500">Step 1</div>
            <h3 className="mt-1 font-semibold">Start ₹99 trial</h3>
            <p className="mt-2 text-sm text-slate-600">14 days covering every live IPO during your window. Cancel anytime during the trial.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <div className="text-xs font-semibold text-slate-500">Step 2</div>
            <h3 className="mt-1 font-semibold">Get your briefs</h3>
            <p className="mt-2 text-sm text-slate-600">Full reports for IPOs we recommend, plus a 1‑page Quick Avoid for those we don't.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <div className="text-xs font-semibold text-slate-500">Step 3</div>
            <h3 className="mt-1 font-semibold">Occasional update notes</h3>
            <p className="mt-2 text-sm text-slate-600">Only when there's a material development such as heavy oversubscription or weak response.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <div className="text-xs font-semibold text-slate-500">Step 4</div>
            <h3 className="mt-1 font-semibold">Continue at ₹1,500/yr</h3>
            <p className="mt-2 text-sm text-slate-600">Do nothing and continue, or cancel before the trial ends. GST extra.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default How;
