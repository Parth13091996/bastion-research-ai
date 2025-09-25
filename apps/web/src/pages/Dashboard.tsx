import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect authenticated users to UserAdmin sidebar
    if (isAuthenticated && !isLoading) {
      navigate("/user/app/dashboard", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

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
