import { Request, Response } from "express";
import { handleRequest } from "../utils/handle-request.util";
import { TotalJobsReportService } from "../services/report_service/totalJobsReport.service";

export class TotalJobsReportController {
  private totalJobsReportService = new TotalJobsReportService();

  public getTotalJobsReport = (req: Request, res: Response): Promise<void> => {
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
      sortOrder: (req.query.sortOrder as "asc" | "desc") || "desc",
    };

    return handleRequest(
      res,
      () => this.totalJobsReportService.getTotalJobsReport(organizationId, filters)
    );
  };

  public getAllTotalJobsReport = (req: Request, res: Response): Promise<void> => {
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
      () => this.totalJobsReportService.getAllTotalJobsReport(organizationId, filters)
    );
  };
}

