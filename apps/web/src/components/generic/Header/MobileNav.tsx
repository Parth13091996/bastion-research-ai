import { HiOutlineMenu, HiOutlineUser } from "react-icons/hi";

const MobileNav = ({ setIsNavOpen, setIsProfileOpen }) => {
  return (
    <div className="md:hidden flex items-center space-x-4">
      {/* Burger Icon */}
      <button
        onClick={() => setIsNavOpen(true)}
        className="text-red-600 focus:outline-none text-2xl"
      >
        <HiOutlineMenu />
      </button>

      {/* Profile Icon */}
      <button
        onClick={() => setIsProfileOpen(true)}
        className="text-red-600 focus:outline-none text-2xl"
      >
        <HiOutlineUser />
      </button>
    </div>
  );
};

export default MobileNav;
