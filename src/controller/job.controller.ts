import { Request, Response } from "express";
import { handleRequest } from "../utils/handle-request.util";
import { JobService } from "../services/job.service";

export class JobController {
  private jobService = new JobService();

  public createJob = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () => this.jobService.createJob(req.body));

  public getJobsByOrganization = (req: Request, res: Response): Promise<void> =>
    handleRequest(
      res,
      () =>
        this.jobService.getJobsByOrganization(
          req.params.organizationId,
          req.query?.departmentId as string | undefined,
          req.query?.companyId as string | undefined,
          req.query?.companyName as string | undefined,
          req.query?.page ? parseInt(req.query.page as string) : undefined,
          req.query?.limit ? parseInt(req.query.limit as string) : undefined,
          req.query?.statusFilter as string | undefined,
          req.query?.sortBy as string | undefined
        )
    );

  public getJobById = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () => this.jobService.getJobById(req.params.jobId));

  public getJobsByDepartment = (req: Request, res: Response): Promise<void> =>
    handleRequest(
      res,
      () =>
        this.jobService.getJobsByDepartment(
          req.params.organizationId,
          req.params.departmentId
        )
    );

  public getLatestJobsByOrganization = (req: Request, res: Response): Promise<void> =>
    handleRequest(
      res,
      () =>
        this.jobService.getLatestJobsByOrganization(
          req.params.organizationId,
          5
        )
    );

  public getJobCountByOrganization = (req: Request, res: Response): Promise<void> =>
    handleRequest(
      res,
      () => this.jobService.getJobCountByOrganization(
        req.params.organizationId,
        req.query?.departmentId as string | undefined
      )
    );

  public getLatestJobsByDepartmentAndOrganization = (req: Request, res: Response): Promise<void> =>
    handleRequest(
      res,
      () => this.jobService.getLatestJobsByDepartmentAndOrganization(
        req.params.organizationId,
        req.params.departmentId,
        3
      )
    );

  public getJobsByCompany = (req: Request, res: Response): Promise<void> =>
    handleRequest(
      res,
      () => this.jobService.getJobsByCompany(
        req.params.organizationId,
        req.params.companyId,
        req.query?.departmentId as string | undefined
      )
    );

  public updateJobStatus = (req: Request, res: Response): Promise<void> =>
    handleRequest(
      res,
      () => this.jobService.updateJobStatus(
        req.params.jobId,
        req.body.isActive
      )
    );

  public updateJob = (req: Request, res: Response): Promise<void> =>
    handleRequest(
      res,
      () => this.jobService.updateJob(
        req.params.jobId,
        req.body
      )
    );

  public getJobsWithoutOverviewVideo = (req: Request, res: Response): Promise<void> =>
    handleRequest(
      res,
      () => this.jobService.getJobsWithoutOverviewVideo(req.params.organizationId)
    );
}
