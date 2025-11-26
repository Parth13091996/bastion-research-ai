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
                src="/media/Bastion-Logo.png"
                alt="Bastion Research"
                className="h-24 sm:h-26 md:h-30 lg:h-30 xl:h-30 max-w-full object-contain"
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
