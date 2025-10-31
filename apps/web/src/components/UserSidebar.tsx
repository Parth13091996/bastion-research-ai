import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { AppRoutes } from "@/routes/app-routes";
import { PersonIcon } from "@radix-ui/react-icons";
import {
  BarChart3,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Crown,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  Play,
  Settings,
  Shield,
  TrendingUp,
  User,
  FileText,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Brand Colors
const BrandColors = {
  red: "#C00000",
  blue: "#1C2852",
  beige: "#C4B696",
  light: "#E6E6E6",
};

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: AppRoutes.dashboard },
  {
    name: "Recommendation",
    icon: TrendingUp,
    path: "/user/app/recommendation",
  },
  // { name: "Research Hub", icon: FileText, path: "/user/app/research-hub" },
  { name: "Premium Webinars", icon: Play, path: "/user/app/premium-webinars" },
  {
    name: "Scratch Pad Newsletter",
    icon: Newspaper,
    path: AppRoutes.scratch_pad_newsletter,
  },
  {
    name: "My Account",
    icon: User,
    path: "/user/app/account/edit-profile", // assuming the base path is for editing
    subItems: [
      {
        name: "Edit Profile",
        path: "/user/app/account/edit-profile",
        icon: Settings,
      },
      {
        name: "Show Subscription",
        path: "/user/app/account/subscription",
        icon: CreditCard,
      },
      {
        name: "Transaction History",
        path: "/user/app/account/transactions",
        icon: BarChart3,
      },
    ],
  },
  {
    name: "Join WhatsApp Group",
    icon: FaWhatsapp,
    path: "https://chat.whatsapp.com/BtcHdUM5CT3953nLHajCQR?mode=wwt",
  },

  {
    name: "Admin Panel",
    icon: PersonIcon,
    path: AppRoutes.adminDashboard,
  },
];

export default function Sidebar() {
  const { user, subscription, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState({});
  const [submenuPosition, setSubmenuPosition] = useState(null);
  const location = useLocation();

  // Get user profile data
  const profile = {
    name: user
      ? `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
        user.username ||
        "User"
      : "Guest",
    role: user?.role || "User",
    avatarUrl: null, // You can add avatar URL to user object later
    is_premium: subscription?.is_premium || false,
    currentPlan: subscription?.currentPlan || null,
  };

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

  const handleExploreWebsite = () => {
    navigate("/");
    setIsMobileOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
      setIsMobileOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout. Please try again.");
    }
  };

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
              <img src={"/media/favicon.webp"} alt="Logo" className="h-5 w-5" />
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
              <img src={"/media/favicon.webp"} alt="Logo" className="h-5 w-5" />
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

      {/* Header Buttons */}
      <div
        className={`px-4 py-3 border-b border-gray-700 ${isCollapsed ? "px-2" : ""}`}
      >
        {!isCollapsed ? (
          <div className="flex gap-2">
            <Button
              onClick={handleExploreWebsite}
              variant="outline"
              size="sm"
              className="flex-1 bg-blue-600 border-gray-600 text-white hover:bg-white hover:text-blue-900 transition-colors"
            >
              <Home className="h-4 w-4 mr-2" />
              Explore Website
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="flex-1 bg-red-600 border-gray-600 text-white hover:bg-white hover:text-red-600 hover:border-600 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleExploreWebsite}
              variant="outline"
              size="icon"
              className="w-full bg-transparent border-gray-600 text-white hover:bg-white hover:text-blue-900 transition-colors"
              title="Explore Website"
            >
              <Home className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="icon"
              className="w-full bg-transparent border-gray-600 text-white hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
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
              hasSub &&
              item.subItems.some((sub) =>
                location.pathname.startsWith(sub.path)
              );

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
                ) : item.path.startsWith("http") ? (
                  <a
                    href={item.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsMobileOpen(false)}
                    title={isCollapsed ? item.name : undefined}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full ${
                      isCollapsed ? "justify-center" : ""
                    } text-gray-200 hover:bg-red-900`}
                  >
                    <item.icon className="h-5 w-5" />
                    {!isCollapsed && <span className="ml-3">{item.name}</span>}
                  </a>
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
              style={{
                top: submenuPosition.top - 16,
                backgroundColor: BrandColors.blue,
              }} // Updated line
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

      {/* Profile */}
      <div className="mt-auto p-4 border-t border-gray-700">
        {!isCollapsed ? (
          <div className="space-y-3">
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
                <p className="text-xs text-gray-300 capitalize">
                  {profile.role}
                </p>
              </div>
            </div>

            {/* Premium Status & User Type */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {profile.is_premium ? (
                  <>
                    <Crown className="h-3 w-3 text-yellow-400" />
                    <span className="text-xs text-yellow-400 font-medium">
                      Premium Member
                    </span>
                  </>
                ) : (
                  <>
                    <Shield className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-400">
                      No Active Plan
                    </span>
                  </>
                )}
              </div>
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
              <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center relative">
                <span className="text-sm font-medium text-white">
                  {profile.name[0] || "B"}
                </span>
                {profile.is_premium && (
                  <Crown className="h-3 w-3 text-yellow-400 absolute -top-1 -right-1" />
                )}
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
        {isMobileOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
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
        className={`hidden lg:flex flex-col transition-all duration-300 h-screen z-40 ${
          // Added `z-40` here
          isCollapsed ? "w-16" : "w-80"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
