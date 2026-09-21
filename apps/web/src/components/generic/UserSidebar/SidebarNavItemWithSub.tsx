import { ChevronDown, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const SidebarNavItemWithSub = ({
  item,
  isCollapsed,
  isOpen,
  isActive,
  isSubActive,
  location,
  toggleSubMenu,
  setIsMobileOpen,
}) => {
  return (
    <div>
      <div
        onClick={(e) => toggleSubMenu(item.name, e)}
        className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full cursor-pointer ${
          isCollapsed ? "justify-center" : ""
        } ${
          isActive || isSubActive
            ? "bg-[#1C2852] text-white"
            : "text-gray-200 hover:bg-[#C00000]"
        }`}
        title={isCollapsed ? item.name : undefined}
      >
        <item.icon className="h-5 w-5" />
        {!isCollapsed && (
          <>
            <span className="ml-3 flex-1">{item.name}</span>
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-gray-300" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-300" />
            )}
          </>
        )}
      </div>
      {/* Expanded mode submenu */}
      {!isCollapsed && isOpen && (
        <div className="ml-8 mt-1 space-y-1">
          {item.subItems.map((sub) => {
            const isSubActive = location.pathname === sub.path;
            return (
              <Link
                key={sub.name}
                to={sub.path}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                  isSubActive
                    ? "bg-white text-blue-900"
                    : "text-gray-200 hover:bg-red-900"
                }`}
              >
                <sub.icon className="h-4 w-4 mr-2" />
                {sub.name}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SidebarNavItemWithSub;
