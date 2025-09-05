import { Suspense } from "react";
import { BrowserRouter as Router, useRoutes } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { routes } from "./routes";
import PageLoader from "./components/generic/PageLoader";

const AppRoutes = () => {
  const element = useRoutes(routes);
  return element;
};

function App() {
  return (
    <Router>
      <AppRoutes />
      <PageLoader />
      <Toaster />
    </Router>
  );
}

export default App;
