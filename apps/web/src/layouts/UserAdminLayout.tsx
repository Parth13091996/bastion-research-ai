import { Outlet } from "react-router-dom";
import UserSidebar from "@/components/core/admin/UserSidebar";

const UserAdminLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <UserSidebar user={{}} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="lg:hidden h-12"></div> {/* Spacer for mobile header */}
        <Outlet />
      </main>
    </div>
  );
};

export default UserAdminLayout;
