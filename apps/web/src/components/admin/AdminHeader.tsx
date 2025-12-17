import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { AppRoutes } from "@/routes/app-routes";
import { useNavigate } from "react-router-dom";

const AdminHeader = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const homeRedirect = () => {
    navigate(AppRoutes.home);
  };

  const goToUserDashboard = () => {
    // User app dashboard route
    navigate("/user/app/dashboard");
  };

  return (
    <header className="bg-gray-800 text-white shadow-md">
      <div className="mx-auto px-6 md:px-8 lg:px-8">
        <div className="flex justify-center items-center h-16">
          <div className="flex flex-1 gap-4 justify-end">
            <Button
              variant="outline"
              className="text-black"
              onClick={goToUserDashboard}
            >
              User Dashboard
            </Button>
            <Button
              variant="outline"
              className="text-black"
              onClick={homeRedirect}
            >
              Visit Website
            </Button>

            <Button variant="outline" className="text-black" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
