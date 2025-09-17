import { useState } from "react";
import AssessmentQuestion, { Question } from "../AssessmentQuestion";

// todo: remove mock functionality
const mockQuestion: Question = {
  id: "student-staff-1",
  category: "Student-Staff Relationships",
  text: "How comfortable do you feel approaching a teacher or staff member when you need help or support?",
  options: [
    {
      value: "very-comfortable",
      label: "Very comfortable",
      description: "I feel completely at ease reaching out for help"
    },
    {
      value: "somewhat-comfortable",
      label: "Somewhat comfortable",
      description: "I feel okay about it, but sometimes hesitate"
    },
    {
      value: "neutral",
      label: "Neutral",
      description: "It depends on the situation and the person"
    },
    {
      value: "somewhat-uncomfortable",
      label: "Somewhat uncomfortable",
      description: "I prefer to handle things on my own when possible"
    },
    {
      value: "very-uncomfortable",
      label: "Very uncomfortable",
      description: "I avoid reaching out unless absolutely necessary"
    }
  ]
};

export default function AssessmentQuestionExample() {
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setSelectedAnswer(answer);
    console.log('Answer selected:', { questionId, answer });
  };

  const handleNext = () => {
    console.log('Next question triggered');
  };

  const handlePrevious = () => {
    console.log('Previous question triggered');
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <AssessmentQuestion
        question={mockQuestion}
        currentQuestion={3}
        totalQuestions={15}
        selectedAnswer={selectedAnswer}
        onAnswerSelect={handleAnswerSelect}
        onNext={handleNext}
        onPrevious={handlePrevious}
        canGoNext={true}
        canGoPrevious={true}
      />
    </div>
  );
}