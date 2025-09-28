import React from "react";

const Footer = () => {
  return (
    <section className="bg-slate-100 border-t border-slate-200 py-8">
      {/* Compliance footer strip */}
      <div className="container mx-auto max-w-7xl px-4 text-xs text-slate-600 space-y-3">
        <div>
          <strong>Disclosures & Disclaimer:</strong> This service is published by <strong>{"<Firm Name>"}</strong>, <strong>SEBI Registered Research Analyst</strong> (RA Regn: <strong>{"<ID>"}</strong>) for informational/educational purposes for residents of India. It is not an offer or solicitation to buy/sell securities and does not guarantee returns. Investors should consider their risk profile and, if needed, seek independent advice. Analyst(s) do not have any known material conflict in the covered security as of the date of publication.
        </div>
        <div>
          © 2024 {"<Firm Name>"}. All rights reserved. Privacy • Terms • Contact: <a className="underline" href="mailto:support@email.com">support@email.com</a>
        </div>
      </div>
    </section>
  );
};

export default Footer;
