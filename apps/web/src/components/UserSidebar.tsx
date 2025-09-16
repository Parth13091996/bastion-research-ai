import { useState } from "react";
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
} from "lucide-react";

const navItems = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/user/app/dashboard",
    isActive: true
  },
  {
    name: "Recommendation",
    icon: TrendingUp,
    path: "/user/app/recommendation"
  },
  {
    name: "Research Hub",
    icon: FileText,
    path: "/user/app/research-hub"
  },
];


const quickStats = [
  {
    label: "Active Picks",
    value: "12",
    icon: Target,
  },
  {
    label: "Avg. Return", 
    value: "+18.5%",
    icon: BarChart3,
  },
  {
    label: "Win Rate",
    value: "87%", 
    icon: Percent,
  },
];

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b border-gray-100 ${isCollapsed ? "justify-center" : ""}`}>
        {!isCollapsed && (
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div className="ml-3">
              <h1 className="text-lg font-semibold text-gray-900">Bastion Research</h1>
            </div>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="hidden lg:block p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft
            className={`h-5 w-5 text-gray-500 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* Platform Section */}
      <div className="px-4 pt-6">
        {!isCollapsed && (
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            PLATFORM
          </h2>
        )}
        <nav className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.name}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full
                ${isCollapsed ? "justify-center" : ""}
                ${item.isActive 
                  ? "bg-orange-50 text-orange-700 border-r-2 border-orange-500" 
                  : "text-gray-700 hover:bg-gray-100"
                }`}
              title={isCollapsed ? item.name : ""}
            >
              <item.icon className="h-5 w-5" />
              {!isCollapsed && <span className="ml-3">{item.name}</span>}
            </button>
          ))}
        </nav>
      </div>

      {/* Quick Stats Section */}
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
                <span className="text-sm font-semibold text-gray-900">
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Profile Section */}
      <div className="mt-auto p-4 border-t border-gray-100">
        {!isCollapsed ? (
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">BU</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Bastion-User</p>
              <p className="text-xs text-gray-500">Type of User</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">BA</span>
            </div>
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
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-80 transform
                   lg:hidden transition-transform duration-300 ease-in-out
                   ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {sidebarContent}
      </div>
      
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30 lg:hidden"
          onClick={toggleMobileMenu}
        ></div>
      )}

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col transition-all duration-300 h-screen
                   ${isCollapsed ? "w-16" : "w-80"}`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;