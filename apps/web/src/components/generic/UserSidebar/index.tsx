import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/use-subscription";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import SidebarNav from "./SidebarNav";
import SidebarHeaderButtons from "./SidebarHeaderButtons";
import SidebarHeader from "./SidebarHeader";
import SidebarFloatingSubMenu from "./SidebarFloatingSubMenu";
import SidebarProfile from "./SidebarProfile";
import useConstants from "@/hooks/use-constants";
import PricingDialogModal from "@/components/core/common/Modals/PricingDialogModal";

function MobileSidebarButton({ isMobileOpen, toggleMobileMenu }) {
  return (
    <button
      onClick={toggleMobileMenu}
      className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white shadow-lg text-gray-700 rounded-lg border"
      aria-label="Open menu"
    >
      {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
    </button>
  );
}

function SidebarOverlay({ isMobileOpen, toggleMobileMenu }) {
  if (!isMobileOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-black opacity-50 z-30 lg:hidden"
      onClick={toggleMobileMenu}
    ></div>
  );
}

const UserSidebar = () => {
  const { user, isAdmin, logout } = useAuth();
  const { data: subscription } = useSubscription();
  const [showPricing, setShowPricing] = useState(false);
  const { navItems, BrandColors } = useConstants();

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
    avatarUrl: null,
    is_premium: !!subscription?.is_premium,
    currentPlan:
      subscription?.currentPlan ||
      user?.membership_plans?.plan_code ||
      "freemium",
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
      <SidebarHeader isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      <SidebarHeaderButtons
        isCollapsed={isCollapsed}
        onLogout={handleLogout}
        onExploreWebsite={handleExploreWebsite}
      />
      <SidebarNav
        isAdmin={isAdmin}
        profile={profile}
        navItems={navItems}
        openMenus={openMenus}
        isCollapsed={isCollapsed}
        navigate={navigate}
        toggleSubMenu={toggleSubMenu}
        setShowPricing={setShowPricing}
        setIsMobileOpen={setIsMobileOpen}
      />
      <SidebarFloatingSubMenu
        navItems={navItems}
        openMenus={openMenus}
        submenuRef={submenuRef}
        isCollapsed={isCollapsed}
        submenuPosition={submenuPosition}
        setIsMobileOpen={setIsMobileOpen}
      />
      <SidebarProfile isCollapsed={isCollapsed} profile={profile} />
    </div>
  );

  return (
    <>
      <MobileSidebarButton
        isMobileOpen={isMobileOpen}
        toggleMobileMenu={toggleMobileMenu}
      />

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-80 transform lg:hidden transition-transform duration-300 ease-in-out ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </div>
      <SidebarOverlay
        isMobileOpen={isMobileOpen}
        toggleMobileMenu={toggleMobileMenu}
      />

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col transition-all duration-300 h-screen z-40 ${
          isCollapsed ? "w-16" : "w-80"
        }`}
      >
        {sidebarContent}
      </aside>
      <PricingDialogModal
        showPricing={showPricing}
        setShowPricing={setShowPricing}
      />
    </>
  );
};

export default UserSidebar;
