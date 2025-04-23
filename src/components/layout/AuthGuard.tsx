
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types";
import { ReactNode } from "react";

interface AuthGuardProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { currentUser, isLoading, profile } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-purple">Loading...</div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/auth?tab=signin" state={{ from: location }} replace />;
  }

  // Get the role from currentUser or profile, must be UserRole or undefined
  const userRole: UserRole | undefined =
    currentUser.role && ["customer", "vendor", "intern"].includes(currentUser.role)
      ? (currentUser.role as UserRole)
      : (profile?.role as UserRole | undefined);

  // Check if user has required role
  if (allowedRoles && allowedRoles.length > 0 && userRole && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
