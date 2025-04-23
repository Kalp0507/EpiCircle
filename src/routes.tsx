
import { BrowserRouter, Routes, Route } from "react-router-dom";

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

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route 
          path="/new-product" 
          element={
            <AuthGuard allowedRoles={["customer"]}>
              <NewProduct />
            </AuthGuard>
          } 
        />
        <Route 
          path="/quotes" 
          element={
            <AuthGuard allowedRoles={["vendor"]}>
              <QuotesPage />
            </AuthGuard>
          } 
        />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
