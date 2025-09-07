import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";
import Header from "@/components/generic/Header";
import Footer from "@/components/generic/Footer";
import BackToTop from "@/components/generic/backToTop";
import { useAuth } from "@/contexts/AuthContext";
import { AuthRoutes } from "@/routes/app-routes";

const ClientLayout = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (user && AuthRoutes.includes(location.pathname)) {
    return <Navigate to="/" replace />;
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
