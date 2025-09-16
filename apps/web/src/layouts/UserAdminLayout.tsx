import { Outlet } from "react-router-dom";
import UserSidebar from "@/components/UserSidebar";
import { useAuth } from "@/contexts/AuthContext";

const UserAdminLayout = () => {
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-gray-100">
      <UserSidebar user={user} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="lg:hidden h-12"></div> {/* Spacer for mobile header */}
        <Outlet />
      </main>
    </div>
  );
};

export default UserAdminLayout;
