import { useAuth } from "@/contexts/AuthContext";
import { AppRoutes } from "@/routes/app-routes";
import { Link } from "react-router-dom";

const DesktopNav = ({ setOpenSubmenu }) => {
  const { user, isLoading } = useAuth();
  const isActive = user?.status === "active";

  return (
    <nav className="hidden md:flex items-center space-x-8">
      <div className="relative group">
        <div
          className="relative text-gray-700 hover:text-red-600 transition-colors flex items-center cursor-pointer"
          onMouseEnter={() => setOpenSubmenu("desktopKnowledgeCenter")}
          onMouseLeave={() => setOpenSubmenu(null)}
        >
          Knowledge Center
          <svg
            className="ml-1 w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
          <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-red-600 transition-all duration-300 group-hover:w-full"></span>
        </div>

        <div
          className="absolute left-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
          onMouseEnter={() => setOpenSubmenu("desktopKnowledgeCenter")}
          onMouseLeave={() => setOpenSubmenu(null)}
        >
          <Link
            to={AppRoutes.newsletter()}
            className="block px-4 py-2 text-gray-700 hover:text-red-600"
          >
            Newsletter Archive
          </Link>
          <Link
            to={AppRoutes.podcasts()}
            className="block px-4 py-2 text-gray-700 hover:text-red-600"
          >
            Podcast (MADE IN INDIA)
          </Link>
          <Link
            to={AppRoutes.webinar()}
            className="block px-4 py-2 text-gray-700 hover:text-red-600"
          >
            Webinars
          </Link>
        </div>
      </div>

      {isLoading ? (
        // Add small card level loading
        <div className="flex items-center justify-center h-10 w-24">
          <svg
            className="animate-spin h-5 w-5 text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
        </div>
      ) : isActive ? (
        <Link
          to={
            AppRoutes.dashboard ? AppRoutes.dashboard() : "/user/app/dashboard"
          }
          className="text-gray-700 hover:text-red-600 flex items-center transition-colors"
        >
          {/* User Profile Picture or Initials */}
          {user?.profile_picture ? (
            <img
              src={user.profile_picture}
              alt={
                `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
                "User"
              }
              className="h-6 w-6 rounded-full object-cover mr-2 border border-gray-300"
            />
          ) : (
            <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center mr-2 border border-gray-300">
              <span className="text-xs font-medium text-gray-700">
                {user?.first_name?.[0] || user?.username?.[0] || "U"}
              </span>
            </div>
          )}
          My Account
        </Link>
      ) : (
        <Link
          to={AppRoutes.login()}
          className="text-gray-700 hover:text-red-600 flex items-center transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          Login
        </Link>
      )}

      <Link
        to={AppRoutes.contact()}
        className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
      >
        Contact Us
      </Link>
    </nav>
  );
};

export default DesktopNav;
