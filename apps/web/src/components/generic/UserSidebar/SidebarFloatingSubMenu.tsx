import useConstants from "@/hooks/use-constants";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

const SidebarFloatingSubMenu = ({
  isCollapsed,
  openMenus,
  navItems,
  submenuPosition,
  submenuRef,
  setIsMobileOpen,
}) => {
  const location = useLocation();

  if (!isCollapsed) return null;
  const { BrandColors } = useConstants();
  return Object.entries(openMenus).map(([menuName, isOpen]) => {
    const parent = navItems.find((n) => n.name === menuName);
    if (!isOpen || !parent?.subItems || !submenuPosition) return null;
    return (
      <div
        ref={submenuRef}
        key={menuName}
        className="fixed left-16 top-0 shadow-lg rounded-lg py-2 w-48 border z-50 animate-slideIn"
        style={{
          top: submenuPosition.top - 16,
          backgroundColor: BrandColors.blue,
        }}
      >
        {parent.subItems.map((sub) => {
          const isSubActive = location.pathname === sub.path;
          return (
            <Link
              key={sub.name}
              to={sub.path}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center px-3 py-2 text-sm transition-colors ${
                isSubActive
                  ? "bg-blue-900 text-white"
                  : "text-white hover:bg-red-900 hover:text-white"
              }`}
            >
              <sub.icon className="h-4 w-4 mr-2" />
              {sub.name}
            </Link>
          );
        })}
      </div>
    );
  });
};
export default SidebarFloatingSubMenu;
