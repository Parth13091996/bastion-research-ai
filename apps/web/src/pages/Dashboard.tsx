import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const Dashboard = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (!isLoading) {
    return <Navigate to={isAuthenticated ? "/user/app/dashboard" : "/login"} replace />;
  }

  // Show loading while redirecting
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
};

export default Dashboard;
