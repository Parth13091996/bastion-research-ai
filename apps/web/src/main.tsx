import React from "react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { AuthProvider } from "./contexts/AuthContext";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SiteProtector from "./components/siteProtector.tsx";

const queryClient = new QueryClient();

// Register AG Grid Community modules globally (v34+ modular API)
ModuleRegistry.registerModules([AllCommunityModule]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SiteProtector />
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
