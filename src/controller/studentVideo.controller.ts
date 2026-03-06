import { Request, Response } from "express";
import { handleRequest } from "../utils/handle-request.util";
import { StudentVideoService } from "../services/studentVideo.service";

export class StudentVideoController {
  private studentVideoService = new StudentVideoService();

  public createStudentVideo = (req: Request, res: Response): Promise<void> =>
    handleRequest(
      res,
      () => this.studentVideoService.createStudentVideo((req as any).user?._id, req.body)
    );

  public getStudentVideos = (req: Request, res: Response): Promise<void> =>
    handleRequest(
      res,
      () => this.studentVideoService.getStudentVideosByUserJobAndSkill(
        (req as any).user?._id,
        req.query.jobId as string,
        req.query.skillId as string
      )
    );

  public getStudentVideoCount = (req: Request, res: Response): Promise<void> =>
    handleRequest(
      res,
      () => this.studentVideoService.getStudentVideoCount((req as any).user?._id)
    );

  public getLatestStudentVideos = (req: Request, res: Response): Promise<void> =>
    handleRequest(
      res,
      () => {
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
        return this.studentVideoService.getLatestStudentVideos((req as any).user?._id, limit);
      }
    );

  public getStudentVideosByStudent = (req: Request, res: Response): Promise<void> =>
    handleRequest(
      res,
      () => this.studentVideoService.getStudentVideosByUserId((req as any).user?._id)
    );

  public deleteStudentVideo = (req: Request, res: Response): Promise<void> =>
    handleRequest(
      res,
      () => this.studentVideoService.deleteStudentVideo(req.params.id, (req as any).user?._id)
    );
}

