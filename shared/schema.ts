import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Schools table
export const schools = pgTable("schools", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  district: text("district").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  schoolId: varchar("school_id").references(() => schools.id).notNull(),
  role: text("role").notNull(), // "student", "staff", "administrator", "counselor"
  accessCode: varchar("access_code", { length: 4 }).notNull().unique(),
  lastAssessmentDate: timestamp("last_assessment_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Questions table
export const questions = pgTable("questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  role: text("role").notNull(), // "student", "staff", "administrator", "counselor"
  category: text("category").notNull(),
  text: text("text").notNull(),
  options: jsonb("options").notNull(), // Array of {value, label, description}
  order: integer("order").notNull(),
});

// Responses table
export const responses = pgTable("responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  questionId: varchar("question_id").references(() => questions.id).notNull(),
  answer: text("answer").notNull(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

// Micro rituals table
export const microRituals = pgTable("micro_rituals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  targetRelationship: text("target_relationship").notNull(),
  timeRequired: text("time_required").notNull(),
  participantCount: text("participant_count").notNull(),
  difficulty: text("difficulty").notNull(),
  steps: jsonb("steps").notNull(), // Array of strings
  expectedOutcome: text("expected_outcome").notNull(),
  applicableRoles: jsonb("applicable_roles").notNull(), // Array of roles: ["student", "staff", "administrator", "counselor"]
});

// Micro ritual completions table
export const microRitualCompletions = pgTable("micro_ritual_completions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  microRitualId: varchar("micro_ritual_id").references(() => microRituals.id).notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

// Micro ritual attempts table (for tracking what users tried)
export const microRitualAttempts = pgTable("micro_ritual_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  attemptedRituals: text("attempted_rituals").notNull(), // Description of what they tried
  attemptedAt: timestamp("attempted_at").defaultNow().notNull(),
});

// School scores table
export const schoolScores = pgTable("school_scores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  schoolId: varchar("school_id").references(() => schools.id).notNull(),
  overallScore: integer("overall_score").notNull(),
  categoryScores: jsonb("category_scores").notNull(), // Object with category scores
  calculatedAt: timestamp("calculated_at").defaultNow().notNull(),
});

// Insert schemas
export const insertSchoolSchema = createInsertSchema(schools).pick({
  name: true,
  district: true,
  city: true,
  state: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  schoolId: true,
  role: true,
  accessCode: true,
}).extend({
  accessCode: z.string().length(4).optional(),
});

export const insertResponseSchema = createInsertSchema(responses).pick({
  userId: true,
  questionId: true,
  answer: true,
});

export const insertMicroRitualCompletionSchema = createInsertSchema(microRitualCompletions).pick({
  userId: true,
  microRitualId: true,
});

export const insertMicroRitualAttemptSchema = createInsertSchema(microRitualAttempts).pick({
  userId: true,
  attemptedRituals: true,
});

// Types
export type School = typeof schools.$inferSelect;
export type InsertSchool = z.infer<typeof insertSchoolSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Question = typeof questions.$inferSelect;
export type Response = typeof responses.$inferSelect;
export type InsertResponse = z.infer<typeof insertResponseSchema>;

export type MicroRitual = typeof microRituals.$inferSelect;
export type MicroRitualCompletion = typeof microRitualCompletions.$inferSelect;
export type InsertMicroRitualCompletion = z.infer<typeof insertMicroRitualCompletionSchema>;

export type MicroRitualAttempt = typeof microRitualAttempts.$inferSelect;
export type InsertMicroRitualAttempt = z.infer<typeof insertMicroRitualAttemptSchema>;

export type SchoolScore = typeof schoolScores.$inferSelect;
