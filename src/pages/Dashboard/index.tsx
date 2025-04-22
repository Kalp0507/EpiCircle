
import { useAuth } from "@/context/AuthContext";
import CustomerDashboard from "./CustomerDashboard";
import VendorDashboard from "./VendorDashboard";
import InternDashboard from "./InternDashboard";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AuthGuard from "@/components/layout/AuthGuard";

export default function Dashboard() {
  const { currentUser } = useAuth();

  const renderDashboard = () => {
    switch (currentUser?.role) {
      case "customer":
        return <CustomerDashboard />;
      case "vendor":
        return <VendorDashboard />;
      case "intern":
        return <InternDashboard />;
      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-700">Unknown user role</h2>
            <p className="mt-2 text-gray-500">Please contact support.</p>
          </div>
        );
    }
  };

  return (
    <AuthGuard>
      <DashboardLayout>
        {renderDashboard()}
      </DashboardLayout>
    </AuthGuard>
  );
}
