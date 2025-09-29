import React from "react";

interface HeaderProps {
  activeFilter: string;
  onFilterSelect: (filter: string) => void;
}

const Header = ({ activeFilter, onFilterSelect }: HeaderProps) => {
  const filters = ["All", "Ongoing", "Upcoming", "Closed"];

  const handleAllIPOsClick = () => {
    const element = document.getElementById("all-ipos-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-3">
        <h1 className="text-xl font-bold text-gray-800">IPO Dashboard</h1>
        <nav className="flex gap-2 flex-wrap justify-center">
          <button
            onClick={handleAllIPOsClick}
            className="px-4 py-2 rounded-full text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            All IPOs
          </button>
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => onFilterSelect(filter)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                activeFilter === filter
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {filter}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
