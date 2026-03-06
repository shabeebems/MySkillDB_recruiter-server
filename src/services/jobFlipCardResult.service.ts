import { JobFlipCardResultRepository } from "../repositories/jobFlipCardResult.repository";
import { ServiceResponse } from "./types";
import { Types } from "mongoose";

export class JobFlipCardResultService {
  private jobFlipCardResultRepository = new JobFlipCardResultRepository();

  public async createOrUpdateJobFlipCardResult(
    userId: string,
    jobId: string,
    statistics: {
      totalFlipCards: number;
      correctCount: number;
      incorrectCount: number;
    }
  ): Promise<ServiceResponse> {
    try {
      const { totalFlipCards, correctCount, incorrectCount } = statistics;

      // Calculate completion percentage based on correct answers
      // Example: 10 correct out of 20 total = 50%
      const completionPercentage = totalFlipCards > 0 
        ? Math.round((correctCount / totalFlipCards) * 100) 
        : 0;

      // Check if result already exists
      const existingResult = await this.jobFlipCardResultRepository.findByUserIdAndJobId(
        userId,
        jobId
      );

      let result;
      if (existingResult) {
        // Update existing result - increment attendedTimes
        const existingId = (existingResult as any)._id?.toString() || existingResult.id?.toString() || "";
        const currentAttendedTimes = (existingResult as any).attendedTimes || 0;
        const existingCompletionPercentage = (existingResult as any).completionPercentage || 0;
        
        // Only update scores if new percentage is higher than previous
        const shouldUpdateScores = completionPercentage > existingCompletionPercentage;
        
        const resultData: any = {
          userId: new Types.ObjectId(userId) as any,
          jobId: new Types.ObjectId(jobId) as any,
          totalFlipCards,
          attendedTimes: currentAttendedTimes + 1, // Always increment attendedTimes
        };
        
        // Only update correctCount, incorrectCount, and completionPercentage if new score is better
        if (shouldUpdateScores) {
          resultData.correctCount = correctCount;
          resultData.incorrectCount = incorrectCount;
          resultData.completionPercentage = completionPercentage;
        }
        
        result = await this.jobFlipCardResultRepository.update(
          existingId,
          resultData
        );
      } else {
        // Create new result - first time completing
        const resultData = {
          userId: new Types.ObjectId(userId) as any,
          jobId: new Types.ObjectId(jobId) as any,
          totalFlipCards,
          attendedTimes: 1, // First completion
          correctCount,
          incorrectCount,
          completionPercentage,
        };
        
        result = await this.jobFlipCardResultRepository.create(resultData);
      }

      return {
        success: true,
        message: "Job flip card result updated successfully",
        data: result,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to update job flip card result",
        data: null,
      };
    }
  }

  public async getFlipCardResultsByUserId(
    userId: string
  ): Promise<ServiceResponse> {
    try {
      const results = await this.jobFlipCardResultRepository.findByUserId(userId);

      // Transform results to include jobId and completionPercentage
      const resultsMap = results.reduce((acc: any, result: any) => {
        const jobId = (result.jobId as any)?._id?.toString() || result.jobId?.toString() || "";
        const completionPercentage = result.completionPercentage || 0;
        const stars = Math.round((completionPercentage / 100) * 5 * 10) / 10; // Calculate stars
        
        acc[jobId] = {
          completionPercentage,
          stars,
          attendedTimes: result.attendedTimes || 0,
        };
        return acc;
      }, {});

      return {
        success: true,
        message: "Flip card results fetched successfully",
        data: resultsMap,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to fetch flip card results",
        data: null,
      };
    }
  }
}

