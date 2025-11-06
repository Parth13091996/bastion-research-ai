import React from "react";

const BetaBanner: React.FC = () => {
  return (
    <div className="w-full z-[99999] bg-amber-100 text-amber-900 text-center text-sm md:text-[15px] px-3 py-2 border-b border-amber-200">
      {/* <span className="font-medium">Beta Preview:</span> This product is in
      active development. Features may change and you may encounter minor
      issues. We appreciate your feedback. */}
    </div>
  );
};

export default BetaBanner;
