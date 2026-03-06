import { Request, Response } from "express";
import { handleRequest } from "../utils/handle-request.util";
import { ReadingModuleService } from "../services/readingModule.service";

export class ReadingModuleController {
  private readingModuleService = new ReadingModuleService();

  public createReadingModule = (req: Request, res: Response): Promise<void> =>
    handleRequest(
      res,
      () => this.readingModuleService.createReadingModule(req.body)
    );

  public getReadingModuleByJobAndSkill = (req: Request, res: Response): Promise<void> =>
    handleRequest(
      res,
      () => this.readingModuleService.getReadingModuleByJobAndSkill(
        req.query.jobId as string,
        req.query.skillId as string
      )
    );

  public getJobBriefs = (req: Request, res: Response): Promise<void> =>
    handleRequest(
      res,
      () => this.readingModuleService.getJobBriefs(
        req.params.organizationId,
        req.query.jobId as string | undefined
      )
    );

  public deleteJobBrief = (req: Request, res: Response): Promise<void> =>
    handleRequest(
      res,
      () => this.readingModuleService.deleteJobBrief(req.params.id)
    );
}

