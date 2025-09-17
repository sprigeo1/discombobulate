import RelationshipChart, { RelationshipData } from "../RelationshipChart";

// todo: remove mock functionality
const mockData: RelationshipData[] = [
  {
    category: "Student-Student Relationships",
    score: 72,
    trend: "up",
    description: "Peer connections and support systems",
    recommendations: [
      "Increase collaborative group activities",
      "Create peer mentorship programs"
    ]
  },
  {
    category: "Student-Staff Relationships", 
    score: 68,
    trend: "stable",
    description: "Trust and communication with educators",
    recommendations: [
      "Host informal student-teacher events",
      "Implement open office hours"
    ]
  },
  {
    category: "Staff-Staff Relationships",
    score: 85,
    trend: "up", 
    description: "Collaboration among educators",
    recommendations: [
      "Continue team building initiatives",
      "Share successful collaboration methods"
    ]
  },
  {
    category: "Administrator-Community",
    score: 58,
    trend: "down",
    description: "Leadership connection with school community",
    recommendations: [
      "Increase visibility in daily activities",
      "Create regular feedback channels"
    ]
  }
];

export default function RelationshipChartExample() {
  const overallScore = Math.round(
    mockData.reduce((sum, item) => sum + item.score, 0) / mockData.length
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <RelationshipChart data={mockData} overallScore={overallScore} />
      </div>
    </div>
  );
}