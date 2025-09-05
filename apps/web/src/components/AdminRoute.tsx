import { useAuth } from "@/contexts/AuthContext";
import { AppRoutes } from "@/routes";
import { Navigate, Outlet } from "react-router-dom";

const AdminRoute = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to={AppRoutes.adminLogin()} replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
