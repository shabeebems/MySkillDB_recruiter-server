import { Router } from "express";
import { TotalJobsReportController } from "../controller/totalJobsReport.controller";
import { authenticateToken } from "../middlewares/tokenValidation";

const totalJobsReportRouter: Router = Router();
const totalJobsReportController = new TotalJobsReportController();

// All routes require org_admin or master_admin
totalJobsReportRouter.use(authenticateToken(["org_admin", "master_admin"]));

// Get total jobs report with pagination
totalJobsReportRouter.get(
  "/organization/:organizationId",
  totalJobsReportController.getTotalJobsReport
);

// Get total jobs report without pagination (for exports)
totalJobsReportRouter.get(
  "/organization/:organizationId/all",
  totalJobsReportController.getAllTotalJobsReport
);

// Alternative route using user's organization from token
totalJobsReportRouter.get(
  "/",
  totalJobsReportController.getTotalJobsReport
);

export default totalJobsReportRouter;

