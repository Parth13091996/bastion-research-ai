import { Outlet } from "react-router-dom";
import Header from "@/components/generic/Header";
import Footer from "@/components/generic/Footer";
import BackToTop from "@/components/generic/backToTop";
// import SiteProtector from "@/components/siteProtector";

const RootLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      {/* <SiteProtector /> */}
      <main className="flex-grow main pt-[80px] md:pt-[88px]">
        <Outlet />
        <BackToTop />
      </main>
      <Footer />
    </div>
  );
};

export default RootLayout;
