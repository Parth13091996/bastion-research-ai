import React from "react";

type Update = {
  title: string;
  category: string;
  categoryColor: string;
  description: string;
  date: string;
  author: string;
  borderColor: string;
  dotColor: string;
  link?: string;
};

const updates: Update[] = [
  {
    title: "NVIDIA Earnings Beat: Raising Price Target",
    category: "Earnings Alert",
    categoryColor: "text-gray-600 bg-gray-100",
    description:
      "Exceptional earnings beat indicates our AI infrastructure thesis - raising price target to $180",
    date: "Jan 15",
    author: "Sarah Chen",
    borderColor: "border-red-200",
    dotColor: "bg-red-500",
    link: "#",
  },
  {
    title: "Market Update: Tech Rotation Continues",
    category: "Market Commentary",
    categoryColor: "text-gray-600 bg-gray-100",
    description:
      "Quality tech outperformance continues - maintain overweight in our core holdings",
    date: "Jan 12",
    author: "Research Team",
    borderColor: "border-yellow-200",
    dotColor: "bg-yellow-500",
    link: "#",
  },
  {
    title: "CrowdStrike: New Enterprise Wins Accelerating",
    category: "Stock Update",
    categoryColor: "text-blue-600 bg-blue-100",
    description:
      "Strong enterprise momentum supports our bullish thesis",
    date: "Jan 10",
    author: "Analyst Team",
    borderColor: "border-yellow-200",
    dotColor: "bg-yellow-500",
    link: "#",
  },
];

const LatestUpdates: React.FC = () => {
  return (
    <div className="bg-white rounded-lg p-3 sm:p-4 lg:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">
            Latest Updates
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">
            Recent market insights
          </p>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6 max-h-96 overflow-y-auto">
        {updates.map((update, index) => (
          <a
            key={index}
            href={update.link || "#"}
            className={`block border-l-4 ${update.borderColor} pl-3 sm:pl-4 hover:bg-gray-50 transition rounded-lg`}
          >
            <div className="flex items-center space-x-2 mb-2">
              <div
                className={`w-2 h-2 ${update.dotColor} rounded-full flex-shrink-0`}
              ></div>
              <span className="font-medium text-gray-900 text-sm sm:text-base">
                {update.title}
              </span>
            </div>
            <div
              className={`text-xs ${update.categoryColor} px-2 py-1 rounded mb-2 inline-block`}
            >
              {update.category}
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mb-2">
              {update.description}
            </p>
            <div className="text-xs text-gray-500">
              {update.date} • {update.author}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default LatestUpdates;
