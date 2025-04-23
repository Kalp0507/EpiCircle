
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function useAuthNavigation() {
  const auth = useAuth();
  const navigate = useNavigate();

  // Create a new object with all auth properties but override the navigate function
  const enhancedAuth = {
    ...auth,
    navigate: (path: string) => {
      console.log("Router navigating to:", path);
      navigate(path);
    }
  };

  return enhancedAuth;
}
