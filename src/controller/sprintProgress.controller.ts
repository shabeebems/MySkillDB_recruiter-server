import { Request, Response } from "express";
import { handleRequest } from "../utils/handle-request.util";
import { SprintProgressService } from "../services/sprintProgress.service";
import { SprintJobProgressService } from "../services/sprintJobProgress.service";

export class SprintProgressController {
  private sprintProgressService = new SprintProgressService();
  private sprintJobProgressService = new SprintJobProgressService();

  /**
   * Get all sprints for the authenticated user
   * Uses req.user._id from the authenticated token
   */
  public getSprintsByUserId = (req: any, res: Response): Promise<void> => {
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
      () => this.sprintProgressService.getSprintsByUserId(userId)
    );
  };

  /**
   * Get sprint jobs with progress for the authenticated user
   * Uses req.user._id from the authenticated token
   */
  public getSprintJobsWithProgress = (req: any, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString();
    const sprintId = req.params.sprintId;
    
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

    if (!sprintId) {
      return handleRequest(
        res,
        async () => ({
          success: false,
          message: "Sprint ID is required.",
          data: null,
        })
      );
    }

    return handleRequest(
      res,
      () => this.sprintJobProgressService.getSprintJobsWithProgress(userId, sprintId)
    );
  };

  /**
   * Get specific job progress for the authenticated user
   * Uses req.user._id from the authenticated token
   */
  public getJobProgress = (req: any, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString();
    const sprintId = req.params.sprintId;
    const jobId = req.params.jobId;
    
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

    if (!sprintId) {
      return handleRequest(
        res,
        async () => ({
          success: false,
          message: "Sprint ID is required.",
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
      () => this.sprintJobProgressService.getJobProgress(userId, sprintId, jobId)
    );
  };

  /**
   * Update flip card progress for a job
   * Uses req.user._id from the authenticated token
   */
  public updateFlipCardProgress = (req: any, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString();
    const sprintId = req.params.sprintId;
    const jobId = req.params.jobId;
    const { flipCardProgress } = req.body;
    
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

    if (!sprintId || !jobId) {
      return handleRequest(
        res,
        async () => ({
          success: false,
          message: "Sprint ID and Job ID are required.",
          data: null,
        })
      );
    }

    if (flipCardProgress === undefined || flipCardProgress === null) {
      return handleRequest(
        res,
        async () => ({
          success: false,
          message: "Flip card progress is required.",
          data: null,
        })
      );
    }

    return handleRequest(
      res,
      () => this.sprintJobProgressService.updateFlipCardProgress(userId, sprintId, jobId, flipCardProgress)
    );
  };

  /**
   * Update assessment progress for a job
   * Uses req.user._id from the authenticated token
   */
  public updateAssessmentProgress = (req: any, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString();
    const sprintId = req.params.sprintId;
    const jobId = req.params.jobId;
    const { assessmentProgress } = req.body;
    
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

    if (!sprintId || !jobId) {
      return handleRequest(
        res,
        async () => ({
          success: false,
          message: "Sprint ID and Job ID are required.",
          data: null,
        })
      );
    }

    if (assessmentProgress === undefined || assessmentProgress === null) {
      return handleRequest(
        res,
        async () => ({
          success: false,
          message: "Assessment progress is required.",
          data: null,
        })
      );
    }

    return handleRequest(
      res,
      () => this.sprintJobProgressService.updateAssessmentProgress(userId, sprintId, jobId, assessmentProgress)
    );
  };

  /**
   * Update video CV status for a job (after link is saved to videoCv model)
   * Uses req.user._id from the authenticated token
   */
  public updateVideoCvLink = (req: any, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString();
    const sprintId = req.params.sprintId;
    const jobId = req.params.jobId;
    const { videoCvLink } = req.body;
    
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

    if (!sprintId || !jobId) {
      return handleRequest(
        res,
        async () => ({
          success: false,
          message: "Sprint ID and Job ID are required.",
          data: null,
        })
      );
    }

    // videoCvLink is optional now since it's saved separately
    // This endpoint just updates the status
    return handleRequest(
      res,
      () => this.sprintJobProgressService.updateVideoCvLink(userId, sprintId, jobId, videoCvLink || "")
    );
  };

  /**
   * Get all students for a specific sprint with pagination
   * For org_admin access
   */
  public getStudentsBySprintId = (req: Request, res: Response): Promise<void> => {
    const sprintId = req.params.sprintId;
    
    if (!sprintId) {
      return handleRequest(
        res,
        async () => ({
          success: false,
          message: "Sprint ID is required.",
          data: null,
        })
      );
    }

    return handleRequest(
      res,
      () => this.sprintProgressService.getStudentsBySprintId(sprintId, req.query)
    );
  };
}

