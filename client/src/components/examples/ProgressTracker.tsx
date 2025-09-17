import ProgressTracker, { CommunityProgress } from "../ProgressTracker";

// todo: remove mock functionality
const mockProgress: CommunityProgress = {
  overallScore: 73,
  previousScore: 68,
  improvementAreas: [
    {
      name: "Administrator-Community",
      currentScore: 58,
      targetScore: 75,
      improvementPercentage: 8
    },
    {
      name: "Student-Staff Relationships",
      currentScore: 68,
      targetScore: 80,
      improvementPercentage: 5
    },
    {
      name: "Student-Student Connections",
      currentScore: 72,
      targetScore: 85,
      improvementPercentage: 3
    }
  ],
  completedRituals: 8,
  totalRecommendedRituals: 12,
  lastAssessment: "March 15, 2024",
  nextMilestone: {
    title: "Strong Community Connection",
    description: "Reach 80+ points in all relationship categories",
    progress: 68
  }
};

export default function ProgressTrackerExample() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <ProgressTracker progress={mockProgress} />
      </div>
    </div>
  );
}