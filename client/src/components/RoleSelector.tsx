import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, GraduationCap, UserCheck, Heart } from "lucide-react";

export type UserRole = "student" | "staff" | "administrator" | "counselor";

interface RoleSelectorProps {
  onRoleSelect: (role: UserRole) => void;
  selectedRole?: UserRole;
}

const roleData = {
  student: {
    icon: GraduationCap,
    title: "Student",
    description: "Share your perspective on relationships within your school community",
    color: "bg-primary text-primary-foreground"
  },
  staff: {
    icon: Users,
    title: "Staff Member",
    description: "Help us understand connections between staff and students",
    color: "bg-secondary text-secondary-foreground"
  },
  administrator: {
    icon: UserCheck,
    title: "Administrator",
    description: "Provide insights on school-wide relationship dynamics",
    color: "bg-accent text-accent-foreground"
  },
  counselor: {
    icon: Heart,
    title: "Counselor",
    description: "Share your unique perspective on student and staff wellbeing",
    color: "bg-muted text-muted-foreground"
  }
};

export default function RoleSelector({ onRoleSelect, selectedRole }: RoleSelectorProps) {
  const [hoveredRole, setHoveredRole] = useState<UserRole | null>(null);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">Welcome to Discombobulate</h2>
        <p className="text-muted-foreground">
          Choose your role to begin the relationship assessment
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(roleData).map(([role, data]) => {
          const Icon = data.icon;
          const isSelected = selectedRole === role;
          const isHovered = hoveredRole === role;
          
          return (
            <Card 
              key={role}
              className={`cursor-pointer transition-all duration-200 hover-elevate ${
                isSelected ? "ring-2 ring-primary" : ""
              }`}
              onMouseEnter={() => setHoveredRole(role as UserRole)}
              onMouseLeave={() => setHoveredRole(null)}
              onClick={() => onRoleSelect(role as UserRole)}
              data-testid={`button-role-${role}`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${isSelected || isHovered ? data.color : "bg-muted"}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{data.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {data.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              {isSelected && (
                <CardContent className="pt-0">
                  <Button 
                    className="w-full" 
                    variant="default"
                    data-testid="button-continue-assessment"
                  >
                    Continue Assessment
                  </Button>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}