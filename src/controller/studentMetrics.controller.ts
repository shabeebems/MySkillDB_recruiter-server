import { Request, Response } from "express";
import { handleRequest } from "../utils/handle-request.util";
import { StudentMetricsService } from "../services/report_service/studentMetrics.service";

export class StudentMetricsController {
  private studentMetricsService = new StudentMetricsService();

  public getStudentMetrics = (req: Request, res: Response): Promise<void> => {
    const organizationId = req.params.organizationId || (req as any).user?.organizationId?.toString();
    
    if (!organizationId) {
      return handleRequest(
        res,
        async () => ({
          success: false,
          message: "Organization ID is required",
          data: null,
        })
      );
    }

    const filters = {
      departmentId: req.query.departmentId as string,
      classId: req.query.classId as string,
      sectionId: req.query.sectionId as string || req.query.assignmentId as string,
      search: req.query.search as string,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      sortBy: req.query.sortBy as string,
      sortOrder: (req.query.sortOrder as "asc" | "desc") || "asc",
    };

    return handleRequest(
      res,
      () => this.studentMetricsService.getStudentMetrics(organizationId, filters)
    );
  };

  public getAllStudentMetrics = (req: Request, res: Response): Promise<void> => {
    const organizationId = req.params.organizationId || (req as any).user?.organizationId?.toString();
    
    if (!organizationId) {
      return handleRequest(
        res,
        async () => ({
          success: false,
          message: "Organization ID is required",
          data: null,
        })
      );
    }

    const filters = {
      departmentId: req.query.departmentId as string,
      classId: req.query.classId as string,
      sectionId: req.query.sectionId as string || req.query.assignmentId as string,
      search: req.query.search as string,
    };

    return handleRequest(
      res,
      () => this.studentMetricsService.getAllStudentMetrics(organizationId, filters)
    );
  };
}

