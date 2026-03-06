import { Router } from "express";
import { SprintProgressController } from "../controller/sprintProgress.controller";
import { authenticateToken } from "../middlewares/tokenValidation";

const sprintProgressRouter: Router = Router();

const sprintProgressController = new SprintProgressController();

// Student accessible route - get all sprints for the authenticated student
sprintProgressRouter.get(
  "/student",
  authenticateToken(["master_admin", "org_admin", "student"]),
  sprintProgressController.getSprintsByUserId
);

// Get sprint jobs with progress for the authenticated student
sprintProgressRouter.get(
  "/student/sprint/:sprintId/jobs",
  authenticateToken(["master_admin", "org_admin", "student"]),
  sprintProgressController.getSprintJobsWithProgress
);

// Get specific job progress for the authenticated student
sprintProgressRouter.get(
  "/student/sprint/:sprintId/job/:jobId",
  authenticateToken(["master_admin", "org_admin", "student"]),
  sprintProgressController.getJobProgress
);

// Update flip card progress for a job
sprintProgressRouter.put(
  "/student/sprint/:sprintId/job/:jobId/flip-card-progress",
  authenticateToken(["master_admin", "org_admin", "student"]),
  sprintProgressController.updateFlipCardProgress
);

// Update assessment progress for a job
sprintProgressRouter.put(
  "/student/sprint/:sprintId/job/:jobId/assessment-progress",
  authenticateToken(["master_admin", "org_admin", "student"]),
  sprintProgressController.updateAssessmentProgress
);

// Update video CV link for a job
sprintProgressRouter.put(
  "/student/sprint/:sprintId/job/:jobId/video-cv-link",
  authenticateToken(["master_admin", "org_admin", "student"]),
  sprintProgressController.updateVideoCvLink
);

// Get students for a sprint with pagination (org_admin access)
sprintProgressRouter.get(
  "/sprint/:sprintId/students",
  authenticateToken(["master_admin", "org_admin"]),
  sprintProgressController.getStudentsBySprintId
);

export default sprintProgressRouter;

