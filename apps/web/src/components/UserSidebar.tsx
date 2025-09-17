import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
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
  BookOpen,
  User,
  ChevronDown,
  ChevronRight,
  LogOut,
  CreditCard,
  Settings,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/user/app/dashboard" },
  { name: "Recommendation", icon: TrendingUp, path: "/user/app/recommendation" },
  { name: "Research Hub", icon: FileText, path: "/user/app/research-hub" },

  // Parent Nav with submenus
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
  const location = useLocation();

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const toggleSidebar = () => setIsCollapsed((s) => !s);
  const toggleMobileMenu = () => setIsMobileOpen((s) => !s);

  const toggleSubMenu = (name) => {
    setOpenMenus((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div
        className={`flex items-center justify-between p-4 border-b border-gray-100 ${
          isCollapsed ? "justify-center" : ""
        }`}
      >
        {!isCollapsed ? (
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div className="ml-3">
              <h1 className="text-lg font-semibold text-gray-900">Bastion Research</h1>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
          </div>
        )}

        <button
          onClick={toggleSidebar}
          className="hidden lg:block p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft
            className={`h-5 w-5 text-gray-500 transition-transform duration-300 ${
              isCollapsed ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Platform / Nav */}
      <div className="px-4 pt-6">
        {!isCollapsed && (
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            PLATFORM
          </h2>
        )}

        <nav className="space-y-1">
          {navItems.map((item) => {
            const hasSub = item.subItems && item.subItems.length > 0;

            const isActive =
              location.pathname === item.path ||
              location.pathname.startsWith(item.path + "/");

            // if submenu exists, check if any child is active
            const isSubActive =
              hasSub &&
              item.subItems.some((sub) => location.pathname.startsWith(sub.path));

            const isOpen = openMenus[item.name] || isSubActive;

            return (
              <div key={item.name}>
                {hasSub ? (
                  <div
                    onClick={() => toggleSubMenu(item.name)}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full cursor-pointer ${
                      isCollapsed ? "justify-center" : ""
                    } ${
                      isActive || isSubActive
                        ? "bg-orange-50 text-orange-700 border-r-2 border-orange-500"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {!isCollapsed && (
                      <>
                        <span className="ml-3 flex-1">{item.name}</span>
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-500" />
                        )}
                      </>
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
                        ? "bg-orange-50 text-orange-700 border-r-2 border-orange-500"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {!isCollapsed && <span className="ml-3">{item.name}</span>}
                  </Link>
                )}

                {/* Submenus */}
                {!isCollapsed && hasSub && isOpen && (
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
                              ? "bg-orange-100 text-orange-700"
                              : "text-gray-600 hover:bg-gray-100"
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
          })}
        </nav>
      </div>

      {/* Quick Stats */}
      {!isCollapsed && (
        <div className="px-4 pt-8">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
            QUICK STATS
          </h2>

          <div className="space-y-3">
            {quickStats.map((stat) => (
              <div key={stat.label} className="flex items-center justify-between">
                <div className="flex items-center">
                  <stat.icon className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">{stat.label}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Profile */}
      <div className="mt-auto p-4 border-t border-gray-100">
        {!isCollapsed ? (
          <div className="flex items-center">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {profile.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </span>
              </div>
            )}

            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{profile.name}</p>
              <p className="text-xs text-gray-500">{profile.role}</p>
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
              <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
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
        className={`hidden lg:flex flex-col transition-all duration-300 h-screen ${
          isCollapsed ? "w-16" : "w-80"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
