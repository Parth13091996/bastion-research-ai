import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AppRoutes } from "@/routes/app-routes";

const MyAccountDropdown = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleOptionClick = () => {
    setIsDropdownOpen(false);
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    setIsDropdownOpen(false);
    await logout();
    navigate(AppRoutes.login());
  };

  return (
    <div className="relative inline-block z-20">
      {/* My Account Button */}
      <button
        onClick={toggleDropdown}
        className="flex items-center text-red-600 font-medium hover:text-red-800 transition-colors focus:outline-none"
        aria-haspopup="true"
        aria-expanded={isDropdownOpen}
        id="my-account-button"
        type="button"
      >
        My Account
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`ml-1 h-4 w-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div
          className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="my-account-button"
        >
          <Link
            to="/edit-profile"
            onClick={handleOptionClick}
            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-red-600 transition-colors"
            role="menuitem"
          >
            Edit Profile
          </Link>
          <Link
            to="/subscription"
            onClick={handleOptionClick}
            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-red-600 transition-colors"
            role="menuitem"
          >
            Show Subscription
          </Link>
          <Link
            to="/transaction-history"
            onClick={handleOptionClick}
            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-red-600 transition-colors"
            role="menuitem"
          >
            Transaction History
          </Link>
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-red-600 transition-colors"
            role="menuitem"
            type="button"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default MyAccountDropdown;
