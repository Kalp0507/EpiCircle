
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// Pages
import Index from "./pages/LandingPage";
import SignIn from "./pages/Auth/SignIn";
import SignUp from "./pages/Auth/SignUp";
import Dashboard from "./pages/Dashboard";
import NewProduct from "./pages/NewProduct";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import NotFound from "./pages/NotFound";
import AuthGuard from "./components/layout/AuthGuard";
import QuotesPage from "./pages/Quotes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route 
            path="/new-product" 
            element={
              <AuthGuard allowedRoles={["intern", "admin"]}>
                <NewProduct />
              </AuthGuard>
            } 
          />
          <Route 
            path="/product/:id/quote" 
            element={
              <AuthGuard allowedRoles={["vendor", "admin"]}>
                <QuotesPage />
              </AuthGuard>
            } 
          />
          <Route 
            path="/product/:id/quote/edit" 
            element={
              <AuthGuard allowedRoles={["vendor", "admin"]}>
                <QuotesPage />
              </AuthGuard>
            } 
          />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
