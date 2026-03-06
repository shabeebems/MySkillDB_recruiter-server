import { Request, Response } from "express";
import { handleRequest } from "../utils/handle-request.util";
import { VideoCvService } from "../services/videoCv.service";

export class VideoCvController {
  private videoCvService = new VideoCvService();

  /**
   * Create or update video CV link
   * Uses req.user._id from the authenticated token
   */
  public createOrUpdateVideoCv = (req: any, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString();
    const { jobId, link } = req.body;
    
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

    if (!jobId || !link) {
      return handleRequest(
        res,
        async () => ({
          success: false,
          message: "Job ID and link are required.",
          data: null,
        })
      );
    }

    return handleRequest(
      res,
      () => this.videoCvService.createOrUpdateVideoCv(userId, jobId, link)
    );
  };

  /**
   * Get video CV by user and job
   * Uses req.user._id from the authenticated token
   */
  public getVideoCvByUserAndJob = (req: any, res: Response): Promise<void> => {
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
      () => this.videoCvService.getVideoCvByUserAndJob(userId, jobId)
    );
  };

  /**
   * Get all video CVs by user ID
   * Uses req.user._id from the authenticated token
   */
  public getVideoCvsByUserId = (req: any, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString();
    
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
      () => this.videoCvService.getVideoCvsByUserId(userId)
    );
  };

  /**
   * Get video CV count by user ID
   * Uses req.user._id from the authenticated token
   */
  public getVideoCvCountByUserId = (req: any, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString();
    
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
      () => this.videoCvService.getVideoCvCountByUserId(userId)
    );
  };

  /**
   * Get video CVs by job ID with pagination
   * Public endpoint - no authentication required for email HR view
   */
  public getVideoCvsByJobId = (req: Request, res: Response): Promise<void> => {
    const { jobId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;
    const skip = req.query.skip ? parseInt(req.query.skip as string, 10) : 0;
    
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
      () => this.videoCvService.getVideoCvsByJobId(jobId, limit, skip)
    );
  };

}

