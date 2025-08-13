import { Outlet } from 'react-router-dom';
import Header from '@/components/generic/Header';
import Footer from '@/components/generic/Footer';

const RootLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default RootLayout;
