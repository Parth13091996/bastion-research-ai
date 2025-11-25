import { useLocation } from "react-router-dom";
import SidebarNavExternalItem from "./SidebarNavExternalItem";
import SidebarNavItem from "./SidebarNavItem";
import SidebarNavItemWithSub from "./SidebarNavItemWithSub";

const SidebarNav = ({
  navItems,
  isCollapsed,
  openMenus,
  setShowPricing,
  isAdmin,
  profile,
  navigate,
  setIsMobileOpen,
  toggleSubMenu,
}) => {
  const location = useLocation();

  return (
    <div className="px-2 pt-6">
      {!isCollapsed && (
        <h2 className="text-xs font-semibold uppercase tracking-wide mb-3 text-gray-300">
          PLATFORM
        </h2>
      )}

      <nav className="space-y-1">
        {navItems.map((item) => {
          const hasSub = item.subItems && item.subItems.length > 0;
          const isActive =
            location.pathname === item.path ||
            location.pathname.startsWith(item.path + "/");

          const isSubActive =
            hasSub &&
            item.subItems.some((sub) => location.pathname.startsWith(sub.path));

          const isOpen = openMenus[item.name] || isSubActive;
          if (isAdmin && item.name === "My Account") {
            return null;
          }

          if (!isAdmin && item.name === "Admin Panel") {
            return null;
          }

          return (
            <div key={item.name}>
              {hasSub ? (
                <SidebarNavItemWithSub
                  item={item}
                  isCollapsed={isCollapsed}
                  isOpen={isOpen}
                  isActive={isActive}
                  isSubActive={isSubActive}
                  location={location}
                  toggleSubMenu={toggleSubMenu}
                  setIsMobileOpen={setIsMobileOpen}
                />
              ) : item.path.startsWith("http") ? (
                <SidebarNavExternalItem
                  item={item}
                  isCollapsed={isCollapsed}
                  profile={profile}
                  setShowPricing={setShowPricing}
                  setIsMobileOpen={setIsMobileOpen}
                />
              ) : (
                <SidebarNavItem
                  item={item}
                  isCollapsed={isCollapsed}
                  isActive={isActive}
                  setShowPricing={setShowPricing}
                  profile={profile}
                  setIsMobileOpen={setIsMobileOpen}
                  navigate={navigate}
                />
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
};

export default SidebarNav;
