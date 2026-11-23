import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

const UserAdminRoute = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If user is still in the onboarding process, prevent accessing the dashboard
  const isStillOnboarding =
    Boolean(user) &&
    user?.role !== "admin" &&
    user?.role !== "employee" &&
    (user?.status === "pending" ||
      user?.status === "onboarded" ||
      user?.status === "agreement_signed");

  if (isStillOnboarding) {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("onboarding_open", "true");
      } catch { }
    }
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default UserAdminRoute;
