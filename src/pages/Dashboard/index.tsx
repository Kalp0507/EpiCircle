
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AuthGuard from "@/components/layout/AuthGuard";
import CustomerDashboard from "./CustomerDashboard";
import VendorDashboard from "./VendorDashboard";
import InternDashboard from "./InternDashboard";
import { UserRole } from "@/types";

export default function Dashboard() {
  const { currentUser, profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-purple">Loading...</div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <span className="text-lg text-red-500">Unable to load your profile. Please sign in again.</span>
      </div>
    );
  }

  // Determine which dashboard to show based on user role
  const userRole: UserRole | undefined = 
    currentUser.role && ["customer", "vendor", "intern"].includes(currentUser.role)
      ? (currentUser.role as UserRole)
      : (profile?.role as UserRole | undefined);

  return (
    <AuthGuard>
      <DashboardLayout>
        {userRole === "customer" && <CustomerDashboard />}
        {userRole === "vendor" && <VendorDashboard />}
        {userRole === "intern" && <InternDashboard />}
        {!userRole && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-2">Welcome, {profile?.full_name || currentUser.id}!</h2>
            <p className="text-gray-500 mb-6">
              This is your dashboard. Your role hasn't been assigned yet.
            </p>
            {profile?.avatar_url && (
              <img src={profile.avatar_url} alt="Avatar" className="mx-auto h-24 w-24 rounded-full object-cover mb-4 border" />
            )}
            <div className="max-w-md mx-auto bg-white rounded-lg p-4 shadow">
              <div className="text-left">
                <div className="mb-2">
                  <span className="font-medium text-gray-700">Full Name: </span>
                  <span>{profile?.full_name || "Not set"}</span>
                </div>
                <div className="mb-2">
                  <span className="font-medium text-gray-700">Phone: </span>
                  <span>{profile?.phone || "Not set"}</span>
                </div>
                <div className="mb-2">
                  <span className="font-medium text-gray-700">Email: </span>
                  <span>{currentUser.id}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </AuthGuard>
  );
}
