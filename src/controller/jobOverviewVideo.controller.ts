import { Request, Response } from "express";
import { handleRequest } from "../utils/handle-request.util";
import { JobOverviewVideoService } from "../services/jobOverviewVideo.service";

export class JobOverviewVideoController {
  private jobOverviewVideoService = new JobOverviewVideoService();

  public getByOrganizationId = (req: Request, res: Response): Promise<void> =>
    handleRequest(
      res,
      () =>
        this.jobOverviewVideoService.getByOrganizationId(
          req.params.organizationId
        )
    );

  public getByJobId = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () => {
      const organizationId = (req as any).user?.organizationId?.toString?.();
      if (!organizationId) {
        return Promise.resolve({
          success: false,
          message: "Organization context required",
          data: null,
        });
      }
      return this.jobOverviewVideoService.getByJobId(
        req.params.jobId,
        organizationId
      );
    });

  public deleteByJobId = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () => {
      const organizationId = (req as any).user?.organizationId?.toString?.();
      const jobId = req.params.jobId;
      if (!organizationId || !jobId) {
        return Promise.resolve({
          success: false,
          message: "Organization context and jobId required",
          data: null,
        });
      }
      return this.jobOverviewVideoService.deleteByJobId(organizationId, jobId);
    });

  public create = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () => {
      const userId = (req as any).user?._id?.toString?.();
      const organizationId = (req as any).user?.organizationId?.toString?.();
      if (!organizationId) {
        return Promise.resolve({
          success: false,
          message: "Organization context required",
          data: null,
        });
      }
      const { jobId, title, videoUrl, description } = req.body || {};
      return this.jobOverviewVideoService.create({
        organizationId,
        jobId,
        title,
        videoUrl,
        description,
        createdBy: userId,
      });
    });
}
