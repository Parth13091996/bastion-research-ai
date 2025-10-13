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
  Mail,
  Mic,
  Video,
  Star,
} from "lucide-react";
import { AppRoutes } from "../routes/app-routes";

const navItems = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: AppRoutes.adminDashboard(),
  },
  {
    name: "AR Members",
    icon: Users,
    subItems: [
      {
        name: "Manage Members",
        icon: Contact,
        path: AppRoutes.adminManageMembers(),
      },
      {
        name: "Manage Plans",
        icon: FileText,
        path: AppRoutes.adminManagePlans(),
      },
      {
        name: "Manage Subscriptions",
        icon: Calendar,
        path: AppRoutes.adminManageSubscriptions(),
      },
      {
        name: "Payment History",
        icon: CreditCard,
        path: AppRoutes.adminPaymentHistory(),
      },
      {
        name: "Coupon Management",
        icon: Gift,
        path: AppRoutes.adminCouponManagement(),
      },
    ],
  },
  {
    name: "Content",
    icon: LayoutDashboard,
    subItems: [
      {
        name: "News Letter",
        icon: Mail,
        path: AppRoutes.adminNewsletterManagement(),
      },
      {
        name: "Podcasts",
        icon: Mic,
        path: AppRoutes.adminPodcastManagement(),
      },
      {
        name: "Webinars",
        icon: Video,
        path: AppRoutes.adminWebinarManagement(),
      },
      {
        name: "Research",
        icon: FileText,
        path: AppRoutes.adminResearchManagement(),
      },
      {
        name: "Testimonials",
        icon: Star,
        path: AppRoutes.adminTestimonialManagement(),
      },
    ],
  },
  {
    name: "Job Openings",
    icon: Briefcase,
    subItems: [
      {
        name: "Job Openings",
        icon: ClipboardList,
        path: AppRoutes.adminJobOpenings(),
      },
      { name: "Add new Job", icon: UserPlus, path: AppRoutes.adminAddNewJob() },
      {
        name: "Applications",
        icon: FileText,
        path: AppRoutes.adminApplications(),
      },
    ],
  },
  {
    name: "Users",
    icon: Users,
    subItems: [
      { name: "All Users", icon: Users, path: AppRoutes.adminAllUsers() },
      { name: "Add User", icon: UserPlus, path: AppRoutes.adminAddUser() },
      { name: "Profile", icon: Contact, path: AppRoutes.adminProfile() },
    ],
  },
  { name: "Settings", icon: Settings, path: AppRoutes.adminSettings() },
];

const AdminSidebar = () => {
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

  const SidebarContent = () => (
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
      <nav className="flex-1 mt-8 space-y-2 px-2 pb-10 overflow-y-auto">
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
        <SidebarContent />
      </div>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30 lg:hidden"
          onClick={toggleMobileMenu}
        ></div>
      )}

      <aside
        className={`hidden lg:flex flex-col bg-gray-800 text-white transition-all duration-300
                   ${isCollapsed ? "w-20" : "w-64"}`}
      >
        <SidebarContent />
      </aside>
    </>
  );
};

export default AdminSidebar;
