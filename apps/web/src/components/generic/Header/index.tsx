import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DesktopNav from "./DesktopNav";
import MobileNav from "./MobileNav";
import Drawer from "./Drawer";

// Main Header Component
const Header = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
    if (!isDrawerOpen) {
      setOpenSubmenu(null);
    }
  };
  const toggleSubmenu = (menuName) => {
    setOpenSubmenu(openSubmenu === menuName ? null : menuName);
  };

  // Detect scroll for shadow effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10); // add shadow after small scroll
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
                  src="src/files/header-logo.webp"
                  alt="Bastion Research"
                  className="h-8 md:h-10"
                />
              </Link>
            </div>
            <DesktopNav
              openSubmenu={openSubmenu}
              setOpenSubmenu={setOpenSubmenu}
            />
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
    </>
  );
};

export default Header;
