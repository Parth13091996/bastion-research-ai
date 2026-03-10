import {
  BookOpen,
  Briefcase,
  ChevronDown,
  ChevronLeft,
  ClipboardList,
  Contact,
  CreditCard,
  FileText,
  Gift,
  LayoutDashboard,
  Mail,
  Menu,
  Mic,
  Settings,
  Star,
  UserPlus,
  Users,
  Video,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { AppRoutes } from "../routes/app-routes";

const navItems = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: AppRoutes.adminDashboard,
  },
  {
    name: "AR Members",
    icon: Users,
    subItems: [
      {
        name: "Manage Members",
        icon: Contact,
        path: AppRoutes.adminManageMembers,
      },
      {
        name: "Profile",
        icon: Contact,
        path: AppRoutes.adminProfile,
      },
      {
        name: "Manage Plans",
        icon: FileText,
        path: AppRoutes.adminManagePlans,
      },
      {
        name: "Payment History",
        icon: CreditCard,
        path: AppRoutes.adminPaymentHistory,
      },
      {
        name: "Coupon Management",
        icon: Gift,
        path: AppRoutes.adminCouponManagement,
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
        path: AppRoutes.adminNewsletterManagement,
      },
      {
        name: "Recommendations",
        icon: FileText,
        path: AppRoutes.adminRecommendationManagement,
      },
      {
        name: "Podcasts",
        icon: Mic,
        path: AppRoutes.adminPodcastManagement,
      },
      {
        name: "Webinars",
        icon: Video,
        path: AppRoutes.adminWebinarManagement,
      },
      {
        name: "Webinar Registrations",
        icon: Users,
        path: AppRoutes.adminWebinarRegistrations,
      },
      {
        name: "Testimonials",
        icon: Star,
        path: AppRoutes.adminTestimonialManagement,
      },
      {
        name: "Scratch Pad",
        icon: BookOpen,
        path: "/admin/content/scratch-pad",
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
        path: AppRoutes.adminJobOpenings,
      },
      { name: "Add new Job", icon: UserPlus, path: AppRoutes.adminAddNewJob },
      {
        name: "Applications",
        icon: FileText,
        path: AppRoutes.adminApplications,
      },
    ],
  },
  {
    name: "Leads",
    icon: Contact,
    path: AppRoutes.adminLeads,
  },
  { name: "Settings", icon: Settings, path: AppRoutes.adminSettings },
];

// AdminSidebar now supports tooltips on collapsed mode like the user sidebar
const AdminSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [hoveredTooltip, setHoveredTooltip] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [popupPos, setPopupPos] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  const sidebarRef = useRef<HTMLDivElement | null>(null);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleMobileMenu = () => setIsMobileOpen(!isMobileOpen);
  const toggleSection = (name: string) =>
    setOpenSections((prev) => ({ ...prev, [name]: !prev[name] }));

  const handleMouseEnter = (name: string, event: React.MouseEvent) => {
    if (isCollapsed) {
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      setPopupPos({ top: rect.top, left: rect.right + 8 });
      setHoveredItem(name);
    }
  };

  const handleMouseLeave = () => {
    if (isCollapsed) setHoveredItem(null);
  };

  // Tooltip component for sidebar
  // Absolutely positioned relative to parent, shown only if hoveredTooltip === tooltipId
  const SidebarTooltip = ({
    children,
    tooltipId,
  }: {
    children: React.ReactNode;
    tooltipId: string;
  }) =>
    hoveredTooltip === tooltipId ? (
      <div
        className="
          absolute left-full top-1/2 
          -translate-y-1/2
          ml-2
          z-50
          whitespace-nowrap
          px-2 py-1 
          bg-gray-900 text-white 
          text-xs 
          rounded shadow-lg
          pointer-events-none"
      >
        {children}
      </div>
    ) : null;

  const SidebarContent = () => (
    <div ref={sidebarRef} className="flex flex-col h-full">
      <div
        className={`flex items-center justify-between p-4 ${
          isCollapsed ? "justify-center" : ""
        }`}
      >
        {!isCollapsed && <h1 className="text-2xl font-bold">Admin</h1>}
        <button
          onClick={toggleSidebar}
          className="hidden lg:block p-2 rounded-full hover:bg-gray-700"
        >
          <ChevronLeft
            className={`transition-transform duration-300 ${
              isCollapsed ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      <nav className="flex-1 mt-8 space-y-2 px-2 pb-10 overflow-y-auto">
        {navItems.map((item) => (
          <div
            key={item.name}
            onMouseEnter={(e) => handleMouseEnter(item.name, e)}
            onMouseLeave={handleMouseLeave}
          >
            {item.subItems ? (
              <>
                <button
                  onClick={() => !isCollapsed && toggleSection(item.name)}
                  className={`flex items-center w-full ${
                    isCollapsed ? "justify-center" : "justify-between"
                  } p-2 rounded-lg transition-colors hover:bg-gray-700`}
                  title={isCollapsed ? item.name : ""}
                >
                  <div className="flex items-center">
                    <item.icon className="h-6 w-6" />
                    {/* Show label only when not collapsed */}
                    {!isCollapsed && <span className="ml-4">{item.name}</span>}
                  </div>
                  {!isCollapsed && (
                    <ChevronDown
                      className={`h-5 w-5 transition-transform ${
                        openSections[item.name] ? "rotate-180" : ""
                      }`}
                    />
                  )}
                  {/* Tooltip for collapsed mode */}
                  {isCollapsed && (
                    <SidebarTooltip tooltipId={item.name}>
                      {item.name}
                    </SidebarTooltip>
                  )}
                </button>

                {!isCollapsed && openSections[item.name] && (
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
              <div /* This div replaces the misplaced NavLink parent */
                className={`relative`}
              >
                <NavLink
                  to={item.path!}
                  className={({ isActive }) =>
                    `flex items-center p-2 rounded-lg transition-colors ${
                      isCollapsed ? "justify-center" : ""
                    } ${isActive ? "bg-gray-700" : "hover:bg-gray-700"}`
                  }
                  title={isCollapsed ? item.name : ""}
                  aria-label={item.name}
                  tabIndex={0}
                >
                  <item.icon className="h-6 w-6" />
                  {!isCollapsed && <span className="ml-4">{item.name}</span>}
                </NavLink>
                {isCollapsed && (
                  <SidebarTooltip tooltipId={item.name}>
                    {item.name}
                  </SidebarTooltip>
                )}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Fixed popup submenu */}
      {isCollapsed &&
        hoveredItem &&
        navItems.find((item) => item.name === hoveredItem)?.subItems && (
          <div
            className="fixed bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 w-56 py-2"
            style={{
              top: popupPos.top,
              left: popupPos.left + 10,
            }}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={() => setHoveredItem(hoveredItem)}
          >
            {navItems
              .find((item) => item.name === hoveredItem)
              ?.subItems?.map((subItem) => (
                <NavLink
                  key={subItem.name}
                  to={subItem.path}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                      isActive ? "bg-gray-700" : "hover:bg-gray-700"
                    }`
                  }
                >
                  <subItem.icon className="h-4 w-4 mr-3" />
                  {subItem.name}
                </NavLink>
              ))}
          </div>
        )}
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
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

      {/* Desktop sidebar */}
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
