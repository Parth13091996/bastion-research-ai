import React from 'react';
import { ArrowRight } from 'lucide-react';

const SmartFrameworks = () => {
  const smartItems = [
    { 
      letter: "S", 
      title: "Strong Business", 
      desc: "Avoiding businesses exhibiting signs of weakness" 
    },
    { 
      letter: "M", 
      title: "Strong Management", 
      desc: "Not partnering with managements unwilling to share upside" 
    },
    { 
      letter: "A", 
      title: "Clean Accounts", 
      desc: "Making sure the numbers reported are reliable to form decisions" 
    },
    { 
      letter: "R", 
      title: "Reasonable Valuations", 
      desc: "Not buying anything at any price" 
    },
    { 
      letter: "T", 
      title: "Business Tailwinds", 
      desc: "Steer clear of businesses belonging to a dying or stagnant industry" 
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header with Badge */}
      <div className="flex justify-between items-start mb-16">
        <h1 className="text-4xl font-bold">
          <span className="text-red-600">SMART</span>
          <span className="text-gray-800"> Framework</span>
        </h1>
        
        {/* Preferred Badge */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 flex items-center justify-center shadow-lg">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-400 flex flex-col items-center justify-center text-xs font-bold text-red-800">
              <div className="text-[10px] leading-tight text-center">
                <div>CARE</div>
                <div>PREFERRED</div>
              </div>
            </div>
          </div>
          {/* Decorative stars around the badge */}
          <div className="absolute -top-2 -left-2 text-yellow-400 text-sm">⭐</div>
          <div className="absolute -top-1 -right-3 text-yellow-400 text-xs">⭐</div>
          <div className="absolute -bottom-2 -left-1 text-yellow-400 text-xs">⭐</div>
          <div className="absolute -bottom-1 -right-2 text-yellow-400 text-sm">⭐</div>
          <div className="absolute top-2 -left-4 text-yellow-400 text-xs">⭐</div>
          <div className="absolute top-3 -right-4 text-yellow-400 text-xs">⭐</div>
        </div>
      </div>

      {/* SMART Cards */}
      <div className="flex flex-wrap justify-center gap-6 max-w-7xl mx-auto">
        {smartItems.map(({ letter, title, desc }, idx) => (
          <div 
            key={idx} 
            className="group relative w-64 h-48 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer overflow-hidden"
          >
            {/* Default State - Show Letter and Arrow */}
            <div className="absolute inset-0 flex flex-col items-center justify-center group-hover:opacity-0 transition-opacity duration-500">
              <div className="text-6xl font-bold text-red-600 mb-4">{letter}</div>
              <ArrowRight className="w-6 h-6 text-gray-400" />
            </div>

            {/* Hover State - Show Title and Description */}
            <div className="absolute inset-0 flex flex-col justify-center p-6 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
              <div className="text-xl font-bold text-gray-800 mb-3">{title}</div>
              <div className="text-sm text-gray-600 leading-relaxed">{desc}</div>
            </div>

            {/* Subtle background animation on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
        ))}
      </div>

      {/* Bottom section with typing effect placeholder */}
      <div className="mt-16 text-center">
        <div className="text-xl font-semibold text-gray-700 inline-block border-r-2 border-red-600 pr-2 animate-pulse">
          Dynamic content would appear here...
        </div>
      </div>
    </div>
  );
};

export default SmartFrameworks;