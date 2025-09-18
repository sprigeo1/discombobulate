import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { School, Building, User, Settings } from "lucide-react";
import { UserRole } from "./RoleSelector";
import SchoolAutocomplete from "./SchoolAutocomplete";
import { School as SchoolType } from "@shared/schema";

interface SchoolSetupProps {
  onSetupComplete: (data: { schoolId: string; userId: string; role: UserRole; schoolName: string; accessCode: string }) => void;
}

export default function SchoolSetup({ onSetupComplete }: SchoolSetupProps) {
  const [schoolName, setSchoolName] = useState("");
  const [selectedSchool, setSelectedSchool] = useState<SchoolType | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Auto-submit when both school and role are selected
  useEffect(() => {
    if (selectedSchool && selectedRole && !isSubmitting) {
      handleSubmit();
    }
  }, [selectedSchool, selectedRole]);

  const handleSubmit = async () => {
    if (!selectedSchool || !selectedRole) {
      return; // Don't show error, just wait for both to be filled
    }

    setIsSubmitting(true);

    try {
      // Use the selected school directly
      const school = selectedSchool;

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
        title: "Welcome to Discombobulate!",
        description: `Connected to ${school.name} in ${school.district}, ${school.city}, ${school.state}.`,
      });

      onSetupComplete({
        schoolId: school.id,
        userId: user.id,
        role: selectedRole as UserRole,
        schoolName: school.name,
        accessCode: user.accessCode,
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
            <CardTitle className="text-2xl">Welcome to the Discombobulator</CardTitle>
            <CardDescription>
              Re-thinking what makes a safer school
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            {/* School Name Input */}
            <SchoolAutocomplete
              value={schoolName}
              onChange={setSchoolName}
              onSelect={setSelectedSchool}
              disabled={isSubmitting}
              data-testid="input-school-name"
            />
            <p className="text-xs text-muted-foreground">
              Click on the button below that best matches where you belong at your school. Then answer the short list of questions.
            </p>

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
                      } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                      onClick={() => !isSubmitting && setSelectedRole(option.value)}
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

            {isSubmitting && (
              <div className="text-center py-4">
                <div className="text-sm text-muted-foreground">
                  Setting up your account and generating your access code...
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
              Your responses will be anonymous and used only to improve your school community
              <button
                onClick={() => {
                  // This will be handled by the parent component
                  window.dispatchEvent(new CustomEvent('admin-access-requested'));
                }}
                className="ml-2 p-1 hover:bg-muted rounded transition-colors"
                data-testid="button-admin-access"
                title="Administrator Access"
              >
                <Settings className="w-3 h-3 text-muted-foreground hover:text-foreground" />
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}