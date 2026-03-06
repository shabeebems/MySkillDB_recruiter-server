import { Router } from "express";
import { StudentMetricsController } from "../controller/studentMetrics.controller";
import { authenticateToken } from "../middlewares/tokenValidation";

const studentMetricsRouter: Router = Router();
const studentMetricsController = new StudentMetricsController();

// All routes require org_admin or master_admin
studentMetricsRouter.use(authenticateToken(["org_admin", "master_admin"]));

// Get student metrics with pagination
studentMetricsRouter.get(
  "/organization/:organizationId",
  studentMetricsController.getStudentMetrics
);

// Get student metrics without pagination (for exports)
studentMetricsRouter.get(
  "/organization/:organizationId/all",
  studentMetricsController.getAllStudentMetrics
);

// Alternative route using user's organization from token
studentMetricsRouter.get(
  "/",
  studentMetricsController.getStudentMetrics
);

export default studentMetricsRouter;

