import { useState } from "react";
import MicroRitualCard, { MicroRitual } from "../MicroRitualCard";

// todo: remove mock functionality
const mockRituals: MicroRitual[] = [
  {
    id: "greeting-circle",
    title: "Morning Greeting Circle",
    description: "Start each day with a brief circle where everyone shares one word about how they're feeling",
    category: "Student-Staff Connection",
    targetRelationship: "Student-Teacher",
    timeRequired: "5-10 minutes",
    participantCount: "Whole class",
    difficulty: "Easy",
    steps: [
      "Form a circle with all participants",
      "Teacher models by sharing one feeling word",
      "Go around the circle, each person shares one word",
      "No discussion needed - just listening and acknowledgment",
      "Close with a collective deep breath"
    ],
    expectedOutcome: "Creates a sense of community and helps teachers understand student emotional states",
    isBookmarked: false
  },
  {
    id: "peer-appreciation",
    title: "Weekly Peer Appreciation Notes",
    description: "Students write anonymous appreciation notes to classmates, fostering positive peer relationships",
    category: "Student-Student Connection", 
    targetRelationship: "Peer-to-Peer",
    timeRequired: "15 minutes",
    participantCount: "Class or small group",
    difficulty: "Easy",
    steps: [
      "Provide small cards or sticky notes to each student",
      "Students write genuine appreciation for a classmate's action or quality",
      "Notes should be specific and positive",
      "Collect and redistribute anonymously",
      "Allow time for students to read their notes"
    ],
    expectedOutcome: "Builds empathy, recognition, and positive peer connections",
    isBookmarked: true
  },
  {
    id: "staff-lunch-rotation",
    title: "Cross-Department Lunch Rotation",
    description: "Monthly lunch meetings between staff from different departments to build interdisciplinary connections",
    category: "Staff-Staff Connection",
    targetRelationship: "Cross-Department",
    timeRequired: "30-45 minutes",
    participantCount: "4-6 staff members",
    difficulty: "Medium",
    steps: [
      "Create rotating groups mixing departments (math with art, PE with science, etc.)",
      "Schedule monthly lunch meetings",
      "Provide conversation starters about teaching practices",
      "Share one successful strategy from each department",
      "Discuss how departments can support each other"
    ],
    expectedOutcome: "Breaks down silos and creates collaborative opportunities across departments",
    isBookmarked: false
  }
];

export default function MicroRitualCardExample() {
  const [bookmarkedRituals, setBookmarkedRituals] = useState<string[]>(['peer-appreciation']);
  const [completedRituals, setCompletedRituals] = useState<string[]>([]);

  const handleBookmark = (ritualId: string) => {
    setBookmarkedRituals(prev => 
      prev.includes(ritualId) 
        ? prev.filter(id => id !== ritualId)
        : [...prev, ritualId]
    );
  };

  const handleMarkCompleted = (ritualId: string) => {
    setCompletedRituals(prev => [...prev, ritualId]);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold">Micro-Rituals for Your Community</h2>
          <p className="text-muted-foreground">
            Small actions that build stronger relationships
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockRituals.map((ritual) => (
            <MicroRitualCard
              key={ritual.id}
              ritual={{
                ...ritual,
                isBookmarked: bookmarkedRituals.includes(ritual.id)
              }}
              onBookmark={handleBookmark}
              onMarkCompleted={handleMarkCompleted}
              isCompleted={completedRituals.includes(ritual.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}