import { Router } from "express";
import { RecordingController } from "../controller/recording.controller";
import { authenticateToken } from "../middlewares/tokenValidation";
import { validate } from "../middlewares/zodValidate";
import { createRecordingSchema } from "../schemas/recording.schema";

const recordingRouter: Router = Router();

const recordingController = new RecordingController();

// Student accessible routes - placed before global middleware
recordingRouter.get(
  "/subject/:subjectId/topic/:topicId",
  authenticateToken(["master_admin", "org_admin", "student"]),
  recordingController.getRecordingsBySubjectIdAndTopicId
);

recordingRouter.get(
  "/subject/:subjectId",
  authenticateToken(["master_admin", "org_admin", "student"]),
  recordingController.getRecordingsBySubjectId
);

recordingRouter.get(
  "/topics",
  authenticateToken(["master_admin", "org_admin", "student"]),
  recordingController.getRecordingsByTopicIds
);

recordingRouter.get(
  "/job/:jobId",
  authenticateToken(["master_admin", "org_admin", "student"]),
  recordingController.getRecordingsByJobId
);

recordingRouter.get(
  "/job/:jobId/skill/:skillId",
  authenticateToken(["master_admin", "org_admin", "student"]),
  recordingController.getRecordingsBySkillId
);

// Admin-only routes - global middleware
recordingRouter.use(authenticateToken(["master_admin", "org_admin"]));

recordingRouter.post(
  "/",
  validate(createRecordingSchema),
  recordingController.createRecording
);

recordingRouter.delete(
  "/:recordingId",
  recordingController.deleteRecording
);

export default recordingRouter;

