import { Suspense } from "react";
import { BrowserRouter as Router, useRoutes } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { routes } from "./routes";
import ModalsLayout from "./layouts/ModalsLayout";
import RouteAnalytics from "./components/RouteAnalytics";
import Loader from "./components/generic/Loader";

const AppRoutes = () => {
  const element = useRoutes(routes);
  return element;
};

function App() {
  return (
    <Router>
      <RouteAnalytics />
      <Suspense
        fallback={
          <div className="relative flex h-screen bg-gray-100 overflow-hidden">
            <div className="absolute left-[42%] top-[42%]">
              <main className="animate-pulse p-4">
                <img
                  src="/media/header-logo.webp"
                  alt="Bastion Research"
                  className="h-22 md:h-14"
                />
              </main>
            </div>
          </div>
        }
      >
        <AppRoutes />
      </Suspense>
      <ModalsLayout />
      <Loader />
      <Toaster position="bottom-center" />
    </Router>
  );
}

export default App;
