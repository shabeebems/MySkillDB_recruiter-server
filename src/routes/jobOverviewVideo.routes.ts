import { Router } from "express";
import { JobOverviewVideoController } from "../controller/jobOverviewVideo.controller";
import { authenticateToken } from "../middlewares/tokenValidation";

const jobOverviewVideoRouter = Router();
const jobOverviewVideoController = new JobOverviewVideoController();

jobOverviewVideoRouter.get(
  "/job/:jobId",
  authenticateToken(["master_admin", "org_admin", "student"]),
  jobOverviewVideoController.getByJobId
);

jobOverviewVideoRouter.use(
  authenticateToken(["master_admin", "org_admin"])
);

jobOverviewVideoRouter.get(
  "/organization/:organizationId",
  jobOverviewVideoController.getByOrganizationId
);
jobOverviewVideoRouter.delete("/job/:jobId", jobOverviewVideoController.deleteByJobId);
jobOverviewVideoRouter.post("/", jobOverviewVideoController.create);

export default jobOverviewVideoRouter;
