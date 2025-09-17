import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, Award, Target } from "lucide-react";

export interface CommunityProgress {
  overallScore: number;
  previousScore: number;
  improvementAreas: {
    name: string;
    currentScore: number;
    targetScore: number;
    improvementPercentage: number;
  }[];
  completedRituals: number;
  totalRecommendedRituals: number;
  lastAssessment: string;
  nextMilestone: {
    title: string;
    description: string;
    progress: number;
  };
}

interface ProgressTrackerProps {
  progress: CommunityProgress;
}

export default function ProgressTracker({ progress }: ProgressTrackerProps) {
  const scoreImprovement = progress.overallScore - progress.previousScore;
  const ritualCompletionRate = (progress.completedRituals / progress.totalRecommendedRituals) * 100;

  return (
    <div className="space-y-6">
      {/* Header with Overall Progress */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Community Progress Tracker</CardTitle>
              <CardDescription>
                Track your school community's relationship-building journey
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {progress.overallScore}
              </div>
              <div className="text-sm text-muted-foreground">
                Community Score
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress since last assessment</span>
            <div className="flex items-center space-x-1">
              {scoreImprovement > 0 ? (
                <>
                  <TrendingUp className="w-4 h-4 text-chart-2" />
                  <span className="text-chart-2 font-medium">+{scoreImprovement} points</span>
                </>
              ) : scoreImprovement < 0 ? (
                <>
                  <TrendingUp className="w-4 h-4 text-chart-1 rotate-180" />
                  <span className="text-chart-1 font-medium">{scoreImprovement} points</span>
                </>
              ) : (
                <span className="text-muted-foreground">No change</span>
              )}
            </div>
          </div>
          <Progress value={progress.overallScore} className="h-3" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Ritual Completion Progress */}
        <Card className="hover-elevate">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-primary" />
              <CardTitle className="text-base">Micro-Rituals Progress</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-semibold text-primary">
                {progress.completedRituals}
              </span>
              <span className="text-sm text-muted-foreground">
                of {progress.totalRecommendedRituals} recommended
              </span>
            </div>
            <Progress value={ritualCompletionRate} className="h-2" />
            <div className="text-sm text-muted-foreground">
              {Math.round(ritualCompletionRate)}% of recommended rituals completed
            </div>
          </CardContent>
        </Card>

        {/* Next Milestone */}
        <Card className="hover-elevate">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-primary" />
              <CardTitle className="text-base">Next Milestone</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-medium text-sm">{progress.nextMilestone.title}</h4>
              <p className="text-xs text-muted-foreground mt-1">
                {progress.nextMilestone.description}
              </p>
            </div>
            <Progress value={progress.nextMilestone.progress} className="h-2" />
            <div className="text-sm text-muted-foreground">
              {Math.round(progress.nextMilestone.progress)}% complete
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Improvement Areas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Key Improvement Areas</span>
          </CardTitle>
          <CardDescription>
            Relationship categories showing the most growth potential
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {progress.improvementAreas.map((area, index) => (
            <div key={index} className="space-y-2" data-testid={`improvement-area-${index}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm">{area.name}</span>
                  {area.improvementPercentage > 0 && (
                    <Badge variant="secondary" className="text-xs bg-chart-2/10 text-chart-2">
                      +{area.improvementPercentage}%
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {area.currentScore} → {area.targetScore}
                </div>
              </div>
              <div className="space-y-1">
                <Progress value={area.currentScore} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  Target: {area.targetScore} points
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Assessment History */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Last assessment: {progress.lastAssessment}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}