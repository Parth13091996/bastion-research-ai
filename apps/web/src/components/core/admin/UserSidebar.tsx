import React, { useState } from "react";
import { LayoutDashboard, ThumbsUp, BookOpen, Sidebar } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

// Brand Colors
const COLORS = {
  red: "#C00000",
  blue: "#1C2852",
  beige: "#C4B696",
  gray: "#E6E6E6",
  white: "#ffffff",
  black: "#000000",
};

const UserSidebar = ({ user }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const menuItems = [
    {
      path: "/app/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={24} color={COLORS.white} />,
    },
    {
      path: "/app/recommendation",
      label: "Recommendation",
      icon: <ThumbsUp size={24} color={COLORS.white} />,
    },
    {
      path: "/app/research-hub",
      label: "Research Hub",
      icon: <BookOpen size={24} color={COLORS.white} />,
    },
  ];

  return (
    <div
      className="h-screen flex flex-col justify-between transition-all duration-300"
      style={{
        backgroundColor: COLORS.blue,
        color: COLORS.white,
        width: collapsed ? "5rem" : "16rem",
      }}
    >
      {/* Top Section */}
      <div>
        {/* Collapse Button + Profile */}
        <div
          className={`flex items-center ${
            collapsed ? "justify-center flex-col" : "justify-between"
          } p-4`}
        >
          {/* Profile */}
          <div className="flex flex-col items-center">
            <img
              src={user?.image || "/sample-profile.png"}
              alt="Profile"
              className="w-12 h-12 rounded-full object-cover"
            />
            {!collapsed && (
              <span className="font-semibold mt-2 text-lg">
                {user?.name || "Guest User"}
              </span>
            )}
          </div>

          {/* Collapse Button */}
          <button
            className="text-white hover:opacity-70 mt-2"
            onClick={() => setCollapsed(!collapsed)}
          >
            <Sidebar size={26} color={COLORS.white} />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="mt-6 space-y-2">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={index}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-md transition-colors text-base font-medium ${
                  collapsed ? "justify-center" : "gap-3"
                } ${isActive ? "bg-red-600" : "hover:bg-[#2A386F]"}`}
              >
                {item.icon}
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Logo/Image */}
      <div className="p-4 mt-auto">
        <Link to="/" className="block">
          <img
            src={collapsed ? "/files/favicon.webp" : "/files/header-logo.webp"}
            alt="Logo"
            className={`mx-auto ${collapsed ? "w-10 h-10" : "w-36"}`}
          />
        </Link>
      </div>
    </div>
  );
};

export default UserSidebar;
