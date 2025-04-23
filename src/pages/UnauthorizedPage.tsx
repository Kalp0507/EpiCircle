
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  const { currentUser, profile } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full px-6 py-8 bg-white shadow-md rounded-lg">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page. This area is restricted based on your user role.
          </p>
          
          {currentUser && (
            <div className="mb-6 p-4 bg-gray-50 rounded-md text-sm text-left">
              <p className="font-medium text-gray-700">Current user information:</p>
              <p className="mt-1 text-gray-600">Name: {profile?.full_name || profile?.id || currentUser.id}</p>
              <p className="text-gray-600">Role: {currentUser.role || profile?.role || "No role assigned"}</p>
            </div>
          )}
          
          <div className="flex flex-col space-y-3">
            <Link to="/dashboard">
              <Button variant="purple" className="w-full">
                Return to Dashboard
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" className="w-full">
                Go to Home Page
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
