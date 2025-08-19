// components/Header/DesktopNav.jsx
import { Link } from "react-router-dom";
import MyAccountDropdown from "./MyAccountDropdown";

const DesktopNav = ({ openSubmenu, setOpenSubmenu }) => {
  return (
    <nav className="hidden md:flex items-center space-x-8">
      <Link
        to="/"
        className="relative text-gray-700 hover:text-red-600 transition-colors group"
      >
        Home
        <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-red-600 transition-all duration-300 group-hover:w-full"></span>
      </Link>

      <Link
        to="/bastion-core"
        className="relative text-gray-700 hover:text-red-600 transition-colors group"
      >
        Bastion CORE
        <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-red-600 transition-all duration-300 group-hover:w-full"></span>
      </Link>

      {/* Knowledge Center Dropdown (Hover) */}
      <div className="relative group">
        <div
          className="relative text-gray-700 hover:text-red-600 transition-colors flex items-center cursor-pointer"
          onMouseEnter={() => setOpenSubmenu("desktopKnowledgeCenter")}
          onMouseLeave={() => setOpenSubmenu(null)}
        >
          Knowledge Center
          <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
          <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-red-600 transition-all duration-300 group-hover:w-full"></span>
        </div>

        <div
          className="absolute left-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
          onMouseEnter={() => setOpenSubmenu("desktopKnowledgeCenter")}
          onMouseLeave={() => setOpenSubmenu(null)}
        >
          <Link to="/newsletters-archive" className="block px-4 py-2 text-gray-700 hover:text-red-600">
            Newsletter Archive
          </Link>
          <Link to="/podcasts" className="block px-4 py-2 text-gray-700 hover:text-red-600">
            Podcast (MADE IN INDIA)
          </Link>
          <Link to="/webinars" className="block px-4 py-2 text-gray-700 hover:text-red-600">
            Webinars
          </Link>
        </div>
      </div>

      <Link
        to="/login"
        className="text-gray-700 hover:text-red-600 flex items-center transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        Login
      </Link>

      <MyAccountDropdown />

      <Link
        to="/contact"
        className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
      >
        Contact Us
      </Link>
    </nav>
  );
};

export default DesktopNav;