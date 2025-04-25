
import React from "react";
import { User } from "lucide-react";
import { UserRole } from "@/types";

interface RoleSelectionProps {
  onRoleSelect: (role: UserRole) => void;
}

const RoleSelection = ({ onRoleSelect }: RoleSelectionProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Select Your Role</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <RoleCard
          title="Vendor"
          description="Quote on products"
          icon="vendor"
          onClick={() => onRoleSelect("vendor")}
        />
        <RoleCard
          title="Intern"
          description="Upload products"
          icon="intern"
          onClick={() => onRoleSelect("intern")}
        />
        <RoleCard
          title="Admin"
          description="Manage everything"
          icon="admin"
          onClick={() => onRoleSelect("admin")}
        />
      </div>
    </div>
  );
};

interface RoleCardProps {
  title: string;
  description: string;
  icon: "vendor" | "intern" | "admin";
  onClick: () => void;
}

const RoleCard = ({ title, description, icon, onClick }: RoleCardProps) => {
  const getIconColor = () => {
    switch (icon) {
      case "vendor":
        return "text-purple-600 bg-purple-100";
      case "intern":
        return "text-blue-600 bg-blue-100";
      case "admin":
        return "text-green-600 bg-green-100";
    }
  };

  return (
    <div
      onClick={onClick}
      className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex flex-col items-center space-y-3 hover:border-purple-500 cursor-pointer"
    >
      <span className={`h-10 w-10 rounded-full ${getIconColor()} flex items-center justify-center`}>
        <User className="h-6 w-6" />
      </span>
      <div className="text-center">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </div>
    </div>
  );
};

export default RoleSelection;
