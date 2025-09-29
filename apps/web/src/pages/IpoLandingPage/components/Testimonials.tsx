import React from "react";

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-16 md:py-20">
      <div className="container mx-auto max-w-7xl px-4">
        <h2 className="text-2xl md:text-3xl font-bold">What early users say</h2>
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <figure className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
            <blockquote className="text-slate-700">"Clear Apply/Avoid with solid rationale. Saved me hours per IPO."</blockquote>
            <figcaption className="mt-4 text-sm text-slate-500">— <span className="font-medium">Retail investor</span></figcaption>
          </figure>
          <figure className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
            <blockquote className="text-slate-700">"One page of conclusions and four pages of proof is perfect."</blockquote>
            <figcaption className="mt-4 text-sm text-slate-500">— <span className="font-medium">Small PMS analyst</span></figcaption>
          </figure>
          <figure className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
            <blockquote className="text-slate-700">"The red‑flags section alone is worth the fee."</blockquote>
            <figcaption className="mt-4 text-sm text-slate-500">— <span className="font-medium">Long‑term investor</span></figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
