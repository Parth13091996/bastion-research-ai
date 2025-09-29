import React from "react";

const Faq = () => {
  return (
    <section id="faq" className="py-16 md:py-20 bg-white">
      <div className="container mx-auto max-w-7xl px-4">
        <h2 className="text-2xl md:text-3xl font-bold">FAQ</h2>
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <details className="rounded-2xl border border-slate-200 p-5 bg-slate-50 group" open>
            <summary className="cursor-pointer font-semibold list-none flex items-center justify-between">
              What exactly will I receive during the trial?
              <span className="ml-4 text-slate-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="mt-3 text-sm text-slate-600">We'll cover every live IPO during your 14‑day window. For IPOs we recommend, you'll receive a 4–5 page report. For IPOs we avoid, you'll receive a 1‑page Quick Avoid with basic details, a brief on the business, and our rationale. You'll also get a 5‑line TL;DR by email/WhatsApp.</p>
          </details>

          <details className="rounded-2xl border border-slate-200 p-5 bg-slate-50 group">
            <summary className="cursor-pointer font-semibold list-none flex items-center justify-between">
              Will you cover SME IPOs too?
              <span className="ml-4 text-slate-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="mt-3 text-sm text-slate-600">Yes. We cover Mainboard and SME. SME notes include a prominent liquidity and governance risk box.</p>
          </details>

          <details className="rounded-2xl border border-slate-200 p-5 bg-slate-50 group">
            <summary className="cursor-pointer font-semibold list-none flex items-center justify-between">
              Do you send category subscription updates?
              <span className="ml-4 text-slate-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="mt-3 text-sm text-slate-600">We don't send daily category subscription updates. We'll only share an update note when there's a material development such as heavy oversubscription or weak response.</p>
          </details>

          <details className="rounded-2xl border border-slate-200 p-5 bg-slate-50 group">
            <summary className="cursor-pointer font-semibold list-none flex items-center justify-between">
              Do you predict listing‑day pops?
              <span className="ml-4 text-slate-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="mt-3 text-sm text-slate-600">No. We focus on fundamentals: business quality, valuation vs peers, and risks. No tips or guaranteed returns.</p>
          </details>

          <details className="rounded-2xl border border-slate-200 p-5 bg-slate-50 group">
            <summary className="cursor-pointer font-semibold list-none flex items-center justify-between">
              How do I cancel during the trial?
              <span className="ml-4 text-slate-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="mt-3 text-sm text-slate-600">Reply to any trial email with the word <strong>"CANCEL"</strong>, or use the cancel link in your receipt. You'll keep access until the end of the trial.</p>
          </details>

          <details className="rounded-2xl border border-slate-200 p-5 bg-slate-50 group">
            <summary className="cursor-pointer font-semibold list-none flex items-center justify-between">
              What if I don't find it useful?
              <span className="ml-4 text-slate-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="mt-3 text-sm text-slate-600">If you don't find it useful, reply <strong>"REFUND"</strong> during your 14‑day trial and we'll refund ₹99 and stop auto‑renewal.</p>
          </details>

          <details className="rounded-2xl border border-slate-200 p-5 bg-slate-50 group">
            <summary className="cursor-pointer font-semibold list-none flex items-center justify-between">
              Compliance and conflicts of interest?
              <span className="ml-4 text-slate-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="mt-3 text-sm text-slate-600">Published by <strong>{"BASTION RESEARCH"}</strong>, SEBI Registered Research Analyst <strong>{"INH000013712"}</strong>. We rely on publicly available sources (RHP/DRHP etc.). No guaranteed returns. Disclosures included in every brief.</p>
          </details>
        </div>
      </div>
    </section>
  );
};

export default Faq;
