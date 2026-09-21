import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/AdminSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { AppRoutes } from "@/routes/app-routes";
import { Navigate, Outlet } from "react-router-dom";

const AdminLayout = () => {
  const { isAuthenticated, isStaff, isLoading } = useAuth();

  if ((!isAuthenticated || !isStaff) && !isLoading) {
    return <Navigate to={AppRoutes.login} replace />;
  }

  if (isLoading) {
    return (
      <div className="relative flex h-screen bg-gray-100 overflow-hidden">
        <div className="absolute left-[42%] top-[42%]">
          <main className="animate-pulse p-4">
            <img
              src="/media/Bastion-Logo.png"
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
