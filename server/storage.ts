import { 
  type School, type InsertSchool,
  type User, type InsertUser,
  type Question, type Response, type InsertResponse,
  type MicroRitual, type MicroRitualCompletion, type InsertMicroRitualCompletion,
  type MicroRitualAttempt, type InsertMicroRitualAttempt,
  type SchoolScore
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Schools
  createSchool(school: InsertSchool): Promise<School>;
  getSchoolByName(name: string): Promise<School | undefined>;
  getSchool(id: string): Promise<School | undefined>;
  searchSchools(query: string): Promise<School[]>;
  getAllSchools(): Promise<School[]>;
  updateSchool(id: string, school: Partial<InsertSchool>): Promise<School>;
  deleteSchool(id: string): Promise<void>;

  // Users
  createUser(user: InsertUser): Promise<User>;
  getUser(id: string): Promise<User | undefined>;
  getUserByAccessCode(accessCode: string): Promise<User | undefined>;
  getUsersBySchool(schoolId: string): Promise<User[]>;
  updateUserLastAssessment(userId: string): Promise<void>;
  canUserTakeAssessment(userId: string): Promise<boolean>;
  generateUniqueAccessCode(): Promise<string>;

  // Questions
  getQuestionsByRole(role: string): Promise<Question[]>;
  initializeQuestions(): Promise<void>;

  // Responses
  createResponse(response: InsertResponse): Promise<Response>;
  getResponsesByUser(userId: string): Promise<Response[]>;
  getLatestResponsesBySchool(schoolId: string): Promise<Response[]>;

  // Micro Rituals
  getMicroRituals(): Promise<MicroRitual[]>;
  getMicroRitualsByCategory(category: string): Promise<MicroRitual[]>;
  getMicroRitualsByRole(role: string): Promise<MicroRitual[]>;
  initializeMicroRituals(): Promise<void>;

  // Micro Ritual Completions
  createMicroRitualCompletion(completion: InsertMicroRitualCompletion): Promise<MicroRitualCompletion>;
  getMicroRitualCompletionsByUser(userId: string): Promise<MicroRitualCompletion[]>;

  // Micro Ritual Attempts
  createMicroRitualAttempt(attempt: InsertMicroRitualAttempt): Promise<MicroRitualAttempt>;
  getMicroRitualAttemptsByUser(userId: string): Promise<MicroRitualAttempt[]>;

  // School Scores
  calculateAndStoreSchoolScore(schoolId: string): Promise<SchoolScore>;
  getLatestSchoolScore(schoolId: string): Promise<SchoolScore | undefined>;
  getSchoolScoreHistory(schoolId: string): Promise<SchoolScore[]>;
  getAssessmentCountInCurrentPeriod(schoolId: string): Promise<number>;
}

export class MemStorage implements IStorage {
  private schools: Map<string, School> = new Map();
  private users: Map<string, User> = new Map();
  private questions: Map<string, Question> = new Map();
  private responses: Map<string, Response> = new Map();
  private microRituals: Map<string, MicroRitual> = new Map();
  private microRitualCompletions: Map<string, MicroRitualCompletion> = new Map();
  private microRitualAttempts: Map<string, MicroRitualAttempt> = new Map();
  private schoolScores: Map<string, SchoolScore> = new Map();

  constructor() {
    this.initializeQuestions();
    this.initializeMicroRituals();
  }

  // Schools
  async createSchool(insertSchool: InsertSchool): Promise<School> {
    const id = randomUUID();
    const school: School = {
      ...insertSchool,
      id,
      createdAt: new Date(),
    };
    this.schools.set(id, school);
    return school;
  }

  async getSchoolByName(name: string): Promise<School | undefined> {
    return Array.from(this.schools.values()).find(
      (school) => school.name.toLowerCase() === name.toLowerCase()
    );
  }

  async searchSchools(query: string): Promise<School[]> {
    const searchTerm = query.toLowerCase();
    return Array.from(this.schools.values()).filter(
      (school) => 
        school.name.toLowerCase().includes(searchTerm) ||
        school.district.toLowerCase().includes(searchTerm) ||
        school.city.toLowerCase().includes(searchTerm) ||
        school.state.toLowerCase().includes(searchTerm)
    );
  }

  async getAllSchools(): Promise<School[]> {
    return Array.from(this.schools.values());
  }

  async updateSchool(id: string, schoolData: Partial<InsertSchool>): Promise<School> {
    const existingSchool = this.schools.get(id);
    if (!existingSchool) {
      throw new Error("School not found");
    }
    
    const updatedSchool = { ...existingSchool, ...schoolData };
    this.schools.set(id, updatedSchool);
    return updatedSchool;
  }

  async deleteSchool(id: string): Promise<void> {
    if (!this.schools.has(id)) {
      throw new Error("School not found");
    }
    this.schools.delete(id);
  }

  async getSchool(id: string): Promise<School | undefined> {
    return this.schools.get(id);
  }

  // Users
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const accessCode = insertUser.accessCode || await this.generateUniqueAccessCode();
    const user: User = {
      ...insertUser,
      id,
      accessCode,
      lastAssessmentDate: null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUsersBySchool(schoolId: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.schoolId === schoolId
    );
  }

  async updateUserLastAssessment(userId: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      const updatedUser = { ...user, lastAssessmentDate: new Date() };
      this.users.set(userId, updatedUser);
    }
  }

  async canUserTakeAssessment(userId: string): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user || !user.lastAssessmentDate) return true;
    
    const daysSinceLastAssessment = (Date.now() - user.lastAssessmentDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceLastAssessment >= 7;
  }

  async getUserByAccessCode(accessCode: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.accessCode === accessCode
    );
  }

  async generateUniqueAccessCode(): Promise<string> {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code: string;
    let attempts = 0;
    
    do {
      code = '';
      for (let i = 0; i < 4; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      attempts++;
    } while (await this.getUserByAccessCode(code) && attempts < 100);
    
    if (attempts >= 100) {
      throw new Error('Unable to generate unique access code');
    }
    
    return code;
  }

  // Questions
  async getQuestionsByRole(role: string): Promise<Question[]> {
    return Array.from(this.questions.values())
      .filter((q) => q.role === role)
      .sort((a, b) => a.order - b.order);
  }

  async initializeQuestions(): Promise<void> {
    const questionData = [
      // Student Questions
      {
        role: "student",
        category: "Student-Student Relationships",
        text: "How often do you feel genuinely supported by your classmates during difficult times?",
        options: [
          { value: "always", label: "Always", description: "My classmates consistently provide support" },
          { value: "usually", label: "Usually", description: "Most of the time I feel supported" },
          { value: "sometimes", label: "Sometimes", description: "Support varies depending on the situation" },
          { value: "rarely", label: "Rarely", description: "I rarely feel supported by peers" },
          { value: "never", label: "Never", description: "I don't feel supported by classmates" }
        ],
        order: 1
      },
      {
        role: "student",
        category: "Student-Student Relationships",
        text: "How comfortable are you working in groups with different classmates?",
        options: [
          { value: "very-comfortable", label: "Very comfortable", description: "I enjoy working with anyone" },
          { value: "somewhat-comfortable", label: "Somewhat comfortable", description: "I'm okay with most people" },
          { value: "neutral", label: "Neutral", description: "It depends on the people" },
          { value: "somewhat-uncomfortable", label: "Somewhat uncomfortable", description: "I prefer working with friends" },
          { value: "very-uncomfortable", label: "Very uncomfortable", description: "I avoid group work when possible" }
        ],
        order: 2
      },
      {
        role: "student",
        category: "Student-Staff Relationships",
        text: "How comfortable do you feel approaching a teacher or staff member when you need help or support?",
        options: [
          { value: "very-comfortable", label: "Very comfortable", description: "I feel completely at ease reaching out for help" },
          { value: "somewhat-comfortable", label: "Somewhat comfortable", description: "I feel okay about it, but sometimes hesitate" },
          { value: "neutral", label: "Neutral", description: "It depends on the situation and the person" },
          { value: "somewhat-uncomfortable", label: "Somewhat uncomfortable", description: "I prefer to handle things on my own when possible" },
          { value: "very-uncomfortable", label: "Very uncomfortable", description: "I avoid reaching out unless absolutely necessary" }
        ],
        order: 3
      },
      {
        role: "student",
        category: "Student-Staff Relationships",
        text: "How well do you feel teachers understand your perspective and experiences?",
        options: [
          { value: "very-well", label: "Very well", description: "Teachers really get where I'm coming from" },
          { value: "somewhat-well", label: "Somewhat well", description: "Some teachers understand me better than others" },
          { value: "neutral", label: "Neutral", description: "It's a mixed experience" },
          { value: "not-very-well", label: "Not very well", description: "Most teachers don't really understand me" },
          { value: "not-at-all", label: "Not at all", description: "I feel misunderstood by most staff" }
        ],
        order: 4
      },
      {
        role: "student",
        category: "School Community",
        text: "How much do you feel like you belong and are valued at this school?",
        options: [
          { value: "completely", label: "Completely", description: "This school feels like my second home" },
          { value: "mostly", label: "Mostly", description: "I feel like I belong most of the time" },
          { value: "somewhat", label: "Somewhat", description: "I feel like I belong in some areas but not others" },
          { value: "a-little", label: "A little", description: "I sometimes feel like I belong" },
          { value: "not-at-all", label: "Not at all", description: "I often feel like an outsider" }
        ],
        order: 5
      },

      // Staff Questions
      {
        role: "staff",
        category: "Staff-Staff Relationships",
        text: "How supported do you feel by your colleagues when facing challenges in your work?",
        options: [
          { value: "very-supported", label: "Very supported", description: "My colleagues are always there to help" },
          { value: "somewhat-supported", label: "Somewhat supported", description: "I feel supported most of the time" },
          { value: "neutral", label: "Neutral", description: "Support varies depending on the situation" },
          { value: "somewhat-unsupported", label: "Somewhat unsupported", description: "I often feel like I'm on my own" },
          { value: "very-unsupported", label: "Very unsupported", description: "I rarely feel supported by colleagues" }
        ],
        order: 1
      },
      {
        role: "staff",
        category: "Staff-Staff Relationships",
        text: "How often do you collaborate with colleagues from different departments?",
        options: [
          { value: "regularly", label: "Regularly", description: "I work with other departments frequently" },
          { value: "sometimes", label: "Sometimes", description: "I collaborate across departments occasionally" },
          { value: "rarely", label: "Rarely", description: "Cross-department collaboration is uncommon" },
          { value: "never", label: "Never", description: "I work only within my department" },
          { value: "not-applicable", label: "Not applicable", description: "My role doesn't require cross-department work" }
        ],
        order: 2
      },
      {
        role: "staff",
        category: "Staff-Student Relationships",
        text: "How comfortable do students seem when approaching you for help or guidance?",
        options: [
          { value: "very-comfortable", label: "Very comfortable", description: "Students approach me easily and often" },
          { value: "somewhat-comfortable", label: "Somewhat comfortable", description: "Most students seem at ease with me" },
          { value: "neutral", label: "Neutral", description: "It varies by student" },
          { value: "somewhat-uncomfortable", label: "Somewhat uncomfortable", description: "Students seem hesitant to approach me" },
          { value: "very-uncomfortable", label: "Very uncomfortable", description: "Students rarely approach me for help" }
        ],
        order: 3
      },
      {
        role: "staff",
        category: "Staff-Administration Relationships",
        text: "How well do you feel administration understands the day-to-day challenges you face?",
        options: [
          { value: "very-well", label: "Very well", description: "Administration is very aware of my challenges" },
          { value: "somewhat-well", label: "Somewhat well", description: "They understand most of my challenges" },
          { value: "neutral", label: "Neutral", description: "Understanding varies by administrator" },
          { value: "not-very-well", label: "Not very well", description: "They don't fully grasp my daily challenges" },
          { value: "not-at-all", label: "Not at all", description: "There's a significant disconnect" }
        ],
        order: 4
      },
      {
        role: "staff",
        category: "School Community",
        text: "How much do you feel your voice and input are valued in school decisions?",
        options: [
          { value: "very-valued", label: "Very valued", description: "My input is consistently sought and considered" },
          { value: "somewhat-valued", label: "Somewhat valued", description: "My voice matters in most situations" },
          { value: "neutral", label: "Neutral", description: "It depends on the decision" },
          { value: "somewhat-undervalued", label: "Somewhat undervalued", description: "My input is rarely considered" },
          { value: "very-undervalued", label: "Very undervalued", description: "I feel my voice doesn't matter" }
        ],
        order: 5
      },

      // Administrator Questions
      {
        role: "administrator",
        category: "Administration-Staff Relationships",
        text: "How effectively do you feel you communicate with your teaching and support staff?",
        options: [
          { value: "very-effectively", label: "Very effectively", description: "Communication flows smoothly in both directions" },
          { value: "somewhat-effectively", label: "Somewhat effectively", description: "Most communication is effective" },
          { value: "neutral", label: "Neutral", description: "Communication effectiveness varies" },
          { value: "somewhat-ineffectively", label: "Somewhat ineffectively", description: "Communication often breaks down" },
          { value: "very-ineffectively", label: "Very ineffectively", description: "Communication is a significant challenge" }
        ],
        order: 1
      },
      {
        role: "administrator",
        category: "Administration-Student Relationships",
        text: "How approachable do you feel you are to students in your school?",
        options: [
          { value: "very-approachable", label: "Very approachable", description: "Students regularly come to me with concerns" },
          { value: "somewhat-approachable", label: "Somewhat approachable", description: "Some students feel comfortable approaching me" },
          { value: "neutral", label: "Neutral", description: "It depends on the student and situation" },
          { value: "somewhat-unapproachable", label: "Somewhat unapproachable", description: "Students rarely approach me directly" },
          { value: "very-unapproachable", label: "Very unapproachable", description: "Students seem intimidated by my position" }
        ],
        order: 2
      },
      {
        role: "administrator",
        category: "Administration-Community Relationships",
        text: "How well do you feel connected to the day-to-day experiences of your school community?",
        options: [
          { value: "very-connected", label: "Very connected", description: "I'm actively involved in daily school life" },
          { value: "somewhat-connected", label: "Somewhat connected", description: "I stay informed about most happenings" },
          { value: "neutral", label: "Neutral", description: "My connection varies by area" },
          { value: "somewhat-disconnected", label: "Somewhat disconnected", description: "I'm often removed from daily activities" },
          { value: "very-disconnected", label: "Very disconnected", description: "I feel isolated from the school community" }
        ],
        order: 3
      },
      {
        role: "administrator",
        category: "Leadership and Decision Making",
        text: "How well do you feel school decisions reflect the input of all community members?",
        options: [
          { value: "very-well", label: "Very well", description: "All voices are heard and considered" },
          { value: "somewhat-well", label: "Somewhat well", description: "Most perspectives are included" },
          { value: "neutral", label: "Neutral", description: "Input varies by decision type" },
          { value: "not-very-well", label: "Not very well", description: "Some voices are often overlooked" },
          { value: "not-at-all", label: "Not at all", description: "Decisions are made without broad input" }
        ],
        order: 4
      },
      {
        role: "administrator",
        category: "School Culture",
        text: "How successful do you feel in creating an inclusive and welcoming school environment?",
        options: [
          { value: "very-successful", label: "Very successful", description: "Our school is truly inclusive for all" },
          { value: "somewhat-successful", label: "Somewhat successful", description: "We're making good progress on inclusion" },
          { value: "neutral", label: "Neutral", description: "Inclusion efforts are mixed" },
          { value: "somewhat-unsuccessful", label: "Somewhat unsuccessful", description: "We have significant inclusion challenges" },
          { value: "very-unsuccessful", label: "Very unsuccessful", description: "Inclusion is a major concern" }
        ],
        order: 5
      },

      // Counselor Questions
      {
        role: "counselor",
        category: "Counselor-Student Relationships",
        text: "How comfortable do students seem when seeking support from you?",
        options: [
          { value: "very-comfortable", label: "Very comfortable", description: "Students regularly and openly seek my help" },
          { value: "somewhat-comfortable", label: "Somewhat comfortable", description: "Most students seem at ease with me" },
          { value: "neutral", label: "Neutral", description: "Comfort levels vary significantly by student" },
          { value: "somewhat-uncomfortable", label: "Somewhat uncomfortable", description: "Many students seem hesitant" },
          { value: "very-uncomfortable", label: "Very uncomfortable", description: "Students rarely seek my support" }
        ],
        order: 1
      },
      {
        role: "counselor",
        category: "Counselor-Staff Relationships",
        text: "How well do you feel teaching staff utilize your expertise and resources?",
        options: [
          { value: "very-well", label: "Very well", description: "Staff regularly collaborate with me" },
          { value: "somewhat-well", label: "Somewhat well", description: "Most staff work well with me" },
          { value: "neutral", label: "Neutral", description: "Collaboration varies by teacher" },
          { value: "not-very-well", label: "Not very well", description: "Staff rarely engage with my services" },
          { value: "not-at-all", label: "Not at all", description: "There's little collaboration with staff" }
        ],
        order: 2
      },
      {
        role: "counselor",
        category: "Mental Health and Wellbeing",
        text: "How effectively can you address the mental health and emotional needs in your school?",
        options: [
          { value: "very-effectively", label: "Very effectively", description: "I can meet most needs with available resources" },
          { value: "somewhat-effectively", label: "Somewhat effectively", description: "I address many needs but face some limitations" },
          { value: "neutral", label: "Neutral", description: "Effectiveness varies by situation" },
          { value: "somewhat-ineffectively", label: "Somewhat ineffectively", description: "Resource constraints limit my effectiveness" },
          { value: "very-ineffectively", label: "Very ineffectively", description: "I cannot adequately address community needs" }
        ],
        order: 3
      },
      {
        role: "counselor",
        category: "Crisis Prevention and Response",
        text: "How well does your school community work together in identifying and supporting students in crisis?",
        options: [
          { value: "very-well", label: "Very well", description: "Strong collaboration in crisis identification and response" },
          { value: "somewhat-well", label: "Somewhat well", description: "Good collaboration with room for improvement" },
          { value: "neutral", label: "Neutral", description: "Collaboration is inconsistent" },
          { value: "not-very-well", label: "Not very well", description: "Limited collaboration in crisis situations" },
          { value: "not-at-all", label: "Not at all", description: "Poor communication and collaboration" }
        ],
        order: 4
      },
      {
        role: "counselor",
        category: "Preventive Programming",
        text: "How supported do you feel in implementing preventive mental health and relationship-building programs?",
        options: [
          { value: "very-supported", label: "Very supported", description: "Strong administrative and community support" },
          { value: "somewhat-supported", label: "Somewhat supported", description: "Good support with some barriers" },
          { value: "neutral", label: "Neutral", description: "Support varies by program type" },
          { value: "somewhat-unsupported", label: "Somewhat unsupported", description: "Limited support for preventive programs" },
          { value: "very-unsupported", label: "Very unsupported", description: "Little to no support for prevention efforts" }
        ],
        order: 5
      }
    ];

    questionData.forEach((q, index) => {
      const id = randomUUID();
      const question: Question = {
        id,
        role: q.role,
        category: q.category,
        text: q.text,
        options: q.options,
        order: q.order,
      };
      this.questions.set(id, question);
    });
  }

  // Responses
  async createResponse(insertResponse: InsertResponse): Promise<Response> {
    const id = randomUUID();
    const response: Response = {
      ...insertResponse,
      id,
      submittedAt: new Date(),
    };
    this.responses.set(id, response);
    return response;
  }

  async getResponsesByUser(userId: string): Promise<Response[]> {
    return Array.from(this.responses.values()).filter(
      (response) => response.userId === userId
    );
  }

  async getLatestResponsesBySchool(schoolId: string): Promise<Response[]> {
    const schoolUsers = await this.getUsersBySchool(schoolId);
    const userIds = schoolUsers.map(user => user.id);
    
    // Only include responses from the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return Array.from(this.responses.values()).filter(
      (response) => userIds.includes(response.userId) && 
                   response.submittedAt >= sevenDaysAgo
    );
  }

  async getAssessmentCountInCurrentPeriod(schoolId: string): Promise<number> {
    const schoolUsers = await this.getUsersBySchool(schoolId);
    const userIds = schoolUsers.map(user => user.id);
    
    // Count unique users who have taken assessments in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentResponses = Array.from(this.responses.values()).filter(
      (response) => userIds.includes(response.userId) && 
                   response.submittedAt >= sevenDaysAgo
    );
    
    // Count unique users who have responses in this period
    const uniqueUsers = new Set(recentResponses.map(response => response.userId));
    return uniqueUsers.size;
  }

  // Micro Rituals
  async getMicroRituals(): Promise<MicroRitual[]> {
    return Array.from(this.microRituals.values());
  }

  async getMicroRitualsByCategory(category: string): Promise<MicroRitual[]> {
    return Array.from(this.microRituals.values()).filter(
      (ritual) => ritual.category === category
    );
  }

  async getMicroRitualsByRole(role: string): Promise<MicroRitual[]> {
    return Array.from(this.microRituals.values()).filter(
      (ritual) => (ritual.applicableRoles as string[]).includes(role)
    );
  }

  async initializeMicroRituals(): Promise<void> {
    const ritualData = [
      // Group Activities
      {
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
        applicableRoles: ["student", "staff"]
      },
      {
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
        applicableRoles: ["student"]
      },
      {
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
        applicableRoles: ["staff"]
      },
      {
        title: "Administrative Coffee Connections",
        description: "Administrators hold informal coffee meetings with small groups of staff and students",
        category: "Administration-Community",
        targetRelationship: "Administrator-Staff/Student",
        timeRequired: "20-30 minutes",
        participantCount: "4-8 people",
        difficulty: "Medium",
        steps: [
          "Schedule weekly informal coffee sessions",
          "Invite mixed groups of staff and students",
          "Create comfortable, non-evaluative atmosphere",
          "Share updates and listen to concerns",
          "Follow up on actionable items discussed"
        ],
        expectedOutcome: "Increases administrator visibility and builds trust with school community",
        applicableRoles: ["administrator"]
      },
      {
        title: "Gratitude Wall Collaboration",
        description: "Create a shared space where community members can express appreciation for each other",
        category: "School-Wide Connection",
        targetRelationship: "All Community",
        timeRequired: "Ongoing",
        participantCount: "Individual or group",
        difficulty: "Easy",
        steps: [
          "Designate a visible wall or bulletin board space",
          "Provide colorful sticky notes and markers",
          "Encourage specific, genuine appreciation notes",
          "Rotate content weekly to keep it fresh",
          "Celebrate particularly meaningful contributions"
        ],
        expectedOutcome: "Creates visible culture of appreciation and positive recognition",
        applicableRoles: ["student", "staff", "administrator", "counselor"]
      },
      {
        title: "Counselor Check-in Circles",
        description: "Small group check-ins led by counselors to strengthen support networks",
        category: "Mental Health Support",
        targetRelationship: "Counselor-Student",
        timeRequired: "25-30 minutes",
        participantCount: "6-10 students",
        difficulty: "Medium",
        steps: [
          "Form small, consistent groups that meet weekly",
          "Begin with a brief mindfulness or grounding exercise",
          "Use talking circles where each person shares briefly",
          "Focus on building listening skills and empathy",
          "End with a group affirmation or positive intention"
        ],
        expectedOutcome: "Strengthens peer support networks and emotional intelligence",
        applicableRoles: ["counselor"]
      },

      // Individual Activities
      {
        title: "Personal Connection Journal",
        description: "Keep a daily journal reflecting on positive interactions and relationships at school",
        category: "Self-Reflection",
        targetRelationship: "Self-Awareness",
        timeRequired: "5-10 minutes daily",
        participantCount: "Individual",
        difficulty: "Easy",
        steps: [
          "Set aside 5-10 minutes each day for reflection",
          "Write about one positive interaction you had that day",
          "Note what made the interaction meaningful",
          "Identify one person you'd like to connect with better",
          "Plan a simple way to reach out to that person tomorrow"
        ],
        expectedOutcome: "Increases awareness of relationships and intentional connection-building",
        applicableRoles: ["student", "staff", "administrator", "counselor"]
      },
      {
        title: "Secret Acts of Kindness",
        description: "Perform small, anonymous acts of kindness to build positive school culture",
        category: "Individual Kindness",
        targetRelationship: "Community Building",
        timeRequired: "5-15 minutes",
        participantCount: "Individual",
        difficulty: "Easy",
        steps: [
          "Choose one small act of kindness to do anonymously each day",
          "Examples: leave encouraging notes, help clean up, bring supplies",
          "Focus on actions that help others feel seen and valued",
          "Keep acts simple and genuine",
          "Reflect on how these actions affect the school atmosphere"
        ],
        expectedOutcome: "Creates ripple effects of positivity and models caring behavior",
        applicableRoles: ["student", "staff", "administrator", "counselor"]
      },
      {
        title: "Daily Hello Challenge",
        description: "Make a point to greet three new people each day with genuine warmth",
        category: "Individual Outreach",
        targetRelationship: "Community Connection",
        timeRequired: "Throughout the day",
        participantCount: "Individual",
        difficulty: "Medium",
        steps: [
          "Set a goal to greet three people you don't usually talk to each day",
          "Use their name if you know it, or introduce yourself if you don't",
          "Make eye contact and offer a genuine smile",
          "Ask a simple question like 'How's your day going?'",
          "Listen actively to their response"
        ],
        expectedOutcome: "Breaks down social barriers and creates new connections across the school",
        applicableRoles: ["student", "staff", "administrator", "counselor"]
      },
      {
        title: "Mindful Presence Practice",
        description: "Practice being fully present during interactions to deepen connections",
        category: "Mindfulness",
        targetRelationship: "Quality Connections",
        timeRequired: "Throughout the day",
        participantCount: "Individual",
        difficulty: "Medium",
        steps: [
          "Choose three conversations each day to practice full presence",
          "Put away devices and eliminate distractions",
          "Make eye contact and listen without planning your response",
          "Notice body language and emotional cues",
          "Respond with empathy and genuine interest"
        ],
        expectedOutcome: "Improves quality of relationships through deeper, more meaningful interactions",
        applicableRoles: ["student", "staff", "administrator", "counselor"]
      },
      {
        title: "Strengths Spotter",
        description: "Actively notice and acknowledge others' strengths and positive qualities",
        category: "Recognition",
        targetRelationship: "Appreciation",
        timeRequired: "Throughout the day",
        participantCount: "Individual",
        difficulty: "Easy",
        steps: [
          "Set an intention to notice one strength in three different people each day",
          "Look for qualities like kindness, effort, creativity, or helpfulness",
          "Find appropriate moments to acknowledge what you noticed",
          "Be specific in your recognition ('I noticed how patient you were with...')",
          "Keep a mental note of the positive impact of your recognition"
        ],
        expectedOutcome: "Builds others' confidence while strengthening your appreciation skills",
        applicableRoles: ["student", "staff", "administrator", "counselor"]
      },
      {
        title: "Lunch Buddy Invitation",
        description: "Proactively invite someone to join you for lunch who might be sitting alone",
        category: "Inclusion",
        targetRelationship: "Peer Support",
        timeRequired: "Lunch period",
        participantCount: "Individual initiative",
        difficulty: "Medium",
        steps: [
          "Scan the lunch area for someone eating alone",
          "Approach with a friendly smile and introduce yourself if needed",
          "Ask if they'd like to join you or if you can join them",
          "Start with simple conversation starters about shared experiences",
          "Make it a regular practice to include others"
        ],
        expectedOutcome: "Reduces isolation and creates opportunities for new friendships",
        applicableRoles: ["student", "staff"]
      }
    ];

    ritualData.forEach((r) => {
      const id = randomUUID();
      const ritual: MicroRitual = {
        id,
        title: r.title,
        description: r.description,
        category: r.category,
        targetRelationship: r.targetRelationship,
        timeRequired: r.timeRequired,
        participantCount: r.participantCount,
        difficulty: r.difficulty,
        steps: r.steps,
        expectedOutcome: r.expectedOutcome,
        applicableRoles: r.applicableRoles,
      };
      this.microRituals.set(id, ritual);
    });
  }

  // Micro Ritual Completions
  async createMicroRitualCompletion(insertCompletion: InsertMicroRitualCompletion): Promise<MicroRitualCompletion> {
    const id = randomUUID();
    const completion: MicroRitualCompletion = {
      ...insertCompletion,
      id,
      completedAt: new Date(),
    };
    this.microRitualCompletions.set(id, completion);
    return completion;
  }

  async getMicroRitualCompletionsByUser(userId: string): Promise<MicroRitualCompletion[]> {
    return Array.from(this.microRitualCompletions.values()).filter(
      (completion) => completion.userId === userId
    );
  }

  // Micro Ritual Attempts
  async createMicroRitualAttempt(insertAttempt: InsertMicroRitualAttempt): Promise<MicroRitualAttempt> {
    const id = randomUUID();
    const attempt: MicroRitualAttempt = {
      ...insertAttempt,
      id,
      attemptedAt: new Date(),
    };
    this.microRitualAttempts.set(id, attempt);
    return attempt;
  }

  async getMicroRitualAttemptsByUser(userId: string): Promise<MicroRitualAttempt[]> {
    return Array.from(this.microRitualAttempts.values()).filter(
      (attempt) => attempt.userId === userId
    );
  }

  // School Scores
  async calculateAndStoreSchoolScore(schoolId: string): Promise<SchoolScore> {
    const responses = await this.getLatestResponsesBySchool(schoolId);
    const users = await this.getUsersBySchool(schoolId);
    
    if (responses.length === 0) {
      // Default score for schools with no responses
      const score: SchoolScore = {
        id: randomUUID(),
        schoolId,
        overallScore: 50,
        categoryScores: {},
        calculatedAt: new Date(),
      };
      this.schoolScores.set(score.id, score);
      return score;
    }

    // Calculate scores by category
    const categoryScores: Record<string, number> = {};
    const questions = Array.from(this.questions.values());
    
    // Group responses by category
    const responsesByCategory: Record<string, any[]> = {};
    for (const response of responses) {
      const question = questions.find(q => q.id === response.questionId);
      if (question) {
        if (!responsesByCategory[question.category]) {
          responsesByCategory[question.category] = [];
        }
        responsesByCategory[question.category].push(response);
      }
    }

    // Calculate average score for each category (convert text responses to numeric values)
    for (const [category, categoryResponses] of Object.entries(responsesByCategory)) {
      const numericScores = categoryResponses.map(response => this.convertResponseToScore(response.answer));
      const averageScore = numericScores.reduce((sum, score) => sum + score, 0) / numericScores.length;
      categoryScores[category] = Math.round(averageScore);
    }

    // Calculate overall score
    const overallScore = Math.round(
      Object.values(categoryScores).reduce((sum, score) => sum + score, 0) / Object.keys(categoryScores).length
    );

    const score: SchoolScore = {
      id: randomUUID(),
      schoolId,
      overallScore,
      categoryScores,
      calculatedAt: new Date(),
    };

    this.schoolScores.set(score.id, score);
    return score;
  }

  async getLatestSchoolScore(schoolId: string): Promise<SchoolScore | undefined> {
    const schoolScores = Array.from(this.schoolScores.values())
      .filter(score => score.schoolId === schoolId)
      .sort((a, b) => b.calculatedAt.getTime() - a.calculatedAt.getTime());
    
    return schoolScores[0];
  }

  async getSchoolScoreHistory(schoolId: string): Promise<SchoolScore[]> {
    return Array.from(this.schoolScores.values())
      .filter(score => score.schoolId === schoolId)
      .sort((a, b) => b.calculatedAt.getTime() - a.calculatedAt.getTime());
  }

  private convertResponseToScore(answer: string): number {
    // Convert text responses to numeric scores (1-100 scale)
    const scoreMap: Record<string, number> = {
      'always': 100, 'very-comfortable': 100, 'very-well': 100, 'completely': 100, 'very-supported': 100, 'very-effectively': 100, 'very-approachable': 100, 'very-connected': 100, 'very-successful': 100,
      'usually': 80, 'somewhat-comfortable': 80, 'somewhat-well': 80, 'mostly': 80, 'somewhat-supported': 80, 'somewhat-effectively': 80, 'somewhat-approachable': 80, 'somewhat-connected': 80, 'somewhat-successful': 80,
      'sometimes': 60, 'neutral': 60, 'somewhat': 60, 'regularly': 80,
      'rarely': 40, 'somewhat-uncomfortable': 40, 'not-very-well': 40, 'a-little': 40, 'somewhat-unsupported': 40, 'somewhat-ineffectively': 40, 'somewhat-unapproachable': 40, 'somewhat-disconnected': 40, 'somewhat-unsuccessful': 40,
      'never': 20, 'very-uncomfortable': 20, 'not-at-all': 20, 'very-unsupported': 20, 'very-ineffectively': 20, 'very-unapproachable': 20, 'very-disconnected': 20, 'very-unsuccessful': 20,
      'not-applicable': 60 // Neutral score for non-applicable questions
    };

    return scoreMap[answer] || 50; // Default to 50 if answer not found
  }
}

export const storage = new MemStorage();
