import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useIsMobile } from "../../../hooks/use-mobile";
import DesktopNav from "./DesktopNav";
import Drawer from "./Drawer";
import MobileNav from "./MobileNav";

// Main Header Component
const Header = () => {
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const [isOverFooter, setIsOverFooter] = useState(false);
  const isMobile = useIsMobile(486);
  // Detect scroll for shadow effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10); // add shadow after small scroll
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Detect scroll for sticky button on BastionCore
  useEffect(() => {
    if (location.pathname === "/bastion-core") {
      const handleScroll = () => {
        const subscribeDiv = document.getElementById("subscribe-button-div");
        const header = document.querySelector("header");
        const footer = document.querySelector("footer");
        if (subscribeDiv && header) {
          const rect = subscribeDiv.getBoundingClientRect();
          const headerHeight = header.offsetHeight;
          setShowSticky(rect.top <= headerHeight);
        }
        if (footer) {
          const footerRect = footer.getBoundingClientRect();
          setIsOverFooter(footerRect.top <= window.innerHeight);
        }
      };
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    } else {
      setShowSticky(false);
      setIsOverFooter(false);
    }
  }, [location.pathname]);

  return (
    <>
      <header
        className={`fixed top-0 z-[9999] left-0 w-full py-6 transition-shadow duration-300 ${
          scrolled ? "shadow-[0_2px_6px_rgba(0,0,0,0.08)]" : "shadow-none"
        } bg-white/60 backdrop-blur-md border-b border-white/20`}
        itemType="https://schema.org/Organization"
        itemScope
      >
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/">
                <img
                  src="/media/header-logo.webp"
                  alt="Bastion Research"
                  className="h-8 md:h-10"
                />
              </Link>
            </div>
            {!isMobile && showSticky && (
              <Link to="/register">
                <button
                  className={`ml-19 px-4 py-2 rounded-xl transition-colors ${
                    isOverFooter
                      ? "bg-white text-[#C00000] hover:bg-gray-100"
                      : "bg-[#C00000] text-white hover:bg-[#a00000]"
                  }`}
                >
                  Subscribe Now
                </button>
              </Link>
            )}
            <DesktopNav setOpenSubmenu={setOpenSubmenu} />
            <MobileNav
              setIsNavOpen={setIsNavOpen}
              setIsProfileOpen={setIsProfileOpen}
            />
          </div>
        </div>
      </header>
      <Drawer
        isNavOpen={isNavOpen}
        setIsNavOpen={setIsNavOpen}
        isProfileOpen={isProfileOpen}
        setIsProfileOpen={setIsProfileOpen}
      />

      {isMobile && showSticky && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <Link to="/register">
            <button
              className={`px-6 py-3 rounded-xl transition-colors shadow-lg ${
                isOverFooter
                  ? "bg-white text-[#C00000] hover:bg-gray-100"
                  : "bg-[#C00000] text-white hover:bg-[#a00000]"
              }`}
            >
              Subscribe Now
            </button>
          </Link>
        </div>
      )}
    </>
  );
};

export default Header;
