import React, { useState } from "react";
import { Menu, X } from "lucide-react";

interface HeaderProps {
  activeSection: string;
  onMenuClick: (id: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeSection, onMenuClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: "fit", label: "Fit" },
    { id: "sample", label: "Sample" },
    { id: "how", label: "How it works" },
    { id: "pricing", label: "Pricing" },
    { id: "pilot", label: "Pilot" },
    { id: "faq", label: "FAQ" },
  ];

  const handleNavClick = (id: string) => {
    onMenuClick(id);
    setIsMenuOpen(false); // close menu on mobile after click
  };

  const handleLogoClick = () => {
    document.getElementById('top')?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false); // close menu on mobile after click
  };

  return (
    <header className=" top-0 left-0 w-full bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={handleLogoClick} className="flex items-center gap-2 cursor-pointer">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">ID</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">
              IPO Decision Desk
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-sm font-medium ${
                  activeSection === item.id
                    ? "text-indigo-600"
                    : "text-gray-700 hover:text-gray-900"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* CTA Buttons (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() =>
                document
                  .getElementById("sample")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-6 py-2 text-sm font-semibold hover:bg-slate-100 transition-colors"
            >
              See sample
            </button>
            <button
              onClick={() => handleNavClick("pricing")}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
            >
              Start 14-day trial ₹99
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-gray-900 focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <nav className="flex flex-col px-4 py-3 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-base font-medium text-left w-full ${
                  activeSection === item.id
                    ? "text-indigo-600"
                    : "text-gray-700 hover:text-gray-900"
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="mt-4 space-y-2">
              <button
                onClick={() =>
                  document
                    .getElementById("sample")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="w-full rounded-lg border border-slate-300 px-6 py-2 text-sm font-semibold hover:bg-slate-100 transition-colors"
              >
                See sample
              </button>
              <button
                onClick={() => handleNavClick("pricing")}
                className="w-full bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
              >
                Start 14-day trial ₹99
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
