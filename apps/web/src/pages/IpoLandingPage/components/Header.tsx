import React from "react";

interface HeaderProps {
  activeSection: string;
  onMenuClick: (id: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeSection, onMenuClick }) => {
  const menuItems = [
    { id: "fit", label: "Fit" },
    { id: "sample", label: "Sample" },
    { id: "how", label: "How it works" },
    { id: "pricing", label: "Pricing" },
    { id: "pilot", label: "Pilot" },
    { id: "testimonials", label: "Testimonials" },
    { id: "faq", label: "FAQ" },
  ];

  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow z-50">
      <nav className="max-w-6xl mx-auto flex justify-between items-center py-4 px-6">
        <h1 className="text-xl font-bold">My Landing Page</h1>
        <ul className="flex space-x-6">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onMenuClick(item.id)}
                className={`text-sm font-medium transition-colors duration-200 ${
                  activeSection === item.id
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-blue-500"
                }`}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
