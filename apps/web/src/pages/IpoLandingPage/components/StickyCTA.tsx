import React from "react";

const StickyCTA = () => {
  return (
    <>
      {/* Sticky CTA */}
      <div className="fixed bottom-4 inset-x-0 z-40 px-4 md:hidden">
        <div className="mx-auto max-w-7xl">
          <button 
            onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            className="block w-full text-center rounded-xl bg-indigo-600 text-white px-5 py-3 font-semibold shadow-lg hover:bg-indigo-700"
          >
            Start 14‑day trial ₹99
          </button>
        </div>
      </div>
    </>
  );
};

export default StickyCTA;
