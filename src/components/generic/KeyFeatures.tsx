import { useState } from "react";
import { ArrowRight, ChevronUp } from "lucide-react";

const cardData = [
  {
    title: "In-Depth Business Understanding",
    content: [
      "In-depth Business Understanding",
      "Things in Favor of the Company",
      "Things against the Company",
      "List of KPIs for each Company",
      "Sense on Valuation"
    ],
  },
  {
    title: "Continuous Tracking",
    content: [
      "Result Update",
      "Con Call Update", 
      "Progress on KPIs",
      "Other Important Update (if any)"
    ],
  },
  {
    title: 'Bastion CORE "Preferred" Seal',
    content: [
      "Companies with the most compelling prospects.",
      "Selection based on the SMART framework."
    ],
  },
  {
    title: "QUANT Screens",
    content: [
      "Multiple QUANT Screens for ideation",
      "Each having 25-30 companies based on chosen parameters",
      "Refresh Frequency – Monthly"
    ],
  },
];

const KeyFeatures = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background p-8 relative">
      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 gap-8">
          {cardData.map((card, index) => (
            <div
              key={index}
              className="relative h-64"
              style={{ perspective: '1000px' }}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Card Container with Flip Effect */}
              <div 
                className={`relative w-full h-full transition-all duration-600 preserve-3d ${
                  hoveredCard === index ? 'animate-flip-to-back' : ''
                }`}
                style={{
                  transformStyle: 'preserve-3d',
                  transform: hoveredCard === index ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  transition: 'transform 0.6s ease-in-out'
                }}
              >
                {/* Front Face - Red Card */}
                <div 
                  className="absolute inset-0 w-full h-full backface-hidden"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="w-full h-full bg-primary rounded-2xl shadow-lg border-4 border-gray-200 p-8 flex flex-col justify-center items-center text-white text-center">
                    <h2 className="text-xl font-semibold leading-tight mb-4">{card.title}</h2>
                    <ArrowRight className="h-6 w-6" />
                  </div>
                </div>

                {/* Back Face - Dark Blue Card with Content */}
                <div 
                  className="absolute inset-0 w-full h-full backface-hidden"
                  style={{ 
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)'
                  }}
                >
                  <div className="w-full h-full bg-secondary rounded-2xl shadow-lg border-4 border-gray-200 p-8 flex items-center justify-center">
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-white mb-6">{card.title}</h3>
                      <ul className="text-white leading-relaxed space-y-3">
                        {card.content.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start">
                            <span className="text-white mr-3">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Right Scroll Button */}
      <div className="fixed bottom-8 right-8 z-30">
        <button className="w-12 h-12 bg-primary rounded-full shadow-lg flex items-center justify-center text-white hover:bg-primary/90 transition-colors">
          <ChevronUp className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default KeyFeatures;