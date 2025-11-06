import { HiOutlineMenu, HiOutlineUser } from "react-icons/hi";
import { useAuth } from "@/contexts/AuthContext";

const MobileNav = ({ setIsNavOpen, setIsProfileOpen }) => {
  const { user, isLoading } = useAuth();

  return (
    <div className="md:hidden flex items-center space-x-4 flex-wrap">
      {/* Burger Icon */}
      <button
        onClick={() => setIsNavOpen(true)}
        className="text-red-600 focus:outline-none text-2xl"
      >
        <HiOutlineMenu />
      </button>

      {/* Profile Icon or User Profile Picture */}
      {isLoading ? (
        <div className="w-8 h-8 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : user?.id ? (
        <button
          onClick={() => setIsProfileOpen(true)}
          className="focus:outline-none"
        >
          {user?.profile_picture ? (
            <img
              src={user.profile_picture}
              alt={`${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User'}
              className="h-8 w-8 rounded-full object-cover border-2 border-red-600"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-red-600 flex items-center justify-center border-2 border-red-600">
              <span className="text-sm font-medium text-white">
                {user?.first_name?.[0] || user?.username?.[0] || 'U'}
              </span>
            </div>
          )}
        </button>
      ) : (
        <button
          onClick={() => setIsProfileOpen(true)}
          className="text-red-600 focus:outline-none text-2xl"
        >
          <HiOutlineUser />
        </button>
      )}
    </div>
  );
};

export default MobileNav;
