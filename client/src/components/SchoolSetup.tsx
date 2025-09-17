import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { School, Building, User } from "lucide-react";
import { UserRole } from "./RoleSelector";

interface SchoolSetupProps {
  onSetupComplete: (data: { schoolId: string; userId: string; role: UserRole; schoolName: string }) => void;
}

export default function SchoolSetup({ onSetupComplete }: SchoolSetupProps) {
  const [schoolName, setSchoolName] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!schoolName.trim() || !selectedRole) {
      toast({
        title: "Missing Information",
        description: "Please provide both school name and your role.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Create or get school
      const schoolResponse = await fetch("/api/schools", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: schoolName.trim() }),
      });

      if (!schoolResponse.ok) {
        throw new Error("Failed to create/find school");
      }

      const { school, isNew } = await schoolResponse.json();

      // Step 2: Create user
      const userResponse = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          schoolId: school.id,
          role: selectedRole,
        }),
      });

      if (!userResponse.ok) {
        throw new Error("Failed to create user");
      }

      const user = await userResponse.json();

      toast({
        title: isNew ? "Welcome to Discombobulate!" : "Welcome back!",
        description: isNew 
          ? `${schoolName} has been registered successfully.`
          : `Connected to ${schoolName}'s community assessment.`,
      });

      onSetupComplete({
        schoolId: school.id,
        userId: user.id,
        role: selectedRole as UserRole,
        schoolName: school.name,
      });

    } catch (error) {
      console.error("Setup error:", error);
      toast({
        title: "Setup Failed",
        description: "There was an error setting up your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleOptions = [
    {
      value: "student" as UserRole,
      label: "Student",
      description: "I am a student at this school",
      icon: User
    },
    {
      value: "staff" as UserRole,
      label: "Staff Member",
      description: "I work as teaching or support staff",
      icon: User
    },
    {
      value: "administrator" as UserRole,
      label: "Administrator",
      description: "I am in a leadership or administrative role",
      icon: User
    },
    {
      value: "counselor" as UserRole,
      label: "Counselor",
      description: "I provide counseling or mental health support",
      icon: User
    }
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <School className="w-6 h-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">Join Your School Community</CardTitle>
            <CardDescription>
              Help us understand your school's relationship dynamics
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* School Name Input */}
            <div className="space-y-2">
              <Label htmlFor="schoolName" className="flex items-center space-x-2">
                <Building className="w-4 h-4" />
                <span>School Name</span>
              </Label>
              <Input
                id="schoolName"
                type="text"
                placeholder="Enter your school's name"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                disabled={isSubmitting}
                data-testid="input-school-name"
              />
              <p className="text-xs text-muted-foreground">
                This will connect you with other community members from your school
              </p>
            </div>

            {/* Role Selection */}
            <div className="space-y-3">
              <Label>Your Role</Label>
              <div className="space-y-2">
                {roleOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <div
                      key={option.value}
                      className={`p-3 border rounded-lg cursor-pointer transition-all hover-elevate ${
                        selectedRole === option.value 
                          ? "border-primary bg-primary/5" 
                          : "border-border"
                      }`}
                      onClick={() => setSelectedRole(option.value)}
                      data-testid={`button-role-${option.value}`}
                    >
                      <div className="flex items-start space-x-3">
                        <Icon className="w-5 h-5 mt-0.5 text-primary" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{option.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {option.description}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting || !schoolName.trim() || !selectedRole}
              data-testid="button-continue-setup"
            >
              {isSubmitting ? "Setting up..." : "Continue to Assessment"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Your responses will be anonymous and used only to improve your school community
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}