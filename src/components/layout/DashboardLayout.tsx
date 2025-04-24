
import { ReactNode } from "react";
import Navbar from "./Navbar";
import { useAuth } from "@/context/AuthContext";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { currentUser } = useAuth();
  
  let roleColor;
  switch(currentUser?.role) {
    case "vendor":
      roleColor = "from-blue-500 to-blue-700";
      break;
    case "intern":
      roleColor = "from-green-500 to-green-700";
      break;
    case "admin":
      roleColor = "from-purple to-purple-dark";
      break;
    default:
      roleColor = "from-gray-500 to-gray-700";
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <div className={`h-2 w-full max-w-[150px] rounded-full bg-gradient-to-r ${roleColor}`}></div>
          </div>
          
          <main>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
