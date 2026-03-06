import { Router } from "express";
import { StudentTestHistoryController } from "../controller/studentTestHistory.controller";
import { authenticateToken } from "../middlewares/tokenValidation";

const studentTestHistoryRouter: Router = Router();
const studentTestHistoryController = new StudentTestHistoryController();

// Allow students to access their test history
studentTestHistoryRouter.use(authenticateToken(["master_admin", "org_admin", "student"]));

// Subject-based test history
// GET /tests/:subjectId - Get subject-level tests
// GET /tests/:subjectId?topicId=xxx - Get topic-level tests under subject
studentTestHistoryRouter.get(
  "/tests/:subjectId",
  studentTestHistoryController.getStudentTestHistoryBySubject
);

// Job-based test history
// GET /tests/job/:jobId - Get job-level tests
// GET /tests/job/:jobId?skillId=xxx - Get skill-level tests under job
studentTestHistoryRouter.get(
  "/tests/job/:jobId",
  studentTestHistoryController.getStudentTestHistoryByJob
);

studentTestHistoryRouter.get(
  "/:studentTestHistoryId",
  studentTestHistoryController.getStudentTestHistoryById
);

studentTestHistoryRouter.post(
  "/:studentTestHistoryId/complete",
  studentTestHistoryController.completeTest
);

// Get average test score for a skill in a job
// GET /skill-average/:jobId/:skillId?userId=xxx&organizationId=xxx (userId or studentId)
studentTestHistoryRouter.get(
  "/skill-average/:jobId/:skillId",
  studentTestHistoryController.getSkillAverageScore
);

// Get job skill status: skills tested + skills with at least one correct answer
// GET /job/:jobId/skill-status?userId=xxx (userId optional if from auth)
studentTestHistoryRouter.get(
  "/job/:jobId/skill-status",
  studentTestHistoryController.getJobSkillStatus
);

// Check if a test is completed for a user
// GET /check-completion/:testId?userId=xxx&organizationId=xxx (userId or studentId)
studentTestHistoryRouter.get(
  "/check-completion/:testId",
  studentTestHistoryController.checkTestCompletionStatus
);

export default studentTestHistoryRouter;

