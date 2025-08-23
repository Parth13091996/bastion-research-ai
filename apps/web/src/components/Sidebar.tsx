import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  ChevronLeft,
  LayoutDashboard,
  Users,
  Settings,
  Briefcase,
  Menu,
  X,
  ChevronDown,
  CreditCard,
  UserPlus,
  FileText,
  Gift,
  Contact,
  Calendar,
  ClipboardList,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
  {
    name: "AR Members",
    icon: Users,
    subItems: [
      { name: "Manage Members", icon: Contact, path: "/admin/ar/members" },
      { name: "Manage Plans", icon: FileText, path: "/admin/ar/plans" },
      {
        name: "Manage Subscriptions",
        icon: Calendar,
        path: "/admin/ar/subscriptions",
      },
      { name: "Payment History", icon: CreditCard, path: "/admin/ar/payments" },
      { name: "Coupon Management", icon: Gift, path: "/admin/ar/coupons" },
    ],
  },
  {
    name: "Job Openings",
    icon: Briefcase,
    subItems: [
      {
        name: "Job Openings",
        icon: ClipboardList,
        path: "/admin/jobs/openings",
      },
      { name: "Add new Job", icon: UserPlus, path: "/admin/jobs/add" },
      {
        name: "Applications",
        icon: FileText,
        path: "/admin/jobs/applications",
      },
    ],
  },
  {
    name: "Users",
    icon: Users,
    subItems: [
      { name: "All Users", icon: Users, path: "/admin/users/all" },
      { name: "Add User", icon: UserPlus, path: "/admin/users/add" },
      { name: "Profile", icon: Contact, path: "/admin/users/profile" },
    ],
  },
  { name: "Settings", icon: Settings, path: "/admin/settings" },
];

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const toggleSection = (name: string) => {
    setOpenSections((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div
        className={`flex items-center justify-between p-4 ${isCollapsed ? "justify-center" : ""}`}
      >
        {!isCollapsed && <h1 className="text-2xl font-bold">Admin</h1>}
        <button
          onClick={toggleSidebar}
          className="hidden lg:block p-2 rounded-full hover:bg-gray-700"
        >
          <ChevronLeft
            className={`transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`}
          />
        </button>
      </div>
      <nav className="flex-1 mt-8 space-y-2 px-2">
        {navItems.map((item) => (
          <div key={item.name}>
            {item.subItems ? (
              <>
                <button
                  onClick={() => toggleSection(item.name)}
                  className={`flex items-center w-full ${isCollapsed ? "justify-center" : "justify-between"} p-2 rounded-lg transition-colors hover:bg-gray-700`}
                >
                  <div className="flex items-center">
                    <item.icon className="h-6 w-6" />
                    {!isCollapsed && <span className="ml-4">{item.name}</span>}
                  </div>
                  {!isCollapsed && (
                    <ChevronDown
                      className={`h-5 w-5 transition-transform ${
                        openSections[item.name] ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>
                {openSections[item.name] && !isCollapsed && (
                  <div className="pl-8 mt-2 space-y-2">
                    {item.subItems.map((subItem) => (
                      <NavLink
                        key={subItem.name}
                        to={subItem.path}
                        className={({ isActive }) =>
                          `flex items-center p-2 rounded-lg transition-colors ${
                            isActive ? "bg-gray-700" : "hover:bg-gray-700"
                          }`
                        }
                      >
                        <subItem.icon className="h-5 w-5" />
                        <span className="ml-4">{subItem.name}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <NavLink
                to={item.path!}
                className={({ isActive }) =>
                  `flex items-center p-2 rounded-lg transition-colors
                  ${isCollapsed ? "justify-center" : ""}
                  ${isActive ? "bg-gray-700" : "hover:bg-gray-700"}`
                }
                title={isCollapsed ? item.name : ""}
              >
                <item.icon className="h-6 w-6" />
                {!isCollapsed && <span className="ml-4">{item.name}</span>}
              </NavLink>
            )}
          </div>
        ))}
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-md"
      >
        {isMobileOpen ? <X /> : <Menu />}
      </button>

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-800 text-white transform
                   lg:hidden transition-transform duration-300 ease-in-out
                   ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {sidebarContent}
      </div>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30 lg:hidden"
          onClick={toggleMobileMenu}
        ></div>
      )}

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-gray-800 text-white transition-all duration-300
                   ${isCollapsed ? "w-20" : "w-64"}`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
