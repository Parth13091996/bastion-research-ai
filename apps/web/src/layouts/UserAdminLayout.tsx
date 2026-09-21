import UserSidebar from "@/components/generic/UserSidebar";
import { Outlet } from "react-router-dom";

const UserAdminLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <UserSidebar />
      <main className="flex-1 p-4 pt-0 sm:pt-0 lg:pt-0 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="lg:hidden h-12"></div>
        <Outlet />
      </main>
    </div>
  );
};

export default UserAdminLayout;
