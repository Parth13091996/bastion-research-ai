import { useState } from "react";
import { Link } from "react-router-dom";
import DesktopNav from "./DesktopNav";
import DrawerMenu from "./DrawerMenu";
import MobileNavIcons from "./MobileNav";

const Header = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
    if (!isDrawerOpen) {
      setOpenSubmenu(null);
    }
  };

  return (
    <header className="bg-white shadow-sm py-6">
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/">
              <img
                src="https://bastionresearch.in/wp-content/uploads/2023/03/BASTION-RESEARCH-_-logo-min-e1680501100187-190x45.png"
                alt="Bastion Research"
                className="h-8 md:h-10"
              />
            </Link>
          </div>

          <DesktopNav openSubmenu={openSubmenu} setOpenSubmenu={setOpenSubmenu} />

          <MobileNavIcons toggleDrawer={toggleDrawer} />
        </div>
      </div>

      {/* Mobile Drawer & Overlay */}
      <DrawerMenu
        isOpen={isDrawerOpen}
        toggleDrawer={toggleDrawer}
        openSubmenu={openSubmenu}
        setOpenSubmenu={setOpenSubmenu}
      />
    </header>
  );
};

export default Header;