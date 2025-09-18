import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Key, UserPlus } from "lucide-react";
import { UserRole } from "./RoleSelector";

interface AccessCodeEntryProps {
  onAccessCodeValid: (userData: { schoolId: string; userId: string; role: UserRole; schoolName: string; accessCode: string }) => void;
  onFirstTimeUser: () => void;
}

export default function AccessCodeEntry({ onAccessCodeValid, onFirstTimeUser }: AccessCodeEntryProps) {
  const [accessCode, setAccessCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessCode.trim() || accessCode.length !== 4) {
      toast({
        title: "Invalid Access Code",
        description: "Please enter a valid 4-character access code.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/users/access-code/${accessCode.toUpperCase()}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          toast({
            title: "Access Code Not Found",
            description: "This access code doesn't exist. Please check your code or select 'This is my first time here'.",
            variant: "destructive",
          });
        } else {
          throw new Error("Failed to validate access code");
        }
        return;
      }

      const user = await response.json();
      
      // Get school information
      const schoolResponse = await fetch(`/api/schools/${user.schoolId}`);
      if (!schoolResponse.ok) {
        throw new Error("Failed to fetch school information");
      }
      const school = await schoolResponse.json();

      onAccessCodeValid({
        schoolId: user.schoolId,
        userId: user.id,
        role: user.role as UserRole,
        schoolName: school.name,
        accessCode: user.accessCode,
      });

      toast({
        title: "Welcome Back!",
        description: `Welcome back to ${school.name}'s community assessment.`,
      });

    } catch (error) {
      console.error("Access code validation error:", error);
      toast({
        title: "Validation Failed",
        description: "There was an error validating your access code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Key className="w-6 h-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">Enter Your Access Code</CardTitle>
            <CardDescription>
              Enter the 4-character code you received after your first assessment
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="accessCode">Access Code</Label>
              <Input
                id="accessCode"
                type="text"
                placeholder="Enter your 4-character code"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                disabled={isSubmitting}
                maxLength={4}
                className="text-center text-lg tracking-widest"
                data-testid="input-access-code"
              />
              <p className="text-xs text-muted-foreground text-center">
                This code was provided after your first assessment
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting || accessCode.length !== 4}
              data-testid="button-validate-code"
            >
              {isSubmitting ? "Validating..." : "Continue to Assessment"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Don't have an access code?
            </p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={onFirstTimeUser}
              data-testid="button-first-time"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              This is my first time here
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
