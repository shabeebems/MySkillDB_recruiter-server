import { Request, Response } from "express";
import { handleRequest } from "../utils/handle-request.util";
import { JobApplicationService } from "../services/jobApplication.service";

export class JobApplicationController {
  private jobApplicationService = new JobApplicationService();

  public createJobApplication = (req: any, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString();
    const organizationId = req.user?.organizationId?.toString();
    const { jobId } = req.body;

    if (!userId) {
      return handleRequest(
        res,
        async () => ({
          success: false,
          message: "User ID not found. Please ensure you are authenticated.",
          data: null,
        })
      );
    }

    if (!organizationId) {
      return handleRequest(
        res,
        async () => ({
          success: false,
          message: "Organization ID not found. Please ensure you are associated with an organization.",
          data: null,
        })
      );
    }

    if (!jobId) {
      return handleRequest(
        res,
        async () => ({
          success: false,
          message: "Job ID is required.",
          data: null,
        })
      );
    }

    return handleRequest(
      res,
      () => this.jobApplicationService.createJobApplication(userId, jobId, organizationId)
    );
  };

  public checkJobApplication = (req: any, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString();
    const { jobId } = req.params;

    if (!userId) {
      return handleRequest(
        res,
        async () => ({
          success: false,
          message: "User ID not found. Please ensure you are authenticated.",
          data: null,
        })
      );
    }

    if (!jobId) {
      return handleRequest(
        res,
        async () => ({
          success: false,
          message: "Job ID is required.",
          data: null,
        })
      );
    }

    return handleRequest(
      res,
      () => this.jobApplicationService.checkJobApplication(userId, jobId)
    );
  };

  public getJobApplicationsByStudentId = (req: any, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString();
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!userId) {
      return handleRequest(
        res,
        async () => ({
          success: false,
          message: "User ID not found. Please ensure you are authenticated.",
          data: null,
        })
      );
    }

    return handleRequest(
      res,
      () => this.jobApplicationService.getJobApplicationsByUserId(userId, page, limit)
    );
  };
}

