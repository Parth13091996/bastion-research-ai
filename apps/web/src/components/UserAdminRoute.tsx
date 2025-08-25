import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

const UserAdminRoute = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  // if (!isAuthenticated || !isAdmin) {
  //   return <Navigate to="/admin/login" replace />;
  // }

  return <Outlet />;
};

export default UserAdminRoute;
