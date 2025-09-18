import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Target, ArrowRight } from "lucide-react";

interface MicroRitualTrackingProps {
  onContinue: () => void;
  onSkip: () => void;
  userId: string;
}

export default function MicroRitualTracking({ onContinue, onSkip, userId }: MicroRitualTrackingProps) {
  const [triedRituals, setTriedRituals] = useState(false);
  const [ritualDescription, setRitualDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (triedRituals && !ritualDescription.trim()) {
      toast({
        title: "Please Describe Your Experience",
        description: "If you tried micro-rituals, please tell us about your experience.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (triedRituals && ritualDescription.trim()) {
        // Save the micro-ritual attempt
        await fetch("/api/micro-ritual-attempts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            attemptedRituals: ritualDescription.trim(),
          }),
        });
      }

      onContinue();
    } catch (error) {
      console.error("Error saving micro-ritual attempt:", error);
      toast({
        title: "Error",
        description: "There was an error saving your information. Please try again.",
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
            <Target className="w-6 h-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">Micro-Ritual Check-in</CardTitle>
            <CardDescription>
              Let us know about your experience with the suggested micro-rituals
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-lg font-medium mb-4">
                Did you try any of the micro-rituals we suggested?
              </p>
              
              <div className="flex gap-4 justify-center">
                <Button
                  variant={triedRituals ? "default" : "outline"}
                  onClick={() => setTriedRituals(true)}
                  data-testid="button-tried-rituals-yes"
                >
                  Yes
                </Button>
                <Button
                  variant={!triedRituals ? "default" : "outline"}
                  onClick={() => setTriedRituals(false)}
                  data-testid="button-tried-rituals-no"
                >
                  No
                </Button>
              </div>
            </div>

            {triedRituals && (
              <div className="space-y-2">
                <Label htmlFor="ritualDescription">
                  Tell us about the micro-rituals you tried
                </Label>
                <Textarea
                  id="ritualDescription"
                  placeholder="Describe which micro-rituals you tried and how they went..."
                  value={ritualDescription}
                  onChange={(e) => setRitualDescription(e.target.value)}
                  disabled={isSubmitting}
                  rows={4}
                  data-testid="textarea-ritual-description"
                />
                <p className="text-xs text-muted-foreground">
                  Your feedback helps us improve the suggestions for your school community
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onSkip}
              disabled={isSubmitting}
              className="flex-1"
              data-testid="button-skip-ritual-tracking"
            >
              Skip
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1"
              data-testid="button-continue-to-assessment"
            >
              {isSubmitting ? "Saving..." : "Go to the Discombobulator"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
