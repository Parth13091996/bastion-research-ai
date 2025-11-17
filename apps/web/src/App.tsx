import { Suspense } from "react";
import { BrowserRouter as Router, useRoutes } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { routes } from "./routes";
import ModalsLayout from "./layouts/ModalsLayout";
import RouteAnalytics from "./components/RouteAnalytics";

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
          <div className="relative flex h-screen bg-gray-100 overflow-hidden items-center justify-center">
            <main className="animate-pulse p-4">
              <img
                src="/media/header-logo.webp"
                alt="Bastion Research"
                className="h-16 sm:h-18 md:h-20 lg:h-20 xl:h-20 max-w-full object-contain"
              />
            </main>
          </div>
        }
      >
        <AppRoutes />
      </Suspense>
      <ModalsLayout />
      <Toaster position="bottom-center" />
    </Router>
  );
}

export default App;
