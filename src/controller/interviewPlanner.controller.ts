import { Request, Response } from "express";
import { handleRequest } from "../utils/handle-request.util";
import { InterviewPlannerService } from "../services/interviewPlanner.service";

export class InterviewPlannerController {
  private interviewPlannerService = new InterviewPlannerService();

  public addJobToInterviewPlanner = (req: Request, res: Response): Promise<void> =>
    handleRequest(
      res,
      () => this.interviewPlannerService.addJobToInterviewPlanner((req as any).user?._id, req.body.jobId)
    );

  public getInterviewPlannerJobs = (req: Request, res: Response): Promise<void> =>
    handleRequest(
      res,
      () => this.interviewPlannerService.getInterviewPlannerJobs((req as any).user?._id)
    );

  public getInterviewPlannerCount = (req: Request, res: Response): Promise<void> =>
    handleRequest(
      res,
      () => this.interviewPlannerService.getInterviewPlannerCount((req as any).user?._id)
    );

  public getLatestInterviewPlanners = (req: Request, res: Response): Promise<void> =>
    handleRequest(
      res,
      () => this.interviewPlannerService.getLatestInterviewPlanners((req as any).user?._id, 3)
    );

  public checkJobInInterviewPlanner = (req: Request, res: Response): Promise<void> =>
    handleRequest(
      res,
      () => this.interviewPlannerService.checkJobInInterviewPlanner(
        (req as any).user?._id,
        req.params.jobId || req.query.jobId as string
      )
    );

  public removeJobFromInterviewPlanner = (req: Request, res: Response): Promise<void> =>
    handleRequest(
      res,
      () => this.interviewPlannerService.removeJobFromInterviewPlanner(
        (req as any).user?._id,
        req.params.interviewPlannerId
      )
    );
}
