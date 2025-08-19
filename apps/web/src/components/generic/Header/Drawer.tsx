import { Link } from "react-router-dom";
import { HiX, HiOutlineUser, HiChevronDown } from "react-icons/hi";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
} from "react-icons/fa";
import { useState } from "react";
import MyAccountDropdown from "./MyAccountDropdown";

const Drawer = ({
  isNavOpen,
  setIsNavOpen,
  isProfileOpen,
  setIsProfileOpen,
}) => {
  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const DrawerFooter = () => (
    <div className="w-full border-t shadow-[0_-2px_6px_rgba(0,0,0,0.1)] p-4 flex justify-center space-x-4">
      <a
        href="https://facebook.com"
        target="_blank"
        rel="noopener noreferrer"
        className=" hover:text-red-800 text-xl transition-transform duration-300 hover:scale-110"
      >
        <FaFacebookF />
      </a>
      <a
        href="https://instagram.com"
        target="_blank"
        rel="noopener noreferrer"
        className=" hover:text-red-800 text-xl transition-transform duration-300 hover:scale-110"
      >
        <FaInstagram />
      </a>
      <a
        href="https://twitter.com"
        target="_blank"
        rel="noopener noreferrer"
        className=" hover:text-red-800 text-xl transition-transform duration-300 hover:scale-110"
      >
        <FaTwitter />
      </a>
      <a
        href="https://linkedin.com"
        target="_blank"
        rel="noopener noreferrer"
        className=" hover:text-red-800 text-xl transition-transform duration-300 hover:scale-110"
      >
        <FaLinkedinIn />
      </a>
    </div>
  );

  return (
    <>
      {/* Nav Drawer */}
      {isNavOpen && (
        <div className="fixed inset-0 z-[9999999] flex justify-end">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsNavOpen(false)}
          ></div>

          <div className="relative w-72 bg-white/70 backdrop-blur-md flex flex-col shadow-lg animate-slide-in-right">
            {/* Content */}
            <div className="flex-1 p-6 flex flex-col space-y-4 overflow-y-auto">
              <button
                onClick={() => setIsNavOpen(false)}
                className="self-end  text-2xl mb-4"
              >
                <HiX />
              </button>

              <Link
                to="/"
                className=" font-medium text-lg"
                onClick={() => setIsNavOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/bastion-core"
                className=" font-medium text-lg"
                onClick={() => setIsNavOpen(false)}
              >
                Bastion CORE
              </Link>

              {/* Knowledge Center - Collapsible */}
              <div>
                <button
                  onClick={() => toggleMenu("knowledge")}
                  className="flex justify-between items-center w-full  font-medium text-lg"
                >
                  Knowledge Center
                  <HiChevronDown
                    className={`transition-transform duration-300 ${
                      openMenu === "knowledge" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`ml-4 flex flex-col space-y-2 mt-2 overflow-hidden transition-all duration-300 ease-in-out ${
                    openMenu === "knowledge" ? "max-h-96" : "max-h-0"
                  }`}
                >
                  <Link
                    to="/newsletters-archive"
                    className=""
                    onClick={() => setIsNavOpen(false)}
                  >
                    Newsletter Archive
                  </Link>
                  <Link
                    to="/podcasts"
                    className=""
                    onClick={() => setIsNavOpen(false)}
                  >
                    Podcast (MADE IN INDIA)
                  </Link>
                  <Link
                    to="/webinars"
                    className=""
                    onClick={() => setIsNavOpen(false)}
                  >
                    Webinars
                  </Link>
                </div>
              </div>

              <Link
                to="/contact"
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-center font-medium"
                onClick={() => setIsNavOpen(false)}
              >
                Contact Us
              </Link>
            </div>

            {/* Footer always bottom */}
            <DrawerFooter />
          </div>
        </div>
      )}

      {/* Profile Drawer */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-[9999999] flex justify-end">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsProfileOpen(false)}
          ></div>

          <div className="relative w-72 bg-white/70 backdrop-blur-md flex flex-col shadow-lg animate-slide-in-right">
            {/* Content */}
            <div className="flex-1 p-6 flex flex-col space-y-4 overflow-y-auto">
              <button
                onClick={() => setIsProfileOpen(false)}
                className="self-end  text-2xl mb-4"
              >
                <HiX />
              </button>

              {/* My Account - Collapsible */}
              <div>
                <button
                  onClick={() => toggleMenu("account")}
                  className="flex justify-between items-center w-full  font-medium text-lg"
                >
                  <span className="flex items-center space-x-2">
                    <HiOutlineUser /> <span>My Account</span>
                  </span>
                  <HiChevronDown
                    className={`transition-transform duration-300 ${
                      openMenu === "account" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`ml-4 overflow-hidden transition-all duration-300 mt-2 ease-in-out ${
                    openMenu === "account" ? "max-h-96" : "max-h-0"
                  }`}
                >
                  <ul className="flex flex-col space-y-2 pl-2">
                    <li>
                      <a
                        href="/edit-profile"
                        className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 hover: transition-colors"
                      >
                        Edit Profile
                      </a>
                    </li>
                    <li>
                      <a
                        href="/subscription"
                        className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 hover: transition-colors"
                      >
                        Show Subscription
                      </a>
                    </li>
                    <li>
                      <a
                        href="/transaction-history"
                        className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 hover: transition-colors"
                      >
                        Transaction History
                      </a>
                    </li>
                    <li>
                      <a
                        href="/close-account"
                        className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 hover: transition-colors"
                      >
                        Close Account
                      </a>
                    </li>
                    <li>
                      <a
                        href="/logout"
                        className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 hover: transition-colors"
                      >
                        Logout
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Footer always bottom */}
            <DrawerFooter />
          </div>
        </div>
      )}
    </>
  );
};

export default Drawer;
