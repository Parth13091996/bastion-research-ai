import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { HiX, HiOutlineUser } from "react-icons/hi";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
} from "react-icons/fa";
import { AppRoutes } from "@/routes/app-routes";
import { useAuth } from "@/contexts/AuthContext";

const Drawer = ({
  isNavOpen,
  setIsNavOpen,
  isProfileOpen,
  setIsProfileOpen,
}) => {
  const { user, logout } = useAuth();
  const navDrawerRef = useRef<HTMLDivElement | null>(null);
  const profileDrawerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const targetNode = event.target as Node | null;

      if (
        isNavOpen &&
        navDrawerRef.current &&
        targetNode &&
        !navDrawerRef.current.contains(targetNode)
      ) {
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

          <div
            ref={navDrawerRef}
            className="relative w-72 bg-white/70 backdrop-blur-md flex flex-col shadow-lg animate-slide-in-right"
          >
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
                  <Link
                    to="/sector-deep-dives"
                    onClick={() => setIsNavOpen(false)}
                  >
                    Sector Deep Dives
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
                to={AppRoutes.contact}
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

          <div
            ref={profileDrawerRef}
            className="relative w-72 bg-white/70 backdrop-blur-md flex flex-col shadow-lg animate-slide-in-right"
          >
            {/* Content */}
            <div className="flex-1 p-6 flex flex-col space-y-4 overflow-y-auto">
              <button
                onClick={() => setIsProfileOpen(false)}
                className="self-end  text-2xl mb-4"
              >
                <HiX />
              </button>

              {/* My Account - Only show when user is logged in */}
              {user?.id ? (
                <div>
                  <div className="flex items-center space-x-3 mb-4 p-3 bg-white/80 rounded-xl border border-gray-100 shadow-sm">
                    {user?.profile_picture ? (
                      <img
                        src={user.profile_picture}
                        alt="User"
                        className="h-10 w-10 rounded-full object-cover border-2 border-red-600"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {user?.first_name?.[0] || user?.username?.[0] || "U"}
                      </div>
                    )}
                    <div className="overflow-hidden min-w-0">
                      <div className="font-semibold text-gray-900 truncate">
                        {`${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username || "User"}
                      </div>
                      <div className="text-xs text-gray-500 truncate">{user.email}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Link
                      to="/user/app/dashboard"
                      onClick={() => setIsProfileOpen(false)}
                      className="block px-3 py-2.5 rounded-lg text-gray-800 font-medium hover:bg-red-50 hover:text-red-600 transition-colors bg-red-50/50 border border-red-100 text-sm"
                    >
                      Go to My Account Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors font-medium text-sm"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-600 text-sm mb-4">You are not logged in.</p>
                  <Link
                    to={AppRoutes.login}
                    onClick={() => setIsProfileOpen(false)}
                    className="block w-full py-2.5 px-4 bg-primary text-white rounded-xl font-medium text-center hover:bg-red-700 transition-colors shadow-md"
                  >
                    Login
                  </Link>
                </div>
              )}
            </div>

            <DrawerFooter />
          </div>
        </div>
      )}
    </>
  );
};

export default Drawer;
