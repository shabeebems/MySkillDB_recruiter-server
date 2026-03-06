import { Request, Response } from "express";
import { handleRequest } from "../utils/handle-request.util";
import { VideoCvScriptService } from "../services/videoCvScript.service";

export class VideoCvScriptController {
  private videoCvScriptService = new VideoCvScriptService();

  public createVideoCvScript = (req: any, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString();
    const { jobId, userReasons, videoDuration, tips, sections } = req.body;

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

    if (!jobId || !videoDuration || !sections || sections.length === 0) {
      return handleRequest(
        res,
        async () => ({
          success: false,
          message: "Job ID, video duration, and sections are required.",
          data: null,
        })
      );
    }

    return handleRequest(
      res,
      () =>
        this.videoCvScriptService.createVideoCvScript(userId, {
          jobId,
          userReasons,
          videoDuration,
          tips,
          sections,
        })
    );
  };

  public getVideoCvScriptByUserAndJob = (req: any, res: Response): Promise<void> => {
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
      () => this.videoCvScriptService.getVideoCvScriptByUserAndJob(userId, jobId)
    );
  };
}

