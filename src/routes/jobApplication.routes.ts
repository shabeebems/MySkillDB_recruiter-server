import { Router } from "express";
import { JobApplicationController } from "../controller/jobApplication.controller";
import { authenticateToken } from "../middlewares/tokenValidation";
import { validate } from "../middlewares/zodValidate";
import { createJobApplicationSchema } from "../schemas/jobApplication.schema";

const jobApplicationRouter: Router = Router();
const jobApplicationController = new JobApplicationController();

jobApplicationRouter.post(
  "/",
  authenticateToken(["master_admin", "org_admin", "student"]),
  validate(createJobApplicationSchema),
  jobApplicationController.createJobApplication
);

jobApplicationRouter.get(
  "/check/:jobId",
  authenticateToken(["master_admin", "org_admin", "student"]),
  jobApplicationController.checkJobApplication
);

jobApplicationRouter.get(
  "/student",
  authenticateToken(["master_admin", "org_admin", "student"]),
  jobApplicationController.getJobApplicationsByStudentId
);

export default jobApplicationRouter;

