import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index.tsx";
import Home from "./pages/Home.tsx";
import Contact from "./pages/Contact.tsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.tsx";
import RefundPolicy from "./pages/RefundPolicy.tsx";
import Auth from "./pages/Auth.tsx";
import EditProfile from "./pages/EditProfile.tsx";
import Subscription from "./pages/Subscription.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import NotFound from "./pages/NotFound.tsx";
import FooterRefundPolicy from "./pages/FooterRefundPolicy.tsx";
import FooterPrivacyPolicy from "./pages/FooterPrivacyPolicy.tsx";
import FooterTermAndCondition from "./pages/FooterTermAndCondition.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/home" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/footer-refund-policy" element={<FooterRefundPolicy />} />
          <Route path="/footer-privacy-policy" element={<FooterPrivacyPolicy />} />
          <Route path="/footer-term-and-condition" element={<FooterTermAndCondition />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<Auth />} />

          {/* Protected Routes */}
          <Route path="/edit-profile" element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          } />
          <Route path="/subscription" element={
            <ProtectedRoute>
              <Subscription />
            </ProtectedRoute>
          } />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
