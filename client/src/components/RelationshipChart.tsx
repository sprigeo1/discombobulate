import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Users, Heart, MessageCircle } from "lucide-react";

export interface RelationshipData {
  category: string;
  score: number;
  trend: "up" | "down" | "stable";
  description: string;
  recommendations: string[];
}

interface RelationshipChartProps {
  data: RelationshipData[];
  overallScore: number;
}

export default function RelationshipChart({ data, overallScore }: RelationshipChartProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-chart-2";
    if (score >= 60) return "text-chart-3";
    return "text-chart-1";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-chart-2/10";
    if (score >= 60) return "bg-chart-3/10";
    return "bg-chart-1/10";
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-chart-2" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-chart-1" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    if (category.includes("Student")) return <Users className="w-5 h-5" />;
    if (category.includes("Staff")) return <MessageCircle className="w-5 h-5" />;
    return <Heart className="w-5 h-5" />;
  };

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <Card className="border-none shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Community Relationship Health</CardTitle>
          <CardDescription>
            Overall assessment of relationship strength in your school community
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className={`text-6xl font-bold ${getScoreColor(overallScore)}`}>
              {overallScore}
            </div>
            <div className="text-lg text-muted-foreground">out of 100</div>
          </div>
          <Progress value={overallScore} className="h-3" />
          <div className="flex justify-center">
            <Badge 
              variant="secondary" 
              className={`text-sm px-4 py-2 ${getScoreBgColor(overallScore)}`}
            >
              {overallScore >= 80 ? "Strong Community" : 
               overallScore >= 60 ? "Growing Community" : "Building Community"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Individual Category Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.map((item, index) => (
          <Card key={index} className="hover-elevate" data-testid={`card-relationship-${index}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div>
                    <CardTitle className="text-base">{item.category}</CardTitle>
                    <CardDescription className="text-xs">
                      {item.description}
                    </CardDescription>
                  </div>
                </div>
                {getTrendIcon(item.trend)}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-2xl font-semibold ${getScoreColor(item.score)}`}>
                  {item.score}
                </span>
                <span className="text-sm text-muted-foreground">/100</span>
              </div>
              <Progress value={item.score} className="h-2" />
              
              {item.recommendations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Key Focus Areas:
                  </h4>
                  <ul className="space-y-1">
                    {item.recommendations.slice(0, 2).map((rec, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start">
                        <span className="text-primary mr-2">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}