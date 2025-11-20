import UserSidebar from "@/components/UserSidebar";
import { Outlet } from "react-router-dom";
import BetaBanner from "@/components/BetaBanner";

const UserAdminLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <UserSidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {/* <BetaBanner /> */}
        <div className="lg:hidden h-12"></div> {/* Spacer for mobile header */}
        <Outlet />
      </main>
    </div>
  );
};

export default UserAdminLayout;
