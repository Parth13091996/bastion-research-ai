import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { HiX, HiOutlineUser } from "react-icons/hi";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
} from "react-icons/fa";

const Drawer = ({
  isNavOpen,
  setIsNavOpen,
  isProfileOpen,
  setIsProfileOpen,
}) => {
  const navDrawerRef = useRef<HTMLDivElement | null>(null);
  const profileDrawerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const targetNode = event.target as Node | null;

      if (isNavOpen && navDrawerRef.current && targetNode && !navDrawerRef.current.contains(targetNode)) {
        setIsNavOpen(false);
      }
      if (
        isProfileOpen &&
        profileDrawerRef.current &&
        targetNode &&
        !profileDrawerRef.current.contains(targetNode)
      ) {
        setIsProfileOpen(false);
      }
    };

    if (isNavOpen || isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isNavOpen, isProfileOpen, setIsNavOpen, setIsProfileOpen]);

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

          <div ref={navDrawerRef} className="relative w-72 bg-white/70 backdrop-blur-md flex flex-col shadow-lg animate-slide-in-right">
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

              {/* Knowledge Center - Always Open */}
              <div>
                <div className="font-medium text-lg mb-2">Knowledge Center</div>
                <div className="ml-4 flex flex-col space-y-2">
                  <Link
                    to="/newsletters-archive"
                    onClick={() => setIsNavOpen(false)}
                  >
                    Newsletter Archive
                  </Link>
                  <Link to="/podcasts" onClick={() => setIsNavOpen(false)}>
                    Podcast (MADE IN INDIA)
                  </Link>
                  <Link to="/webinars" onClick={() => setIsNavOpen(false)}>
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

          <div ref={profileDrawerRef} className="relative w-72 bg-white/70 backdrop-blur-md flex flex-col shadow-lg animate-slide-in-right">
            {/* Content */}
            <div className="flex-1 p-6 flex flex-col space-y-4 overflow-y-auto">
              <button
                onClick={() => setIsProfileOpen(false)}
                className="self-end  text-2xl mb-4"
              >
                <HiX />
              </button>

              {/* My Account - Always Open */}
              <div>
                <div className="flex items-center space-x-2 font-medium text-lg mb-2">
                  <HiOutlineUser /> <span>My Account</span>
                </div>
                <ul className="flex flex-col space-y-2 ml-4">
                  <li>
                    <a
                      href="/edit-profile"
                      className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Edit Profile
                    </a>
                  </li>
                  <li>
                    <a
                      href="/subscription"
                      className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Show Subscription
                    </a>
                  </li>
                  <li>
                    <a
                      href="/transaction-history"
                      className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Transaction History
                    </a>
                  </li>
                  <li>
                    <a
                      href="/close-account"
                      className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Close Account
                    </a>
                  </li>
                  <li>
                    <a
                      href="/logout"
                      className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Logout
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <DrawerFooter />
          </div>
        </div>
      )}
    </>
  );
};

export default Drawer;
