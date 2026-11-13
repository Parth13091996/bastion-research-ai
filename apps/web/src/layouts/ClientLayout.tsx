import BackToTop from "@/components/generic/backToTop";
import Footer from "@/components/generic/Footer";
import Header from "@/components/generic/Header";
import { useAuth } from "@/contexts/AuthContext";
import { AppRoutes, AuthRoutes } from "@/routes/app-routes";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const ClientLayout = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  const isStillOnboarding =
    Boolean(user) &&
    user?.role !== "admin" &&
    user?.role !== "employee" &&
    (user?.status === "pending" || user?.status === "onboarded");

  if (
    user &&
    isAuthenticated &&
    !isStillOnboarding &&
    AuthRoutes.includes(location.pathname as any)
  ) {
    return <Navigate to={AppRoutes.dashboard} replace />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow main pt-[80px] md:pt-[88px]">
        <Outlet />
        <BackToTop />
      </main>
      <Footer />
    </div>
  );
};

export default ClientLayout;

