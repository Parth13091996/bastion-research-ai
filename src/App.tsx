// App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute"; // Ensure path is correct
import RootLayout from "./layouts/RootLayout";
import { lazy, Suspense } from "react"; // For lazy loading
import { routes } from "./pages/routes";

const queryClient = new QueryClient();

const SuspenseFallback = () => <div>Loading...</div>; // You can make this fancier

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Wrap all routes with RootLayout */}
          <Route element={<RootLayout />}>
            {/* Iterate through the routes defined in routes.tsx */}
            {routes.map(
              ({ Component, index, path, isProtected }, routeIndex) => {
                // Wrap the component in Suspense for lazy loading
                const WrappedComponent = (
                  <Suspense fallback={<SuspenseFallback />}>
                    <Component />
                  </Suspense>
                );

                // Determine the element to render based on protection
                const elementToRender = isProtected ? (
                  <ProtectedRoute>{WrappedComponent}</ProtectedRoute>
                ) : (
                  WrappedComponent
                );

                // Decide between index route or path route
                if (index === true) {
                  return (
                    <Route
                      key={`index-${routeIndex}`} // Unique key for index route
                      index // Use index prop
                      element={elementToRender}
                    />
                  );
                } else if (path) {
                  return (
                    <Route
                      key={`path-${routeIndex}`} // Unique key for path route
                      path={path}
                      element={elementToRender}
                    />
                  );
                }
                // If neither index nor path is valid, skip (shouldn't happen with type safety)
                return null;
              }
            )}

            <Route
              path="*"
              element={
                <Suspense fallback={<SuspenseFallback />}>
                  <NotFound />
                </Suspense>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

const NotFound = lazy(() => import("./pages/NotFound"));

export default App;
