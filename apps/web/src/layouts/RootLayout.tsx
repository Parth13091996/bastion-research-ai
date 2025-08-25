import { Outlet } from "react-router-dom";
import Header from "@/components/generic/Header";
import Footer from "@/components/generic/Footer";
import BackToTop from "@/components/generic/backToTop";

const RootLayout = () => {
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

export default RootLayout;
