import { Types } from "mongoose";
import { InterviewPlannerRepository } from "../repositories/interviewPlanner.repository";
import { ServiceResponse } from "./types";
import { Messages } from "../constants/messages";
import { IInterviewPlanner } from "../models/interviewPlanner.model";
import { createChildLogger } from "../utils/logger";

const log = createChildLogger("InterviewPlannerService");


export class InterviewPlannerService {
  private interviewPlannerRepository = new InterviewPlannerRepository();

  public async addJobToInterviewPlanner(
    userId: string | undefined,
    jobId: string
  ): Promise<ServiceResponse> {
    if (!userId || !jobId) {
      return {
        success: false,
        message: "userId and jobId are required",
        data: null,
      };
    }

    try {
      const existing = await this.interviewPlannerRepository.findByUserIdAndJobId(
        userId,
        jobId
      );

      if (existing) {
        return {
          success: false,
          message: "Job already exists in interview planner",
          data: existing,
        };
      }

      const interviewPlanner = await this.interviewPlannerRepository.create({
        userId: new Types.ObjectId(userId) as any,
        jobId: new Types.ObjectId(jobId) as any,
      } as Partial<IInterviewPlanner>);

      return {
        success: true,
        message: Messages.INTERVIEW_PLANNER_ADDED_SUCCESS || "Job added to interview planner successfully",
        data: interviewPlanner,
      };
    } catch (error) {
      log.error({ err: error }, "Error adding job to interview planner:");
      return {
        success: false,
        message: "Failed to add job to interview planner",
        data: null,
      };
    }
  }

  public async getInterviewPlannerJobs(userId: string | undefined): Promise<ServiceResponse> {
    if (!userId) {
      return {
        success: false,
        message: "userId is required",
        data: null,
      };
    }

    try {
      const interviewPlanners = await this.interviewPlannerRepository.findByUserId(userId);
      return {
        success: true,
        message: Messages.INTERVIEW_PLANNER_FETCH_SUCCESS || "Interview planner jobs fetched successfully",
        data: interviewPlanners,
      };
    } catch (error) {
      log.error({ err: error }, "Error fetching interview planner jobs:");
      return {
        success: false,
        message: "Failed to fetch interview planner jobs",
        data: null,
      };
    }
  }

  public async getInterviewPlannerCount(userId: string | undefined): Promise<ServiceResponse> {
    if (!userId) {
      return {
        success: false,
        message: "userId is required",
        data: null,
      };
    }

    try {
      const count = await this.interviewPlannerRepository.countByUserId(userId);
      return {
        success: true,
        message: Messages.INTERVIEW_PLANNER_FETCH_SUCCESS || "Interview planner count fetched successfully",
        data: { count },
      };
    } catch (error) {
      log.error({ err: error }, "Error fetching interview planner count:");
      return {
        success: false,
        message: "Failed to fetch interview planner count",
        data: null,
      };
    }
  }

  public async getLatestInterviewPlanners(userId: string | undefined, limit: number = 3): Promise<ServiceResponse> {
    if (!userId) {
      return {
        success: false,
        message: "userId is required",
        data: null,
      };
    }

    try {
      const interviewPlanners = await this.interviewPlannerRepository.findLatestByUserId(userId, limit);
      return {
        success: true,
        message: Messages.INTERVIEW_PLANNER_FETCH_SUCCESS || "Latest interview planners fetched successfully",
        data: interviewPlanners,
      };
    } catch (error) {
      log.error({ err: error }, "Error fetching latest interview planners:");
      return {
        success: false,
        message: "Failed to fetch latest interview planners",
        data: null,
      };
    }
  }

  public async checkJobInInterviewPlanner(
    userId: string | undefined,
    jobId: string
  ): Promise<ServiceResponse> {
    if (!userId || !jobId) {
      return {
        success: false,
        message: "userId and jobId are required",
        data: null,
      };
    }

    try {
      const existing = await this.interviewPlannerRepository.findByUserIdAndJobId(
        userId,
        jobId
      );

      return {
        success: true,
        message: "Check completed",
        data: { exists: !!existing },
      };
    } catch (error) {
      log.error({ err: error }, "Error checking job in interview planner:");
      return {
        success: false,
        message: "Failed to check job in interview planner",
        data: null,
      };
    }
  }

  public async removeJobFromInterviewPlanner(
    userId: string | undefined,
    interviewPlannerId: string
  ): Promise<ServiceResponse> {
    if (!userId || !interviewPlannerId) {
      return {
        success: false,
        message: "userId and interviewPlannerId are required",
        data: null,
      };
    }

    try {
      const interviewPlanner = await this.interviewPlannerRepository.findById(interviewPlannerId);

      if (!interviewPlanner) {
        return {
          success: false,
          message: "Interview planner entry not found",
          data: null,
        };
      }

      if (String(interviewPlanner.userId) !== String(userId)) {
        return {
          success: false,
          message: "You don't have permission to remove this job",
          data: null,
        };
      }

      const deleted = await this.interviewPlannerRepository.delete(interviewPlannerId);

      if (!deleted) {
        return {
          success: false,
          message: "Failed to remove job from interview planner",
          data: null,
        };
      }

      return {
        success: true,
        message: Messages.INTERVIEW_PLANNER_DELETED_SUCCESS,
        data: deleted,
      };
    } catch (error) {
      log.error({ err: error }, "Error removing job from interview planner:");
      return {
        success: false,
        message: "Failed to remove job from interview planner",
        data: null,
      };
    }
  }
}
