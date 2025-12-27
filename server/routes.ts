import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { format } from "date-fns";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Set up authentication (must be before other routes)
  await setupAuth(app);
  registerAuthRoutes(app);

  // Recruitment Requests
  app.get("/api/recruitment-requests", isAuthenticated, async (req, res) => {
    try {
      const requests = await storage.getRecruitmentRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching recruitment requests:", error);
      res.status(500).json({ message: "Failed to fetch recruitment requests" });
    }
  });

  app.post("/api/recruitment-requests", isAuthenticated, async (req, res) => {
    try {
      const request = await storage.createRecruitmentRequest(req.body);
      res.status(201).json(request);
    } catch (error) {
      console.error("Error creating recruitment request:", error);
      res.status(500).json({ message: "Failed to create recruitment request" });
    }
  });

  app.patch("/api/recruitment-requests/:id", isAuthenticated, async (req, res) => {
    try {
      const request = await storage.updateRecruitmentRequest(req.params.id, req.body);
      if (!request) {
        return res.status(404).json({ message: "Recruitment request not found" });
      }
      res.json(request);
    } catch (error) {
      console.error("Error updating recruitment request:", error);
      res.status(500).json({ message: "Failed to update recruitment request" });
    }
  });

  // Candidates
  app.get("/api/candidates", isAuthenticated, async (req, res) => {
    try {
      const rrId = req.query.rrId as string | undefined;
      const candidatesList = rrId 
        ? await storage.getCandidatesByRR(rrId)
        : await storage.getCandidates();
      res.json(candidatesList);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      res.status(500).json({ message: "Failed to fetch candidates" });
    }
  });

  app.post("/api/candidates", isAuthenticated, async (req, res) => {
    try {
      const candidate = await storage.createCandidate(req.body);
      res.status(201).json(candidate);
    } catch (error) {
      console.error("Error creating candidate:", error);
      res.status(500).json({ message: "Failed to create candidate" });
    }
  });

  app.patch("/api/candidates/:id/stage", isAuthenticated, async (req, res) => {
    try {
      const { stage } = req.body;
      const candidate = await storage.updateCandidateStage(req.params.id, stage);
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }
      res.json(candidate);
    } catch (error) {
      console.error("Error updating candidate stage:", error);
      res.status(500).json({ message: "Failed to update candidate stage" });
    }
  });

  // Interviews
  app.get("/api/interviews", isAuthenticated, async (req, res) => {
    try {
      const interviewsList = await storage.getInterviews();
      res.json(interviewsList);
    } catch (error) {
      console.error("Error fetching interviews:", error);
      res.status(500).json({ message: "Failed to fetch interviews" });
    }
  });

  app.post("/api/interviews", isAuthenticated, async (req, res) => {
    try {
      const interview = await storage.createInterview(req.body);
      res.status(201).json(interview);
    } catch (error) {
      console.error("Error creating interview:", error);
      res.status(500).json({ message: "Failed to create interview" });
    }
  });

  app.patch("/api/interviews/:id", isAuthenticated, async (req, res) => {
    try {
      const interview = await storage.updateInterview(req.params.id, req.body);
      if (!interview) {
        return res.status(404).json({ message: "Interview not found" });
      }
      res.json(interview);
    } catch (error) {
      console.error("Error updating interview:", error);
      res.status(500).json({ message: "Failed to update interview" });
    }
  });

  // Attendance
  app.get("/api/attendance", isAuthenticated, async (req: any, res) => {
    try {
      const employeeId = req.query.employeeId as string | undefined || req.user?.claims?.sub;
      const logs = await storage.getAttendanceLogs(employeeId);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching attendance logs:", error);
      res.status(500).json({ message: "Failed to fetch attendance logs" });
    }
  });

  app.post("/api/attendance", isAuthenticated, async (req, res) => {
    try {
      const log = await storage.createAttendanceLog(req.body);
      res.status(201).json(log);
    } catch (error) {
      console.error("Error creating attendance log:", error);
      res.status(500).json({ message: "Failed to create attendance log" });
    }
  });

  app.post("/api/attendance/clock-in", isAuthenticated, async (req: any, res) => {
    try {
      const employeeId = req.body.employeeId || req.user?.claims?.sub;
      const today = format(new Date(), "yyyy-MM-dd");
      
      // Check if already clocked in today
      const existing = await storage.getAttendanceByDate(employeeId, today);
      if (existing) {
        return res.status(400).json({ message: "Already clocked in today" });
      }

      const log = await storage.createAttendanceLog({
        employeeId,
        date: today,
        timeIn: new Date(),
        workMode: "office",
        status: "pending",
      });
      res.status(201).json(log);
    } catch (error) {
      console.error("Error clocking in:", error);
      res.status(500).json({ message: "Failed to clock in" });
    }
  });

  app.post("/api/attendance/clock-out", isAuthenticated, async (req: any, res) => {
    try {
      const employeeId = req.body.employeeId || req.user?.claims?.sub;
      const today = format(new Date(), "yyyy-MM-dd");
      
      const existing = await storage.getAttendanceByDate(employeeId, today);
      if (!existing) {
        return res.status(400).json({ message: "No clock-in record found for today" });
      }
      if (existing.timeOut) {
        return res.status(400).json({ message: "Already clocked out today" });
      }

      const timeOut = new Date();
      const timeIn = new Date(existing.timeIn!);
      const totalHours = (timeOut.getTime() - timeIn.getTime()) / (1000 * 60 * 60);

      const log = await storage.updateAttendanceLog(existing.id, {
        timeOut,
        totalHours: Math.round(totalHours * 100) / 100,
        status: "approved",
      });
      res.json(log);
    } catch (error) {
      console.error("Error clocking out:", error);
      res.status(500).json({ message: "Failed to clock out" });
    }
  });

  // ESS Requests
  app.get("/api/ess", isAuthenticated, async (req: any, res) => {
    try {
      const employeeId = req.query.employeeId as string | undefined || req.user?.claims?.sub;
      const requests = await storage.getEssRequests(employeeId);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching ESS requests:", error);
      res.status(500).json({ message: "Failed to fetch ESS requests" });
    }
  });

  app.post("/api/ess", isAuthenticated, async (req, res) => {
    try {
      const request = await storage.createEssRequest(req.body);
      res.status(201).json(request);
    } catch (error) {
      console.error("Error creating ESS request:", error);
      res.status(500).json({ message: "Failed to create ESS request" });
    }
  });

  app.patch("/api/ess/:id", isAuthenticated, async (req, res) => {
    try {
      const request = await storage.updateEssRequest(req.params.id, req.body);
      if (!request) {
        return res.status(404).json({ message: "ESS request not found" });
      }
      res.json(request);
    } catch (error) {
      console.error("Error updating ESS request:", error);
      res.status(500).json({ message: "Failed to update ESS request" });
    }
  });

  // Policies
  app.get("/api/policies", isAuthenticated, async (req, res) => {
    try {
      const policiesList = await storage.getPolicies();
      res.json(policiesList);
    } catch (error) {
      console.error("Error fetching policies:", error);
      res.status(500).json({ message: "Failed to fetch policies" });
    }
  });

  app.post("/api/policies", isAuthenticated, async (req, res) => {
    try {
      const policy = await storage.createPolicy(req.body);
      res.status(201).json(policy);
    } catch (error) {
      console.error("Error creating policy:", error);
      res.status(500).json({ message: "Failed to create policy" });
    }
  });

  app.patch("/api/policies/:id", isAuthenticated, async (req, res) => {
    try {
      const policy = await storage.updatePolicy(req.params.id, req.body);
      if (!policy) {
        return res.status(404).json({ message: "Policy not found" });
      }
      res.json(policy);
    } catch (error) {
      console.error("Error updating policy:", error);
      res.status(500).json({ message: "Failed to update policy" });
    }
  });

  // Policy Acknowledgments
  app.get("/api/policy-acks", isAuthenticated, async (req: any, res) => {
    try {
      const employeeId = req.query.employeeId as string | undefined || req.user?.claims?.sub;
      const acks = await storage.getPolicyAcks(employeeId);
      res.json(acks);
    } catch (error) {
      console.error("Error fetching policy acknowledgments:", error);
      res.status(500).json({ message: "Failed to fetch policy acknowledgments" });
    }
  });

  app.post("/api/policy-acks", isAuthenticated, async (req, res) => {
    try {
      const ack = await storage.createPolicyAck(req.body);
      res.status(201).json(ack);
    } catch (error) {
      console.error("Error creating policy acknowledgment:", error);
      res.status(500).json({ message: "Failed to create policy acknowledgment" });
    }
  });

  // Templates
  app.get("/api/templates", isAuthenticated, async (req, res) => {
    try {
      const templatesList = await storage.getTemplates();
      res.json(templatesList);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.post("/api/templates", isAuthenticated, async (req, res) => {
    try {
      const template = await storage.createTemplate(req.body);
      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating template:", error);
      res.status(500).json({ message: "Failed to create template" });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ ok: true });
  });

  return httpServer;
}
