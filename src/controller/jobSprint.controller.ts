import { Request, Response } from "express";
import { handleRequest } from "../utils/handle-request.util";
import { JobSprintService } from "../services/jobSprint.service";

export class JobSprintController {
  private jobSprintService = new JobSprintService();

  public createJobSprint = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () => this.jobSprintService.createJobSprint(req.body));

  public getJobSprintsByOrganization = (req: Request, res: Response): Promise<void> =>
    handleRequest(
      res,
      () =>
        this.jobSprintService.getJobSprintsByOrganization(
          req.params.organizationId,
          req.query
        )
    );

  public getJobSprintById = (req: Request, res: Response): Promise<void> =>
    handleRequest(
      res,
      () => this.jobSprintService.getJobSprintById(req.params.sprintId)
    );

  public deleteJobSprint = (req: Request, res: Response): Promise<void> =>
    handleRequest(
      res,
      () => this.jobSprintService.deleteJobSprint(req.params.sprintId)
    );
}
