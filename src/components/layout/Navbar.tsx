
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Navbar() {
  const { currentUser, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center">
        <Link to="/" className="flex items-center gap-2">
          <span className="bg-gradient-to-r from-purple to-purple-dark bg-clip-text text-transparent text-2xl font-bold">BidBoost</span>
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        {currentUser ? (
          <>
            <div className="hidden md:flex items-center gap-6 mr-4">
              <Link to="/dashboard" className="text-gray-700 hover:text-purple transition-colors">
                Dashboard
              </Link>
              
              {currentUser.role === "intern" && (
                <Link to="/new-product" className="text-gray-700 hover:text-purple transition-colors">
                  New Product
                </Link>
              )}
              
              {currentUser.role === "vendor" && (
                <Link to="/quotes" className="text-gray-700 hover:text-purple transition-colors">
                  My Quotes
                </Link>
              )}
              
              {currentUser.role === "admin" && (
                <Link to="/admin" className="text-gray-700 hover:text-purple transition-colors">
                  Admin Panel
                </Link>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:block text-right">
                <div className="text-sm font-medium text-gray-900">{currentUser.name}</div>
                <div className="text-xs text-gray-500 capitalize">{currentUser.role}</div>
              </div>
              
              <Button onClick={handleSignOut} variant="outline" size="sm">
                Sign out
              </Button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/signin">
              <Button variant="outline" size="sm">Sign in</Button>
            </Link>
            <Link to="/signup">
              <Button variant="purple" size="sm">Sign up</Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
