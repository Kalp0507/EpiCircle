
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// Pages
import Index from "./pages/LandingPage";
import AuthPage from "./pages/Auth/AuthPage";
import Dashboard from "./pages/Dashboard";
import NewProduct from "./pages/NewProduct";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import NotFound from "./pages/NotFound";
import AuthGuard from "./components/layout/AuthGuard";
import QuotesPage from "./pages/Quotes";
import { UserRole } from "./types";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              path="/new-product"
              element={
                <AuthGuard allowedRoles={["customer"] as UserRole[]}>
                  <NewProduct />
                </AuthGuard>
              }
            />
            <Route 
              path="/quotes" 
              element={
                <AuthGuard allowedRoles={["vendor"] as UserRole[]}>
                  <QuotesPage />
                </AuthGuard>
              }
            />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
