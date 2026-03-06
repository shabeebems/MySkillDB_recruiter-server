import { Request, Response } from "express";
import { handleRequest } from "../utils/handle-request.util";
import { VideoScriptService } from "../services/videoScript.service";

export class VideoScriptController {
  private videoScriptService = new VideoScriptService();

  public createVideoScript = (req: Request, res: Response): Promise<void> =>
    handleRequest(
      res,
      () => this.videoScriptService.createVideoScript((req as any).user?._id, req.body)
    );

  public getVideoScripts = (req: Request, res: Response): Promise<void> =>
    handleRequest(
      res,
      () => this.videoScriptService.getVideoScriptsByJobAndSkillForStudent(
        (req as any).user?._id,
        req.query.jobId as string,
        req.query.skillId as string
      )
    );

  public getVideoScriptSections = (req: Request, res: Response): Promise<void> =>
    handleRequest(
      res,
      () => this.videoScriptService.getVideoScriptSections(req.params.id)
    );

  public getVideoScriptsByStudent = (req: Request, res: Response): Promise<void> =>
    handleRequest(
      res,
      () => this.videoScriptService.getVideoScriptsByUserId((req as any).user?._id)
    );

  public getLatestVideoScriptsByStudent = (req: Request, res: Response): Promise<void> =>
    handleRequest(
      res,
      () => {
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
        return this.videoScriptService.getLatestVideoScriptsByUserId((req as any).user?._id, limit);
      }
    );

  public deleteVideoScript = (req: Request, res: Response): Promise<void> =>
    handleRequest(
      res,
      () => this.videoScriptService.deleteVideoScript(req.params.id, (req as any).user?._id)
    );
}

