import { Suspense } from "react";
import { BrowserRouter as Router, useRoutes } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { routes } from "./routes";

const AppRoutes = () => {
  const element = useRoutes(routes);
  return element;
};

function App() {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <AppRoutes />
      </Suspense>
      <Toaster />
    </Router>
  );
}

export default App;
