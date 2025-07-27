import { Outlet } from "react-router-dom";
import Header from "@/components/generic/Header";
import Footer from "@/components/generic/Footer/index";

const RootLayout = () => {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
};
// <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex flex-col">
//     </div>

export default RootLayout;
