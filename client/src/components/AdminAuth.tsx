import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, ArrowLeft } from "lucide-react";

interface AdminAuthProps {
  onAuthenticated: () => void;
  onCancel: () => void;
}

export default function AdminAuth({ onAuthenticated, onCancel }: AdminAuthProps) {
  const [accessCode, setAccessCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessCode.trim()) {
      toast({
        title: "Access Code Required",
        description: "Please enter the administrator access code.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accessCode }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast({
            title: "Access Denied",
            description: "Invalid access code. Please try again.",
            variant: "destructive",
          });
        } else {
          throw new Error("Authentication failed");
        }
        return;
      }

      const result = await response.json();
      if (result.authenticated) {
        toast({
          title: "Access Granted",
          description: "Welcome to the administrator dashboard.",
        });
        onAuthenticated();
      }
    } catch (error) {
      console.error("Authentication error:", error);
      toast({
        title: "Authentication Failed",
        description: "There was an error authenticating. Please try again.",
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
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">Administrator Access</CardTitle>
            <CardDescription>
              Enter the administrator access code to continue
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="accessCode">Access Code</Label>
              <Input
                id="accessCode"
                type="password"
                placeholder="Enter access code"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                disabled={isSubmitting}
                data-testid="input-admin-access-code"
              />
              <p className="text-xs text-muted-foreground">
                This code provides access to administrative functions
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="flex-1"
                data-testid="button-cancel-admin"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !accessCode.trim()}
                className="flex-1"
                data-testid="button-submit-admin"
              >
                {isSubmitting ? "Authenticating..." : "Access Dashboard"}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Administrator access is restricted and monitored
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
