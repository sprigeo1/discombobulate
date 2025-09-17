import { useState } from "react";
import RoleSelector, { UserRole } from "../RoleSelector";

export default function RoleSelectorExample() {
  const [selectedRole, setSelectedRole] = useState<UserRole | undefined>();

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    console.log('Role selected:', role);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <RoleSelector 
        onRoleSelect={handleRoleSelect}
        selectedRole={selectedRole}
      />
    </div>
  );
}