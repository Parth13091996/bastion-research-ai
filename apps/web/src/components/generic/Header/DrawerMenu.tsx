// components/Header/DrawerMenu.jsx
import { Link } from "react-router-dom";

const DrawerMenu = ({ isOpen, toggleDrawer, openSubmenu, setOpenSubmenu }) => {
  return (
    <>
      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 right-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 md:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
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
                onClick={() => setOpenSubmenu(openSubmenu === "knowledgeCenter" ? null : "knowledgeCenter")}
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

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleDrawer}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default DrawerMenu;