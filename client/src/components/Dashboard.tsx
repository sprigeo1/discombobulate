import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import SchoolSetup from "./SchoolSetup";
import AccessCodeEntry from "./AccessCodeEntry";
import MicroRitualTracking from "./MicroRitualTracking";
import MicroRitualExamples from "./MicroRitualExamples";
import AdminAuth from "./AdminAuth";
import AdminDashboard from "./AdminDashboard";
import AssessmentQuestion, { Question } from "./AssessmentQuestion";
import RelationshipChart, { RelationshipData } from "./RelationshipChart";
import MicroRitualCard, { MicroRitual } from "./MicroRitualCard";
import ProgressTracker, { CommunityProgress } from "./ProgressTracker";
import { BarChart3, Users, Target, TrendingUp, BookOpen, Clock, Settings } from "lucide-react";
import { UserRole } from "./RoleSelector";

interface UserSession {
  schoolId: string;
  userId: string;
  role: UserRole;
  schoolName: string;
  accessCode: string;
}

export default function Dashboard() {
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [currentView, setCurrentView] = useState<"access-code" | "setup" | "micro-ritual-tracking" | "assessment" | "results" | "cooldown" | "micro-ritual-examples" | "admin-auth" | "admin-dashboard">("access-code");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [microRituals, setMicroRituals] = useState<MicroRitual[]>([]);
  const [schoolScore, setSchoolScore] = useState<any>(null);
  const [assessmentCount, setAssessmentCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [cooldownInfo, setCooldownInfo] = useState<any>(null);
  const { toast } = useToast();

  // Check if user can take assessment
  useEffect(() => {
    if (userSession) {
      checkAssessmentEligibility();
      loadMicroRituals();
    }
  }, [userSession]);

  // Load assessment count when results view is displayed
  useEffect(() => {
    if (currentView === "results" && userSession) {
      loadAssessmentCount();
    }
  }, [currentView, userSession]);

  // Listen for admin access requests
  useEffect(() => {
    const handleAdminAccessRequest = () => {
      handleAdminAccess();
    };

    window.addEventListener('admin-access-requested', handleAdminAccessRequest);
    return () => {
      window.removeEventListener('admin-access-requested', handleAdminAccessRequest);
    };
  }, []);

  const checkAssessmentEligibility = async () => {
    if (!userSession) return;

    try {
      const response = await fetch(`/api/users/${userSession.userId}/can-take-assessment`);
      const data = await response.json();
      
      if (!data.canTakeAssessment) {
        setCurrentView("cooldown");
        loadSchoolScore();
      } else {
        loadQuestions();
      }
    } catch (error) {
      console.error("Error checking assessment eligibility:", error);
      toast({
        title: "Error",
        description: "Failed to check assessment eligibility",
        variant: "destructive",
      });
    }
  };

  const loadQuestions = async () => {
    if (!userSession) return;

    try {
      const response = await fetch(`/api/questions/${userSession.role}`);
      const questionsData = await response.json();
      setQuestions(questionsData);
    } catch (error) {
      console.error("Error loading questions:", error);
      toast({
        title: "Error",
        description: "Failed to load assessment questions",
        variant: "destructive",
      });
    }
  };

  const loadMicroRituals = async () => {
    if (!userSession) return;

    try {
      const response = await fetch(`/api/micro-rituals/role/${userSession.role}`);
      const ritualsData = await response.json();
      setMicroRituals(ritualsData);
    } catch (error) {
      console.error("Error loading micro rituals:", error);
    }
  };

  const loadSchoolScore = async () => {
    if (!userSession) return;

    try {
      const response = await fetch(`/api/schools/${userSession.schoolId}/score`);
      const scoreData = await response.json();
      setSchoolScore(scoreData);
    } catch (error) {
      console.error("Error loading school score:", error);
    }
  };

  const loadAssessmentCount = async () => {
    if (!userSession) return;
    
    try {
      const response = await fetch(`/api/schools/${userSession.schoolId}/assessment-count`);
      if (response.ok) {
        const data = await response.json();
        setAssessmentCount(data.assessmentCount);
      }
    } catch (error) {
      console.error("Error loading assessment count:", error);
    }
  };

  const handleSetupComplete = (sessionData: UserSession) => {
    setUserSession(sessionData);
    setCurrentView("assessment");
  };

  const handleAccessCodeValid = (sessionData: UserSession) => {
    setUserSession(sessionData);
    setCurrentView("micro-ritual-tracking");
  };

  const handleFirstTimeUser = () => {
    setCurrentView("setup");
  };

  const handleMicroRitualTrackingComplete = () => {
    setCurrentView("assessment");
  };

  const handleMicroRitualTrackingSkip = () => {
    setCurrentView("assessment");
  };

  const handleAdminAccess = () => {
    setCurrentView("admin-auth");
  };

  const handleAdminAuthenticated = () => {
    setCurrentView("admin-dashboard");
  };

  const handleAdminCancel = () => {
    setCurrentView("access-code");
  };

  const handleAdminClose = () => {
    setCurrentView("access-code");
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    // Check if current question is answered
    const currentQuestionId = questions[currentQuestion]?.id;
    if (!currentQuestionId || !answers[currentQuestionId]) {
      toast({
        title: "Please Answer Question",
        description: "Please select an answer before proceeding.",
        variant: "destructive",
      });
      return;
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      submitAssessment();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const submitAssessment = async () => {
    if (!userSession) return;

    setIsLoading(true);

    try {
      // Create responses for all questions
      const responses = questions.map(question => ({
        questionId: question.id,
        answer: answers[question.id]
      }));

      // Check if any questions are unanswered
      const unansweredQuestions = responses.filter(response => 
        response.answer === undefined || response.answer === ""
      );

      if (unansweredQuestions.length > 0) {
        console.log("Unanswered questions:", unansweredQuestions.length, "out of", questions.length);
        console.log("Answers state:", answers);
        console.log("Questions:", questions.map(q => ({ id: q.id, text: q.text })));
        
        toast({
          title: "Incomplete Assessment",
          description: "Please answer all questions before submitting.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/assessments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userSession.userId,
          responses,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit assessment");
      }

      const result = await response.json();
      setSchoolScore(result.schoolScore);
      
      // Load assessment count for the results page
      await loadAssessmentCount();
      
      // Show access code and 7-day message
      toast({
        title: "Assessment Complete!",
        description: `Your access code is: ${result.accessCode}. You can return in 7 days to take another assessment.`,
        duration: 10000, // Show for 10 seconds
      });
      
      setCurrentView("micro-ritual-examples");

    } catch (error) {
      console.error("Error submitting assessment:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your assessment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicroRitualComplete = async (ritualId: string) => {
    if (!userSession) return;

    try {
      const response = await fetch("/api/micro-ritual-completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userSession.userId,
          microRitualId: ritualId,
        }),
      });

      if (response.ok) {
        toast({
          title: "Micro-Ritual Completed!",
          description: "Great job! Your completion has been recorded and will contribute to your school's score.",
        });
        
        // Reload school score
        loadSchoolScore();
      }
    } catch (error) {
      console.error("Error marking ritual as complete:", error);
    }
  };

  // Convert school score data to chart format
  const convertToChartData = (scoreData: any): RelationshipData[] => {
    if (!scoreData?.categoryScores) return [];

    return Object.entries(scoreData.categoryScores).map(([category, score]) => ({
      category,
      score: score as number,
      trend: "stable" as const,
      description: `${category} relationship dynamics`,
      recommendations: [`Improve ${category.toLowerCase()} connections`]
    }));
  };

  if (currentView === "admin-auth") {
    return <AdminAuth onAuthenticated={handleAdminAuthenticated} onCancel={handleAdminCancel} />;
  }

  if (currentView === "admin-dashboard") {
    return <AdminDashboard onClose={handleAdminClose} />;
  }

  if (currentView === "access-code") {
    return (
      <div className="relative">
        <AccessCodeEntry onAccessCodeValid={handleAccessCodeValid} onFirstTimeUser={handleFirstTimeUser} />
        {/* Invisible admin access button */}
        <button
          onClick={handleAdminAccess}
          className="absolute bottom-4 right-4 w-8 h-8 opacity-0 hover:opacity-100 transition-opacity"
          data-testid="button-admin-access"
          title="Administrator Access"
        >
          <Settings className="w-6 h-6 text-muted-foreground" />
        </button>
      </div>
    );
  }

  if (currentView === "setup") {
    return (
      <div className="relative">
        <SchoolSetup onSetupComplete={handleSetupComplete} />
        {/* Admin access button for setup view */}
        <button
          onClick={handleAdminAccess}
          className="absolute bottom-4 right-4 p-2 hover:bg-muted rounded transition-colors"
          data-testid="button-admin-access-setup"
          title="Administrator Access"
        >
          <Settings className="w-4 h-4 text-muted-foreground hover:text-foreground" />
        </button>
      </div>
    );
  }

  if (currentView === "micro-ritual-tracking") {
    return (
      <MicroRitualTracking
        onContinue={handleMicroRitualTrackingComplete}
        onSkip={handleMicroRitualTrackingSkip}
        userId={userSession?.userId || ""}
      />
    );
  }

  if (currentView === "micro-ritual-examples") {
    return (
      <MicroRitualExamples
        userRole={userSession?.role || "student"}
        onClose={() => setCurrentView("results")}
      />
    );
  }

  if (currentView === "cooldown") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <CardTitle>Assessment Cooldown</CardTitle>
            <CardDescription>
              You can take the assessment once every 7 days to track meaningful changes in your school community.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              In the meantime, explore micro-rituals and view your school's progress!
            </p>
            
            {/* Access Code Display */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="text-center space-y-2">
                <p className="text-sm font-medium">Your Access Code</p>
                <div className="bg-background px-3 py-2 rounded-md border inline-block">
                  <code className="text-lg font-mono tracking-widest text-primary">
                    {userSession?.accessCode}
                  </code>
                </div>
                <p className="text-xs text-muted-foreground">
                  Save this code to return for your next assessment
                </p>
              </div>
            </div>
            
            <Button 
              onClick={() => setCurrentView("results")}
              className="w-full"
            >
              View Results & Micro-Rituals
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentView === "assessment") {
    if (questions.length === 0) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg">Loading assessment questions...</div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto mb-6">
            <h1 className="text-2xl font-semibold text-center mb-2">
              {userSession?.schoolName} Community Assessment
            </h1>
            <p className="text-muted-foreground text-center">
              Role: {userSession?.role.charAt(0).toUpperCase()}{userSession?.role.slice(1)}
            </p>
          </div>

          <AssessmentQuestion
            question={questions[currentQuestion]}
            currentQuestion={currentQuestion + 1}
            totalQuestions={questions.length}
            selectedAnswer={answers[questions[currentQuestion]?.id]}
            onAnswerSelect={handleAnswerSelect}
            onNext={handleNext}
            onPrevious={handlePrevious}
            canGoNext={!isLoading}
            canGoPrevious={currentQuestion > 0 && !isLoading}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              {userSession?.schoolName} Community Assessment
            </h1>
            <p className="text-muted-foreground">
              Insights and actionable steps to strengthen your school community
            </p>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="results" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="results" className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Results</span>
              </TabsTrigger>
              <TabsTrigger value="rituals" className="flex items-center space-x-2">
                <Target className="w-4 h-4" />
                <span>Micro-Rituals</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="results" className="space-y-6">
              {schoolScore ? (
                <div className="space-y-6">
                  <RelationshipChart 
                    data={convertToChartData(schoolScore)} 
                    overallScore={schoolScore.overallScore} 
                  />
                  
                  {/* Assessment Count Display */}
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="pt-6">
                      <div className="text-center space-y-2">
                        <h3 className="font-semibold text-lg text-blue-900">
                          Community Participation
                        </h3>
                        <p className="text-blue-700">
                          <span className="text-2xl font-bold">{assessmentCount}</span> community members have completed assessments in the current 7-day period
                        </p>
                        <p className="text-sm text-blue-600">
                          This score reflects the collective input of all participants at {userSession?.schoolName}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading school results...</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="rituals" className="space-y-6">
              <div className="text-center space-y-2 mb-6">
                <h2 className="text-2xl font-semibold">Micro-Rituals for Your Community</h2>
                <p className="text-muted-foreground">
                  Activities to strengthen relationships and build connection
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {microRituals.map((ritual) => (
                  <MicroRitualCard
                    key={ritual.id}
                    ritual={ritual}
                    onBookmark={(id) => console.log('Bookmarked:', id)}
                    onMarkCompleted={handleMicroRitualComplete}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Bar */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">Continue Building Community</h3>
                    <p className="text-muted-foreground">
                      Complete micro-rituals and return in 7 days for your next assessment
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline"
                      onClick={() => setCurrentView("micro-ritual-examples")}
                      data-testid="button-try-micro-rituals"
                    >
                      Try these Micro-rituals
                    </Button>
                    <Button 
                      onClick={() => setCurrentView("access-code")}
                      data-testid="button-new-assessment"
                    >
                      New Assessment
                    </Button>
                  </div>
                </div>
                
                {/* Access Code Display */}
                <div className="pt-4 border-t border-primary/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Your Access Code</p>
                      <p className="text-xs text-muted-foreground">
                        Save this code to return for your next assessment in 7 days
                      </p>
                    </div>
                    <div className="bg-background px-3 py-2 rounded-md border">
                      <code className="text-lg font-mono tracking-widest text-primary">
                        {userSession?.accessCode}
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}