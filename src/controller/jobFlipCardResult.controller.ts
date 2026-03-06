import { Request, Response } from "express";
import { handleRequest } from "../utils/handle-request.util";
import { JobFlipCardResultService } from "../services/jobFlipCardResult.service";

export class JobFlipCardResultController {
  private jobFlipCardResultService = new JobFlipCardResultService();

  public createOrUpdateJobFlipCardResult = (req: any, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString();
    const { jobId, totalFlipCards, correctCount, incorrectCount } = req.body;

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

    if (!jobId || totalFlipCards === undefined || 
        correctCount === undefined || incorrectCount === undefined) {
      return handleRequest(
        res,
        async () => ({
          success: false,
          message: "jobId, totalFlipCards, correctCount, and incorrectCount are required.",
          data: null,
        })
      );
    }

    return handleRequest(
      res,
      () => this.jobFlipCardResultService.createOrUpdateJobFlipCardResult(
        userId,
        jobId,
        {
          totalFlipCards,
          correctCount,
          incorrectCount,
        }
      )
    );
  };

  public getFlipCardResultsByStudentId = (req: any, res: Response): Promise<void> => {
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
      () => this.jobFlipCardResultService.getFlipCardResultsByUserId(userId)
    );
  };
}

