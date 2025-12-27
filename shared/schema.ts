import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, date, boolean, real, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Re-export auth models
export * from "./models/auth";

// Recruitment Request
export const recruitmentRequests = pgTable("recruitment_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  department: varchar("department").notNull(),
  location: varchar("location"),
  level: varchar("level"),
  salaryRange: varchar("salary_range"),
  jdUrl: varchar("jd_url"),
  status: varchar("status").default("open").notNull(),
  hiringManagerId: varchar("hiring_manager_id"),
  agencyIds: jsonb("agency_ids").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRecruitmentRequestSchema = createInsertSchema(recruitmentRequests).omit({
  id: true,
  createdAt: true,
});

export type InsertRecruitmentRequest = z.infer<typeof insertRecruitmentRequestSchema>;
export type RecruitmentRequest = typeof recruitmentRequests.$inferSelect;

// Candidate
export const candidates = pgTable("candidates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  rrId: varchar("rr_id").references(() => recruitmentRequests.id),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
  resumeUrl: varchar("resume_url"),
  source: varchar("source"),
  currentStage: varchar("current_stage").default("applied").notNull(),
  notes: jsonb("notes").$type<{ text: string; date: string; author: string }[]>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const candidatesRelations = relations(candidates, ({ one }) => ({
  recruitmentRequest: one(recruitmentRequests, {
    fields: [candidates.rrId],
    references: [recruitmentRequests.id],
  }),
}));

export const insertCandidateSchema = createInsertSchema(candidates).omit({
  id: true,
  createdAt: true,
});

export type InsertCandidate = z.infer<typeof insertCandidateSchema>;
export type Candidate = typeof candidates.$inferSelect;

// Availability Slot
export const availabilitySlots = pgTable("availability_slots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  rrId: varchar("rr_id").references(() => recruitmentRequests.id),
  interviewerId: varchar("interviewer_id"),
  startTime: timestamp("start_time").notNull(),
  durationMinutes: integer("duration_minutes").default(30),
  mode: varchar("mode"),
  location: varchar("location"),
  status: varchar("status").default("open").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAvailabilitySlotSchema = createInsertSchema(availabilitySlots).omit({
  id: true,
  createdAt: true,
});

export type InsertAvailabilitySlot = z.infer<typeof insertAvailabilitySlotSchema>;
export type AvailabilitySlot = typeof availabilitySlots.$inferSelect;

// Interview
export const interviews = pgTable("interviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  candidateId: varchar("candidate_id").references(() => candidates.id),
  rrId: varchar("rr_id").references(() => recruitmentRequests.id),
  interviewerId: varchar("interviewer_id"),
  availabilitySlotId: varchar("availability_slot_id").references(() => availabilitySlots.id),
  slotTime: timestamp("slot_time"),
  durationMinutes: integer("duration_minutes").default(30),
  mode: varchar("mode"),
  status: varchar("status").default("scheduled").notNull(),
  feedback: jsonb("feedback").$type<{ rating: number; notes: string; recommendation: string }>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const interviewsRelations = relations(interviews, ({ one }) => ({
  candidate: one(candidates, {
    fields: [interviews.candidateId],
    references: [candidates.id],
  }),
  recruitmentRequest: one(recruitmentRequests, {
    fields: [interviews.rrId],
    references: [recruitmentRequests.id],
  }),
}));

export const insertInterviewSchema = createInsertSchema(interviews).omit({
  id: true,
  createdAt: true,
});

export type InsertInterview = z.infer<typeof insertInterviewSchema>;
export type Interview = typeof interviews.$inferSelect;

// Attendance Log
export const attendanceLogs = pgTable("attendance_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull(),
  date: date("date").notNull(),
  timeIn: timestamp("time_in"),
  timeOut: timestamp("time_out"),
  totalHours: real("total_hours"),
  geoIn: jsonb("geo_in").$type<{ lat: number; lng: number }>(),
  geoOut: jsonb("geo_out").$type<{ lat: number; lng: number }>(),
  isWorkingDay: boolean("is_working_day").default(true),
  workMode: varchar("work_mode").default("office"),
  wfhStatus: varchar("wfh_status").default("n/a"),
  approverId: varchar("approver_id"),
  approvalTime: timestamp("approval_time"),
  approvalNotes: varchar("approval_notes"),
  mealAllowance: integer("meal_allowance").default(0),
  extraHours: real("extra_hours").default(0),
  notes: jsonb("notes").$type<string[]>(),
  status: varchar("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_attendance_employee").on(table.employeeId),
]);

export const insertAttendanceLogSchema = createInsertSchema(attendanceLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertAttendanceLog = z.infer<typeof insertAttendanceLogSchema>;
export type AttendanceLog = typeof attendanceLogs.$inferSelect;

// ESS Request (Employee Self-Service)
export const essRequests = pgTable("ess_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull(),
  type: varchar("type").notNull(),
  status: varchar("status").default("open").notNull(),
  payload: jsonb("payload").$type<Record<string, unknown>>(),
  attachments: jsonb("attachments").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEssRequestSchema = createInsertSchema(essRequests).omit({
  id: true,
  createdAt: true,
});

export type InsertEssRequest = z.infer<typeof insertEssRequestSchema>;
export type EssRequest = typeof essRequests.$inferSelect;

// Policy
export const policies = pgTable("policies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  version: varchar("version"),
  category: varchar("category"),
  status: varchar("status").default("draft").notNull(),
  owner: varchar("owner"),
  effectiveDate: date("effective_date"),
  fileUrl: varchar("file_url"),
  summary: text("summary"),
  tags: jsonb("tags").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPolicySchema = createInsertSchema(policies).omit({
  id: true,
  createdAt: true,
});

export type InsertPolicy = z.infer<typeof insertPolicySchema>;
export type Policy = typeof policies.$inferSelect;

// Policy Acknowledgment
export const policyAcks = pgTable("policy_acks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  policyId: varchar("policy_id").references(() => policies.id),
  employeeId: varchar("employee_id").notNull(),
  version: varchar("version"),
  ackAt: timestamp("ack_at").defaultNow(),
});

export const policyAcksRelations = relations(policyAcks, ({ one }) => ({
  policy: one(policies, {
    fields: [policyAcks.policyId],
    references: [policies.id],
  }),
}));

export const insertPolicyAckSchema = createInsertSchema(policyAcks).omit({
  id: true,
  ackAt: true,
});

export type InsertPolicyAck = z.infer<typeof insertPolicyAckSchema>;
export type PolicyAck = typeof policyAcks.$inferSelect;

// Template Document
export const templates = pgTable("templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  category: varchar("category"),
  fileUrl: varchar("file_url"),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
  updatedAt: true,
});

export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type Template = typeof templates.$inferSelect;

// Pass (Access Token)
export const passes = pgTable("passes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: varchar("type").notNull(),
  scope: jsonb("scope").$type<string[]>(),
  expiresAt: timestamp("expires_at"),
  maxUses: integer("max_uses").default(1),
  usedCount: integer("used_count").default(0),
  status: varchar("status").default("active").notNull(),
  meta: jsonb("meta").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_pass_user").on(table.userId),
]);

export const insertPassSchema = createInsertSchema(passes).omit({
  id: true,
  createdAt: true,
  usedCount: true,
});

export type InsertPass = z.infer<typeof insertPassSchema>;
export type Pass = typeof passes.$inferSelect;

// Audit Log
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  actor: varchar("actor"),
  action: varchar("action").notNull(),
  entityType: varchar("entity_type"),
  entityId: varchar("entity_id"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;

// Pipeline stages constant
export const PIPELINE_STAGES = ["applied", "screen", "interview", "offer", "onboarding", "hired", "rejected"] as const;
export type PipelineStage = typeof PIPELINE_STAGES[number];
