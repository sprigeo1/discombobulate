import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Target, Clock, Users, ArrowRight, CheckCircle } from "lucide-react";
import { MicroRitual } from "./MicroRitualCard";
import { UserRole } from "./RoleSelector";

interface MicroRitualExamplesProps {
  userRole: UserRole;
  onClose: () => void;
}

export default function MicroRitualExamples({ userRole, onClose }: MicroRitualExamplesProps) {
  const [microRituals, setMicroRituals] = useState<MicroRitual[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadMicroRituals();
  }, [userRole]);

  const loadMicroRituals = async () => {
    try {
      const response = await fetch(`/api/micro-rituals/role/${userRole}`);
      const ritualsData = await response.json();
      // Show up to 5 examples
      setMicroRituals(ritualsData.slice(0, 5));
    } catch (error) {
      console.error("Error loading micro rituals:", error);
      toast({
        title: "Error",
        description: "Failed to load micro-ritual examples",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-lg">Loading micro-ritual examples...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              Micro-Rituals for {userRole.charAt(0).toUpperCase()}{userRole.slice(1)}s
            </h1>
            <p className="text-muted-foreground">
              Here are some actionable ideas you can put into action individually or with a small group
            </p>
          </div>

          {/* Micro-ritual Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {microRituals.map((ritual) => (
              <Card key={ritual.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{ritual.title}</CardTitle>
                      <CardDescription>{ritual.description}</CardDescription>
                    </div>
                    <Badge className={getDifficultyColor(ritual.difficulty)}>
                      {ritual.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{ritual.timeRequired}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{ritual.participantCount}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Steps:</h4>
                    <ol className="text-sm text-muted-foreground space-y-1">
                      {Array.isArray(ritual.steps) ? ritual.steps.map((step: string, index: number) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-primary font-medium">{index + 1}.</span>
                          <span>{step}</span>
                        </li>
                      )) : (
                        <li className="text-muted-foreground">Steps not available</li>
                      )}
                    </ol>
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-sm">
                      <span className="font-medium">Expected Outcome:</span> {ritual.expectedOutcome}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 pt-6">
            <Button
              variant="outline"
              onClick={onClose}
              data-testid="button-close-micro-rituals"
            >
              Close
            </Button>
            <Button
              onClick={onClose}
              data-testid="button-continue-after-rituals"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Footer Note */}
          <div className="text-center pt-4">
            <p className="text-sm text-muted-foreground">
              These are just examples. Feel free to adapt them to your school's unique culture and needs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
