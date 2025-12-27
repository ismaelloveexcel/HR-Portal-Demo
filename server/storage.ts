import { eq, desc } from "drizzle-orm";
import { db } from "./db";
import {
  recruitmentRequests, candidates, availabilitySlots, interviews,
  attendanceLogs, essRequests, policies, policyAcks, templates, passes, auditLogs,
  type InsertRecruitmentRequest, type RecruitmentRequest,
  type InsertCandidate, type Candidate,
  type InsertAvailabilitySlot, type AvailabilitySlot,
  type InsertInterview, type Interview,
  type InsertAttendanceLog, type AttendanceLog,
  type InsertEssRequest, type EssRequest,
  type InsertPolicy, type Policy,
  type InsertPolicyAck, type PolicyAck,
  type InsertTemplate, type Template,
  type InsertPass, type Pass,
  type InsertAuditLog, type AuditLog,
} from "@shared/schema";

export interface IStorage {
  // Recruitment Requests
  getRecruitmentRequests(): Promise<RecruitmentRequest[]>;
  getRecruitmentRequest(id: string): Promise<RecruitmentRequest | undefined>;
  createRecruitmentRequest(data: InsertRecruitmentRequest): Promise<RecruitmentRequest>;
  updateRecruitmentRequest(id: string, data: Partial<InsertRecruitmentRequest>): Promise<RecruitmentRequest | undefined>;

  // Candidates
  getCandidates(): Promise<Candidate[]>;
  getCandidatesByRR(rrId: string): Promise<Candidate[]>;
  getCandidate(id: string): Promise<Candidate | undefined>;
  createCandidate(data: InsertCandidate): Promise<Candidate>;
  updateCandidateStage(id: string, stage: string): Promise<Candidate | undefined>;

  // Availability Slots
  getAvailabilitySlots(rrId?: string): Promise<AvailabilitySlot[]>;
  createAvailabilitySlot(data: InsertAvailabilitySlot): Promise<AvailabilitySlot>;

  // Interviews
  getInterviews(): Promise<Interview[]>;
  getInterview(id: string): Promise<Interview | undefined>;
  createInterview(data: InsertInterview): Promise<Interview>;
  updateInterview(id: string, data: Partial<InsertInterview>): Promise<Interview | undefined>;

  // Attendance
  getAttendanceLogs(employeeId?: string): Promise<AttendanceLog[]>;
  getAttendanceLog(id: string): Promise<AttendanceLog | undefined>;
  getAttendanceByDate(employeeId: string, date: string): Promise<AttendanceLog | undefined>;
  createAttendanceLog(data: InsertAttendanceLog): Promise<AttendanceLog>;
  updateAttendanceLog(id: string, data: Partial<InsertAttendanceLog>): Promise<AttendanceLog | undefined>;

  // ESS Requests
  getEssRequests(employeeId?: string): Promise<EssRequest[]>;
  createEssRequest(data: InsertEssRequest): Promise<EssRequest>;
  updateEssRequest(id: string, data: Partial<InsertEssRequest>): Promise<EssRequest | undefined>;

  // Policies
  getPolicies(): Promise<Policy[]>;
  getPolicy(id: string): Promise<Policy | undefined>;
  createPolicy(data: InsertPolicy): Promise<Policy>;
  updatePolicy(id: string, data: Partial<InsertPolicy>): Promise<Policy | undefined>;

  // Policy Acknowledgments
  getPolicyAcks(employeeId?: string): Promise<PolicyAck[]>;
  createPolicyAck(data: InsertPolicyAck): Promise<PolicyAck>;

  // Templates
  getTemplates(): Promise<Template[]>;
  getTemplate(id: string): Promise<Template | undefined>;
  createTemplate(data: InsertTemplate): Promise<Template>;

  // Passes
  getPasses(userId?: string): Promise<Pass[]>;
  getPass(id: string): Promise<Pass | undefined>;
  createPass(data: InsertPass): Promise<Pass>;

  // Audit Logs
  createAuditLog(data: InsertAuditLog): Promise<AuditLog>;
}

export class DatabaseStorage implements IStorage {
  // Recruitment Requests
  async getRecruitmentRequests(): Promise<RecruitmentRequest[]> {
    return db.select().from(recruitmentRequests).orderBy(desc(recruitmentRequests.createdAt));
  }

  async getRecruitmentRequest(id: string): Promise<RecruitmentRequest | undefined> {
    const [rr] = await db.select().from(recruitmentRequests).where(eq(recruitmentRequests.id, id));
    return rr;
  }

  async createRecruitmentRequest(data: InsertRecruitmentRequest): Promise<RecruitmentRequest> {
    const [rr] = await db.insert(recruitmentRequests).values(data).returning();
    return rr;
  }

  async updateRecruitmentRequest(id: string, data: Partial<InsertRecruitmentRequest>): Promise<RecruitmentRequest | undefined> {
    const [rr] = await db.update(recruitmentRequests).set(data).where(eq(recruitmentRequests.id, id)).returning();
    return rr;
  }

  // Candidates
  async getCandidates(): Promise<Candidate[]> {
    return db.select().from(candidates).orderBy(desc(candidates.createdAt));
  }

  async getCandidatesByRR(rrId: string): Promise<Candidate[]> {
    return db.select().from(candidates).where(eq(candidates.rrId, rrId)).orderBy(desc(candidates.createdAt));
  }

  async getCandidate(id: string): Promise<Candidate | undefined> {
    const [candidate] = await db.select().from(candidates).where(eq(candidates.id, id));
    return candidate;
  }

  async createCandidate(data: InsertCandidate): Promise<Candidate> {
    const [candidate] = await db.insert(candidates).values(data).returning();
    return candidate;
  }

  async updateCandidateStage(id: string, stage: string): Promise<Candidate | undefined> {
    const [candidate] = await db.update(candidates).set({ currentStage: stage }).where(eq(candidates.id, id)).returning();
    return candidate;
  }

  // Availability Slots
  async getAvailabilitySlots(rrId?: string): Promise<AvailabilitySlot[]> {
    if (rrId) {
      return db.select().from(availabilitySlots).where(eq(availabilitySlots.rrId, rrId)).orderBy(availabilitySlots.startTime);
    }
    return db.select().from(availabilitySlots).orderBy(availabilitySlots.startTime);
  }

  async createAvailabilitySlot(data: InsertAvailabilitySlot): Promise<AvailabilitySlot> {
    const [slot] = await db.insert(availabilitySlots).values(data).returning();
    return slot;
  }

  // Interviews
  async getInterviews(): Promise<Interview[]> {
    return db.select().from(interviews).orderBy(desc(interviews.slotTime));
  }

  async getInterview(id: string): Promise<Interview | undefined> {
    const [interview] = await db.select().from(interviews).where(eq(interviews.id, id));
    return interview;
  }

  async createInterview(data: InsertInterview): Promise<Interview> {
    const [interview] = await db.insert(interviews).values(data).returning();
    return interview;
  }

  async updateInterview(id: string, data: Partial<InsertInterview>): Promise<Interview | undefined> {
    const [interview] = await db.update(interviews).set(data).where(eq(interviews.id, id)).returning();
    return interview;
  }

  // Attendance
  async getAttendanceLogs(employeeId?: string): Promise<AttendanceLog[]> {
    if (employeeId) {
      return db.select().from(attendanceLogs).where(eq(attendanceLogs.employeeId, employeeId)).orderBy(desc(attendanceLogs.date));
    }
    return db.select().from(attendanceLogs).orderBy(desc(attendanceLogs.date));
  }

  async getAttendanceLog(id: string): Promise<AttendanceLog | undefined> {
    const [log] = await db.select().from(attendanceLogs).where(eq(attendanceLogs.id, id));
    return log;
  }

  async getAttendanceByDate(employeeId: string, date: string): Promise<AttendanceLog | undefined> {
    const logs = await db.select().from(attendanceLogs)
      .where(eq(attendanceLogs.employeeId, employeeId));
    return logs.find(log => log.date === date);
  }

  async createAttendanceLog(data: InsertAttendanceLog): Promise<AttendanceLog> {
    const [log] = await db.insert(attendanceLogs).values(data).returning();
    return log;
  }

  async updateAttendanceLog(id: string, data: Partial<InsertAttendanceLog>): Promise<AttendanceLog | undefined> {
    const [log] = await db.update(attendanceLogs).set(data).where(eq(attendanceLogs.id, id)).returning();
    return log;
  }

  // ESS Requests
  async getEssRequests(employeeId?: string): Promise<EssRequest[]> {
    if (employeeId) {
      return db.select().from(essRequests).where(eq(essRequests.employeeId, employeeId)).orderBy(desc(essRequests.createdAt));
    }
    return db.select().from(essRequests).orderBy(desc(essRequests.createdAt));
  }

  async createEssRequest(data: InsertEssRequest): Promise<EssRequest> {
    const [request] = await db.insert(essRequests).values(data).returning();
    return request;
  }

  async updateEssRequest(id: string, data: Partial<InsertEssRequest>): Promise<EssRequest | undefined> {
    const [request] = await db.update(essRequests).set(data).where(eq(essRequests.id, id)).returning();
    return request;
  }

  // Policies
  async getPolicies(): Promise<Policy[]> {
    return db.select().from(policies).orderBy(desc(policies.createdAt));
  }

  async getPolicy(id: string): Promise<Policy | undefined> {
    const [policy] = await db.select().from(policies).where(eq(policies.id, id));
    return policy;
  }

  async createPolicy(data: InsertPolicy): Promise<Policy> {
    const [policy] = await db.insert(policies).values(data).returning();
    return policy;
  }

  async updatePolicy(id: string, data: Partial<InsertPolicy>): Promise<Policy | undefined> {
    const [policy] = await db.update(policies).set(data).where(eq(policies.id, id)).returning();
    return policy;
  }

  // Policy Acknowledgments
  async getPolicyAcks(employeeId?: string): Promise<PolicyAck[]> {
    if (employeeId) {
      return db.select().from(policyAcks).where(eq(policyAcks.employeeId, employeeId));
    }
    return db.select().from(policyAcks);
  }

  async createPolicyAck(data: InsertPolicyAck): Promise<PolicyAck> {
    const [ack] = await db.insert(policyAcks).values(data).returning();
    return ack;
  }

  // Templates
  async getTemplates(): Promise<Template[]> {
    return db.select().from(templates).orderBy(desc(templates.updatedAt));
  }

  async getTemplate(id: string): Promise<Template | undefined> {
    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    return template;
  }

  async createTemplate(data: InsertTemplate): Promise<Template> {
    const [template] = await db.insert(templates).values(data).returning();
    return template;
  }

  // Passes
  async getPasses(userId?: string): Promise<Pass[]> {
    if (userId) {
      return db.select().from(passes).where(eq(passes.userId, userId)).orderBy(desc(passes.createdAt));
    }
    return db.select().from(passes).orderBy(desc(passes.createdAt));
  }

  async getPass(id: string): Promise<Pass | undefined> {
    const [pass] = await db.select().from(passes).where(eq(passes.id, id));
    return pass;
  }

  async createPass(data: InsertPass): Promise<Pass> {
    const [pass] = await db.insert(passes).values(data).returning();
    return pass;
  }

  // Audit Logs
  async createAuditLog(data: InsertAuditLog): Promise<AuditLog> {
    const [log] = await db.insert(auditLogs).values(data).returning();
    return log;
  }
}

export const storage = new DatabaseStorage();
