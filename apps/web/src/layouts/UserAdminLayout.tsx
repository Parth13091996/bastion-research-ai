import UserSidebar from "@/components/UserSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { AppRoutes } from "@/routes/app-routes";
import { Navigate, Outlet } from "react-router-dom";
import { toast } from "sonner";

const UserAdminLayout = () => {
  const { user, isAdmin } = useAuth();

  if (user && isAdmin) {
    toast.success("You can't visit the user webapp, you're the admin.");
    return <Navigate to={AppRoutes.adminLogin()} replace />;
  }
  return (
    <div className="flex h-screen bg-gray-100">
      <UserSidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="lg:hidden h-12"></div> {/* Spacer for mobile header */}
        <Outlet />
      </main>
    </div>
  );
};

export default UserAdminLayout;
