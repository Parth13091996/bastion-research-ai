import { Link } from "react-router-dom";
import { useState } from "react";

const Header = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
    if (!isDrawerOpen) {
      setOpenSubmenu(null); // Reset submenu state when closing drawer
    }
  };

  const toggleSubmenu = (menuName) => {
    setOpenSubmenu(openSubmenu === menuName ? null : menuName);
  };

  return (
    <header
      className="bg-white shadow-sm py-6"
      itemtype="https://schema.org/Organization"
      itemscope
    >
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/">
              <img
                src="https://bastionresearch.in/wp-content/uploads/2023/03/BASTION-RESEARCH-_-logo-min-e1680501100187-190x45.png"
                alt="Bastion Research"
                className="h-8 md:h-10"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
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
            <div className="relative group">
              <div
                className="relative text-gray-700 hover:text-red-600 transition-colors group-hover:text-red-600 flex items-center cursor-pointer"
                onMouseEnter={() => setOpenSubmenu("desktopKnowledgeCenter")}
                onMouseLeave={() => setOpenSubmenu(null)}
              >
                Knowledge Center
                <svg
                  className="ml-1 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-red-600 transition-all duration-300 group-hover:w-full"></span>
              </div>
              <div
                className="absolute left-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
                onMouseEnter={() => setOpenSubmenu("desktopKnowledgeCenter")}
                onMouseLeave={() => setOpenSubmenu(null)}
              >
                <Link
                  to="/newsletters-archive"
                  className="block px-4 py-2 text-gray-700 hover:text-red-600"
                >
                  Newsletter Archive
                </Link>
                <Link
                  to="/podcasts"
                  className="block px-4 py-2 text-gray-700 hover:text-red-600"
                >
                  Podcast (MADE IN INDIA)
                </Link>
                <Link
                  to="/webinars"
                  className="block px-4 py-2 text-gray-700 hover:text-red-600"
                >
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
            <Link
              to="/contact"
              className="bg-primary text-white px-6 py-2 !rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Contact Us
            </Link>
          </nav>

          {/* Mobile Navigation Icons */}
          <div className="flex items-center space-x-6 md:hidden">
            {/* Login Icon */}
            <Link to="/login" className="text-gray-700 hover:text-red-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
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
            </Link>

            {/* Contact Icon */}
            <Link to="/contact" className="text-gray-700 hover:text-red-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </Link>

            {/* Hamburger Menu */}
            <button
              onClick={toggleDrawer}
              className="text-gray-700 hover:text-red-600 focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isDrawerOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 right-0 w-64 bg-white shadow-lg transform ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out z-50 md:hidden`}
      >
        <div className="px-6 py-4 h-full overflow-y-auto">
          <nav className="flex flex-col space-y-2 mt-4">
            <Link
              to="/"
              className="text-gray-700 hover:text-red-600 transition-colors py-3 px-2 rounded hover:bg-gray-50"
              onClick={toggleDrawer}
            >
              Home
            </Link>
            <Link
              to="/bastion-core"
              className="text-gray-700 hover:text-red-600 transition-colors py-3 px-2 rounded hover:bg-gray-50"
              onClick={toggleDrawer}
            >
              Bastion CORE
            </Link>

            {/* Collapsible Knowledge Center Menu */}
            <div className="flex flex-col">
              <button
                onClick={() => toggleSubmenu("knowledgeCenter")}
                className="flex items-center justify-between text-gray-700 hover:text-red-600 transition-colors py-3 px-2 rounded hover:bg-gray-50 w-full text-left"
                aria-expanded={openSubmenu === "knowledgeCenter"}
              >
                <span>Knowledge Center</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 transform transition-transform ${
                    openSubmenu === "knowledgeCenter" ? "rotate-180" : ""
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              <div
                className={`overflow-hidden transition-all duration-200 ${
                  openSubmenu === "knowledgeCenter" ? "max-h-40" : "max-h-0"
                }`}
              >
                <div className="pl-4 flex flex-col space-y-1 my-1">
                  <Link
                    to="/newsletters-archive"
                    className="text-gray-600 hover:text-red-600 transition-colors py-2 px-2 rounded hover:bg-gray-50"
                    onClick={toggleDrawer}
                  >
                    Newsletter Archive
                  </Link>
                  <Link
                    to="/podcast"
                    className="text-gray-600 hover:text-red-600 transition-colors py-2 px-2 rounded hover:bg-gray-50"
                    onClick={toggleDrawer}
                  >
                    Podcast (MADE IN INDIA)
                  </Link>
                  <Link
                    to="/webinars"
                    className="text-gray-600 hover:text-red-600 transition-colors py-2 px-2 rounded hover:bg-gray-50"
                    onClick={toggleDrawer}
                  >
                    Webinars
                  </Link>
                </div>
              </div>
            </div>
          </nav>
        </div>
      </div>

      {/* Overlay when drawer is open */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleDrawer}
          aria-hidden="true"
        ></div>
      )}
    </header>
  );
};

export default Header;
