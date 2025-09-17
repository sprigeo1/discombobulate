import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface Question {
  id: string;
  category: string;
  text: string;
  options: {
    value: string;
    label: string;
    description?: string;
  }[];
}

interface AssessmentQuestionProps {
  question: Question;
  currentQuestion: number;
  totalQuestions: number;
  selectedAnswer?: string;
  onAnswerSelect: (questionId: string, answer: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
}

export default function AssessmentQuestion({
  question,
  currentQuestion,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect,
  onNext,
  onPrevious,
  canGoNext,
  canGoPrevious,
}: AssessmentQuestionProps) {
  const progressPercentage = ((currentQuestion) / totalQuestions) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress Header */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>Question {currentQuestion} of {totalQuestions}</span>
          <span>{Math.round(progressPercentage)}% complete</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Question Card */}
      <Card className="border-none shadow-lg">
        <CardHeader className="space-y-3">
          <div className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full inline-block w-fit">
            {question.category}
          </div>
          <CardTitle className="text-xl leading-relaxed">
            {question.text}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <RadioGroup
            value={selectedAnswer || ""}
            onValueChange={(value) => onAnswerSelect(question.id, value)}
            className="space-y-4"
          >
            {question.options.map((option) => (
              <div 
                key={option.value}
                className="flex items-start space-x-3 p-4 rounded-lg border hover-elevate cursor-pointer"
                onClick={() => onAnswerSelect(question.id, option.value)}
                data-testid={`option-${option.value}`}
              >
                <RadioGroupItem
                  value={option.value}
                  id={`option-${option.value}`}
                  className="mt-1"
                />
                <div className="flex-1 space-y-1">
                  <Label 
                    htmlFor={`option-${option.value}`}
                    className="text-base font-medium cursor-pointer"
                  >
                    {option.label}
                  </Label>
                  {option.description && (
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </RadioGroup>

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={!canGoPrevious}
              data-testid="button-previous"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            <Button
              onClick={onNext}
              disabled={!canGoNext || !selectedAnswer}
              data-testid="button-next"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}