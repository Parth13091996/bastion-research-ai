import React from "react";
import { Bell, ChevronDown } from "lucide-react";

interface HeaderProps {
  activeFilter?: string;
  onFilterSelect?: (filter: string) => void;
  onAllIposClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAllIposClick }) => {
  return (
    <header className="w-full bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Left Section */}
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 text-white font-bold text-sm px-3 py-2 rounded-full">
            ID
          </div>
          <div>
            <h1 className="text-base font-semibold text-gray-800">
              IPO Decision Desk
            </h1>
            <p className="text-xs text-gray-500">
              SEBI RA Regn: RA- INH000013712 • Bastion Research
            </p>
          </div>
          <span className="ml-4 bg-indigo-50 text-indigo-600 text-xs px-2 py-1 rounded">
            Pilot
          </span>
        </div>

        {/* Center Nav */}
        <nav className="hidden md:flex space-x-6 text-sm font-medium text-gray-600">
          <a href="#" className="text-indigo-600">
            Dashboard
          </a>
       
           <a href="/all-ipos"
            className="hover:text-indigo-600"
          >
            All IPOs
            </a>
         
          <a href="/recommendations" className="hover:text-indigo-600">
            Recommendations
          </a>
          <a href="#" className="hover:text-indigo-600">
            Quick Avoids
          </a>
          <a href="#" className="hover:text-indigo-600">
            Archive
          </a>
          <a href="#" className="hover:text-indigo-600">
            Account
          </a>
        </nav>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          <button className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1.5 rounded-md">
            Join WhatsApp
          </button>
          <button className="hidden sm:flex items-center text-sm border px-3 py-1.5 rounded-md text-gray-700 hover:bg-gray-50">
            <span>Account</span> <ChevronDown className="w-4 h-4 ml-1" />
          </button>
          <button className="text-sm border px-3 py-1.5 rounded-md text-gray-700 hover:bg-gray-50">
            Logout
          </button>
          <Bell className="w-5 h-5 text-gray-500 cursor-pointer" />
        </div>
      </div>
    </header>
  );
};

export default Header;
