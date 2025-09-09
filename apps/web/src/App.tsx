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
      <AppRoutes />
      <ModalsLayout />
      <Loader />
      <Toaster />
    </Router>
  );
}

export default App;
