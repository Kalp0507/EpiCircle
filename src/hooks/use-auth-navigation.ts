
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function useAuthNavigation() {
  const auth = useAuth();
  const navigate = useNavigate();

  // Override the navigate function from AuthContext with the one from React Router
  const enhancedAuth = {
    ...auth,
    navigate: (path: string) => navigate(path)
  };

  return enhancedAuth;
}
