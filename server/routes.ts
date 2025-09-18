import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertSchoolSchema, 
  insertUserSchema, 
  insertResponseSchema, 
  insertMicroRitualCompletionSchema,
  insertMicroRitualAttemptSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Schools
  app.post("/api/schools", async (req, res) => {
    try {
      const validatedData = insertSchoolSchema.parse(req.body);
      
      // Check if school already exists
      const existingSchool = await storage.getSchoolByName(validatedData.name);
      if (existingSchool) {
        return res.json({ school: existingSchool, isNew: false });
      }

      const school = await storage.createSchool(validatedData);
      res.json({ school, isNew: true });
    } catch (error) {
      res.status(400).json({ error: "Invalid school data" });
    }
  });

  // School search for autocomplete (must come before /:id route)
  app.get("/api/schools/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.json([]);
      }
      const schools = await storage.searchSchools(q);
      res.json(schools);
    } catch (error) {
      res.status(500).json({ error: "Failed to search schools" });
    }
  });

  app.get("/api/schools/:id", async (req, res) => {
    try {
      const school = await storage.getSchool(req.params.id);
      if (!school) {
        return res.status(404).json({ error: "School not found" });
      }
      res.json(school);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch school" });
    }
  });

  // Users
  app.post("/api/users", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      // Generate unique access code if not provided
      if (!validatedData.accessCode) {
        validatedData.accessCode = await storage.generateUniqueAccessCode();
      }
      const user = await storage.createUser(validatedData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.get("/api/users/:id/can-take-assessment", async (req, res) => {
    try {
      const canTake = await storage.canUserTakeAssessment(req.params.id);
      res.json({ canTakeAssessment: canTake });
    } catch (error) {
      res.status(500).json({ error: "Failed to check assessment eligibility" });
    }
  });

  app.get("/api/users/access-code/:accessCode", async (req, res) => {
    try {
      const user = await storage.getUserByAccessCode(req.params.accessCode);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user by access code" });
    }
  });

  // Questions
  app.get("/api/questions/:role", async (req, res) => {
    try {
      const questions = await storage.getQuestionsByRole(req.params.role);
      res.json(questions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch questions" });
    }
  });

  // Assessment submission
  app.post("/api/assessments", async (req, res) => {
    try {
      const { userId, responses } = req.body;
      
      // Validate user exists and can take assessment
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const canTake = await storage.canUserTakeAssessment(userId);
      if (!canTake) {
        return res.status(403).json({ error: "Must wait 7 days between assessments" });
      }

      // Validate and store responses
      const responsePromises = responses.map((responseData: any) => {
        const validatedResponse = insertResponseSchema.parse({
          userId,
          questionId: responseData.questionId,
          answer: responseData.answer
        });
        return storage.createResponse(validatedResponse);
      });

      await Promise.all(responsePromises);

      // Update user's last assessment date
      await storage.updateUserLastAssessment(userId);

      // Recalculate school score
      const schoolScore = await storage.calculateAndStoreSchoolScore(user.schoolId);

      res.json({ 
        message: "Assessment submitted successfully", 
        schoolScore,
        accessCode: user.accessCode
      });
    } catch (error) {
      console.error("Assessment submission error:", error);
      res.status(400).json({ error: "Failed to submit assessment" });
    }
  });

  // Micro rituals
  app.get("/api/micro-rituals", async (req, res) => {
    try {
      const rituals = await storage.getMicroRituals();
      res.json(rituals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch micro rituals" });
    }
  });

  app.get("/api/micro-rituals/category/:category", async (req, res) => {
    try {
      const rituals = await storage.getMicroRitualsByCategory(req.params.category);
      res.json(rituals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch micro rituals" });
    }
  });

  app.get("/api/micro-rituals/role/:role", async (req, res) => {
    try {
      const rituals = await storage.getMicroRitualsByRole(req.params.role);
      res.json(rituals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch role-specific micro rituals" });
    }
  });

  // Micro ritual completions
  app.post("/api/micro-ritual-completions", async (req, res) => {
    try {
      const validatedData = insertMicroRitualCompletionSchema.parse(req.body);
      const completion = await storage.createMicroRitualCompletion(validatedData);
      
      // Get user to recalculate school score
      const user = await storage.getUser(validatedData.userId);
      if (user) {
        await storage.calculateAndStoreSchoolScore(user.schoolId);
      }

      res.json(completion);
    } catch (error) {
      res.status(400).json({ error: "Invalid completion data" });
    }
  });

  app.get("/api/users/:userId/micro-ritual-completions", async (req, res) => {
    try {
      const completions = await storage.getMicroRitualCompletionsByUser(req.params.userId);
      res.json(completions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch completions" });
    }
  });

  // Micro ritual attempts
  app.post("/api/micro-ritual-attempts", async (req, res) => {
    try {
      const validatedData = insertMicroRitualAttemptSchema.parse(req.body);
      const attempt = await storage.createMicroRitualAttempt(validatedData);
      res.json(attempt);
    } catch (error) {
      res.status(400).json({ error: "Invalid attempt data" });
    }
  });

  app.get("/api/users/:userId/micro-ritual-attempts", async (req, res) => {
    try {
      const attempts = await storage.getMicroRitualAttemptsByUser(req.params.userId);
      res.json(attempts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch attempts" });
    }
  });

  // School scores
  app.get("/api/schools/:schoolId/score", async (req, res) => {
    try {
      const score = await storage.getLatestSchoolScore(req.params.schoolId);
      if (!score) {
        // Calculate initial score if none exists
        const newScore = await storage.calculateAndStoreSchoolScore(req.params.schoolId);
        return res.json(newScore);
      }
      res.json(score);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch school score" });
    }
  });

  app.get("/api/schools/:schoolId/score-history", async (req, res) => {
    try {
      const scores = await storage.getSchoolScoreHistory(req.params.schoolId);
      res.json(scores);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch score history" });
    }
  });

  app.get("/api/schools/:schoolId/assessment-count", async (req, res) => {
    try {
      const count = await storage.getAssessmentCountInCurrentPeriod(req.params.schoolId);
      res.json({ assessmentCount: count });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch assessment count" });
    }
  });

  // User responses
  app.get("/api/users/:userId/responses", async (req, res) => {
    try {
      const responses = await storage.getResponsesByUser(req.params.userId);
      res.json(responses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user responses" });
    }
  });

  // Admin routes
  app.post("/api/admin/auth", async (req, res) => {
    try {
      const { accessCode } = req.body;
      if (accessCode === "6056") {
        res.json({ authenticated: true });
      } else {
        res.status(401).json({ error: "Invalid access code" });
      }
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  // School management routes
  app.get("/api/admin/schools", async (req, res) => {
    try {
      const schools = await storage.getAllSchools();
      res.json(schools);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch schools" });
    }
  });

  app.post("/api/admin/schools", async (req, res) => {
    try {
      const validatedData = insertSchoolSchema.parse(req.body);
      const school = await storage.createSchool(validatedData);
      res.json(school);
    } catch (error) {
      res.status(400).json({ error: "Invalid school data" });
    }
  });

  app.put("/api/admin/schools/:id", async (req, res) => {
    try {
      const validatedData = insertSchoolSchema.partial().parse(req.body);
      const school = await storage.updateSchool(req.params.id, validatedData);
      res.json(school);
    } catch (error) {
      res.status(400).json({ error: "Invalid school data" });
    }
  });

  app.delete("/api/admin/schools/:id", async (req, res) => {
    try {
      await storage.deleteSchool(req.params.id);
      res.json({ message: "School deleted successfully" });
    } catch (error) {
      res.status(404).json({ error: "School not found" });
    }
  });

  app.post("/api/admin/schools/bulk-upload", async (req, res) => {
    try {
      const { schools } = req.body;
      if (!Array.isArray(schools)) {
        return res.status(400).json({ error: "Invalid data format" });
      }

      const results = [];
      for (const schoolData of schools) {
        try {
          const validatedData = insertSchoolSchema.parse(schoolData);
          const school = await storage.createSchool(validatedData);
          results.push({ success: true, school });
        } catch (error) {
          results.push({ success: false, error: error.message, data: schoolData });
        }
      }

      res.json({ results });
    } catch (error) {
      res.status(400).json({ error: "Invalid bulk upload data" });
    }
  });


  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}
