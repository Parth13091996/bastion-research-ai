import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAuth } from "@/contexts/AuthContext";
import { AdminAuthRoutes, AppRoutes } from "@/routes/app-routes";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const AdminLayout = () => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  // If already authenticated as admin, prevent seeing admin login page
  if (
    isAuthenticated &&
    isAdmin &&
    AdminAuthRoutes.includes(location.pathname) &&
    !isLoading
  ) {
    return <Navigate to={AppRoutes.adminDashboard()} replace />;
  }

  if ((!isAuthenticated || !isAdmin) && !isLoading) {
    return <Navigate to={AppRoutes.adminLogin()} replace />;
  }

  if (isLoading) {
    return (
      <div className="relative flex h-screen bg-gray-100 overflow-hidden">
        <div className="absolute left-[42%] top-[42%]">
          <main className="animate-pulse p-4">
            <img
              src="/media/header-logo.webp"
              alt="Bastion Research"
              className="h-22 md:h-14"
            />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <AdminSidebar />
      <div className="flex flex-col flex-1 min-h-0">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
