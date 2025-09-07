import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { AuthProvider } from "./contexts/AuthContext";
import { LoaderProvider } from "./contexts/LoaderContext";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LoaderProvider>
          <App />
        </LoaderProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
