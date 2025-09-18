import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../../public/media/favicon.webp";
import {
  ChevronLeft,
  LayoutDashboard,
  TrendingUp,
  FileText,
  Menu,
  X,
  Target,
  BarChart3,
  Percent,
  User,
  ChevronDown,
  ChevronRight,
  LogOut,
  CreditCard,
  Settings,
} from "lucide-react";

// Brand Colors
const BrandColors = {
  red: "#C00000",
  blue: "#1C2852",
  beige: "#C4B696",
  light: "#E6E6E6",
};

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/user/app/dashboard" },
  { name: "Recommendation", icon: TrendingUp, path: "/user/app/recommendation" },
  { name: "Research Hub", icon: FileText, path: "/user/app/research-hub" },
  {
    name: "My Account",
    icon: User,
    path: "/user/app/account",
    subItems: [
      { name: "Edit Profile", path: "/user/app/account/edit-profile", icon: Settings },
      { name: "Show Subscription", path: "/user/app/account/subscription", icon: CreditCard },
      { name: "Transaction History", path: "/user/app/account/transactions", icon: BarChart3 },
      { name: "Logout", path: "/logout", icon: LogOut },
    ],
  },
];

const quickStats = [
  { label: "Active Picks", value: "12", icon: Target },
  { label: "Avg. Return", value: "+18.5%", icon: BarChart3 },
  { label: "Win Rate", value: "87%", icon: Percent },
];

const profile = {
  name: "Bastion-User",
  role: "Type of User",
  avatarUrl: null,
};

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState({});
  const [submenuPosition, setSubmenuPosition] = useState(null);
  const location = useLocation();

  const sidebarRef = useRef(null);
  const submenuRef = useRef(null);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Close submenu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        submenuRef.current &&
        !submenuRef.current.contains(event.target)
      ) {
        setOpenMenus({});
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSidebar = () => setIsCollapsed((s) => !s);
  const toggleMobileMenu = () => setIsMobileOpen((s) => !s);

  const toggleSubMenu = (name, e) => {
    if (isCollapsed) {
      // Floating submenu position when collapsed
      const rect = e.currentTarget.getBoundingClientRect();
      setSubmenuPosition({ top: rect.top, height: rect.height });
    }
    setOpenMenus((prev) => {
      if (prev[name]) return {}; // close if already open
      return { [name]: true }; // open only this menu
    });
  };

  const sidebarContent = (
    <div
      ref={sidebarRef}
      className="flex flex-col h-full relative text-white"
      style={{ backgroundColor: BrandColors.blue }}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between p-4 border-b border-gray-700 ${
          isCollapsed ? "justify-center" : ""
        }`}
      >
        {!isCollapsed ? (
          <div className="flex items-center">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <img src={logo} alt="Logo" className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <h1 className="text-lg font-semibold text-white">
                Bastion Research
              </h1>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <img src={logo} alt="Logo" className="h-5 w-5" />
            </div>
          </div>
        )}

        <button
          onClick={toggleSidebar}
          className="hidden lg:block"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft
            className={`h-5 w-5 text-gray-300 transition-transform duration-300 ${
              isCollapsed ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Nav */}
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
              hasSub && item.subItems.some((sub) => location.pathname.startsWith(sub.path));

            const isOpen = openMenus[item.name] || isSubActive;

            return (
              <div key={item.name}>
                {hasSub ? (
                  <div>
                    <div
                      onClick={(e) => toggleSubMenu(item.name, e)}
                      className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full cursor-pointer ${
                        isCollapsed ? "justify-center" : ""
                      } ${
                        isActive || isSubActive
                          ? "bg-blue-900 text-white"
                          : "text-gray-200 hover:bg-red-900"
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
                ) : (
                  <Link
                    to={item.path}
                    onClick={() => setIsMobileOpen(false)}
                    title={isCollapsed ? item.name : undefined}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full ${
                      isCollapsed ? "justify-center" : ""
                    } ${
                      isActive
                        ? "bg-white text-blue-900"
                        : "text-gray-200 hover:bg-red-900"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {!isCollapsed && <span className="ml-3">{item.name}</span>}
                  </Link>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Floating submenu (collapsed mode) */}
      {isCollapsed &&
        Object.entries(openMenus).map(([menuName, isOpen]) => {
          const parent = navItems.find((n) => n.name === menuName);
          if (!isOpen || !parent?.subItems || !submenuPosition) return null;
          return (
            <div
              ref={submenuRef}
              key={menuName}
              className="fixed left-16 top-0 shadow-lg rounded-lg py-2 w-48 border z-50 animate-slideIn"
              style={{ top: submenuPosition.top - 16, backgroundColor: BrandColors.blue }} // Updated line
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
        })}

      {/* Quick Stats */}
      {!isCollapsed && (
        <div className="px-4 pt-8">
          <h2 className="text-xs font-semibold uppercase tracking-wide mb-4 text-gray-300">
            QUICK STATS
          </h2>
          <div className="space-y-3">
            {quickStats.map((stat) => (
              <div key={stat.label} className="flex items-center justify-between text-gray-200">
                <div className="flex items-center">
                  <stat.icon className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm">{stat.label}</span>
                </div>
                <span className="text-sm font-semibold text-white">
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Profile */}
      <div className="mt-auto p-4 border-t border-gray-700">
        {!isCollapsed ? (
          <div className="flex items-center">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {profile.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </span>
              </div>
            )}
            <div className="ml-3 text-white">
              <p className="text-sm font-medium">{profile.name}</p>
              <p className="text-xs text-gray-300">{profile.role}</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {profile.name[0] || "B"}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white shadow-lg text-gray-700 rounded-lg border"
        aria-label="Open menu"
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-80 transform lg:hidden transition-transform duration-300 ease-in-out ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </div>

      {/* Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30 lg:hidden"
          onClick={toggleMobileMenu}
        ></div>
      )}

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col transition-all duration-300 h-screen z-40 ${ // Added `z-40` here
          isCollapsed ? "w-16" : "w-80"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}