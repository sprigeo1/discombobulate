import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Target, CheckCircle, BookmarkPlus, BookmarkCheck } from "lucide-react";

export interface MicroRitual {
  id: string;
  title: string;
  description: string;
  category: string;
  targetRelationship: string;
  timeRequired: string;
  participantCount: string;
  difficulty: "Easy" | "Medium" | "Advanced";
  steps: string[];
  expectedOutcome: string;
  isBookmarked?: boolean;
}

interface MicroRitualCardProps {
  ritual: MicroRitual;
  onBookmark?: (ritualId: string) => void;
  onMarkCompleted?: (ritualId: string) => void;
  isCompleted?: boolean;
}

export default function MicroRitualCard({ 
  ritual, 
  onBookmark, 
  onMarkCompleted,
  isCompleted = false
}: MicroRitualCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(ritual.isBookmarked || false);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-chart-2/10 text-chart-2";
      case "Medium":
        return "bg-chart-3/10 text-chart-3";
      case "Advanced":
        return "bg-chart-1/10 text-chart-1";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    onBookmark?.(ritual.id);
    console.log(`Ritual ${isBookmarked ? 'unbookmarked' : 'bookmarked'}:`, ritual.title);
  };

  const handleMarkCompleted = () => {
    onMarkCompleted?.(ritual.id);
    console.log('Ritual completed:', ritual.title);
  };

  return (
    <Card className={`hover-elevate transition-all duration-200 ${isCompleted ? 'bg-chart-2/5' : ''}`}>
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                {ritual.category}
              </Badge>
              <Badge 
                variant="outline" 
                className={`text-xs ${getDifficultyColor(ritual.difficulty)}`}
              >
                {ritual.difficulty}
              </Badge>
            </div>
            <CardTitle className={`text-lg leading-snug ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
              {ritual.title}
            </CardTitle>
            <CardDescription className="text-sm">
              {ritual.description}
            </CardDescription>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={handleBookmark}
              data-testid={`button-bookmark-${ritual.id}`}
            >
              {isBookmarked ? 
                <BookmarkCheck className="w-4 h-4 text-primary" /> : 
                <BookmarkPlus className="w-4 h-4" />
              }
            </Button>
            
            {!isCompleted && (
              <Button
                size="icon"
                variant="ghost"
                onClick={handleMarkCompleted}
                data-testid={`button-complete-${ritual.id}`}
              >
                <CheckCircle className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Quick Info */}
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Target className="w-4 h-4" />
            <span>{ritual.targetRelationship}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{ritual.timeRequired}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{ritual.participantCount}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full"
          data-testid={`button-expand-${ritual.id}`}
        >
          {isExpanded ? "Hide Details" : "View Details"}
        </Button>

        {isExpanded && (
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <h4 className="font-medium text-sm mb-2">Steps to Follow:</h4>
              <ol className="space-y-2 text-sm">
                {ritual.steps.map((step, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-primary font-medium min-w-[1.5rem]">
                      {index + 1}.
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
            
            <div>
              <h4 className="font-medium text-sm mb-2">Expected Outcome:</h4>
              <p className="text-sm text-muted-foreground">
                {ritual.expectedOutcome}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}