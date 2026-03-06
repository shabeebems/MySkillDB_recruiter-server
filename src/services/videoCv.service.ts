import { VideoCvRepository } from "../repositories/videoCv.repository";
import { ServiceResponse } from "./types";
import { Types } from "mongoose";
import JobModel from "../models/job.model";
import UserModel from "../models/user.model";
import { NotificationService } from "./notification.service";
import { createChildLogger } from "../utils/logger";

const log = createChildLogger("VideoCvService");


export class VideoCvService {
  private videoCvRepository = new VideoCvRepository();
  private notificationService = new NotificationService();

  /**
   * Create or update video CV link
   * @param userId - The user's ObjectId
   * @param jobId - The job's ObjectId
   * @param link - The video CV link URL
   * @returns ServiceResponse
   */
  public async createOrUpdateVideoCv(
    userId: string,
    jobId: string,
    link: string
  ): Promise<ServiceResponse> {
    try {
      // userId and jobId are strings, convert to ObjectId for validation
      const userIdObj = new Types.ObjectId(userId);
      const jobIdObj = new Types.ObjectId(jobId);

      const videoCv = await this.videoCvRepository.createOrUpdate(
        userIdObj.toString(),
        jobIdObj.toString(),
        link
      );

      // Create org activity for admin notification feed (non-blocking)
      Promise.all([
        JobModel.findById(jobId).lean(),
        UserModel.findById(userId).select("name").lean(),
      ])
        .then(([job, user]) => {
          if (!job || !user || !(job as any).organizationId) return;
          const orgId = String((job as any).organizationId);
          const studentName = (user as any).name || "A student";
          const jobName = (job as any).name || "a position";
          return this.notificationService.createOrganizationActivity(
            orgId,
            "video_cv_submitted",
            "Student Video CV Submitted",
            `${studentName} submitted a video CV for ${jobName} position`,
            {
              jobId: String(job._id),
              videoCvId: String((videoCv as any)._id),
              userId: String(user._id),
            }
          );
        })
        .catch((err) => log.error({ err: err }, "Error creating video CV activity:"));

      return {
        success: true,
        message: "Video CV link saved successfully",
        data: videoCv,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to save video CV link",
        data: null,
      };
    }
  }

  /**
   * Get video CV by user and job
   * @param userId - The user's ObjectId
   * @param jobId - The job's ObjectId
   * @returns ServiceResponse
   */
  public async getVideoCvByUserAndJob(
    userId: string,
    jobId: string
  ): Promise<ServiceResponse> {
    try {
      // userId and jobId are strings, convert to ObjectId for validation
      const userIdObj = new Types.ObjectId(userId);
      const jobIdObj = new Types.ObjectId(jobId);

      const videoCv = await this.videoCvRepository.findByUserIdAndJobId(
        userIdObj.toString(),
        jobIdObj.toString()
      );

      return {
        success: true,
        message: "Video CV fetched successfully",
        data: videoCv,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to fetch video CV",
        data: null,
      };
    }
  }

  /**
   * Get all video CVs by user ID
   * @param userId - The user's ObjectId
   * @returns ServiceResponse
   */
  public async getVideoCvsByUserId(
    userId: string
  ): Promise<ServiceResponse> {
    try {
      // userId is a string, convert to ObjectId for validation
      const userIdObj = new Types.ObjectId(userId);

      const videoCvs = await this.videoCvRepository.findByUserId(
        userIdObj.toString()
      );

      return {
        success: true,
        message: "Video CVs fetched successfully",
        data: videoCvs,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to fetch video CVs",
        data: null,
      };
    }
  }

  /**
   * Get video CV count by user ID
   * @param userId - The user's ObjectId
   * @returns ServiceResponse
   */
  public async getVideoCvCountByUserId(
    userId: string
  ): Promise<ServiceResponse> {
    try {
      // userId is a string, convert to ObjectId for validation
      const userIdObj = new Types.ObjectId(userId);

      const count = await this.videoCvRepository.countByUserId(
        userIdObj.toString()
      );

      return {
        success: true,
        message: "Video CV count fetched successfully",
        data: { count },
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to fetch video CV count",
        data: null,
      };
    }
  }

  /**
   * Get video CVs by job ID with pagination
   * @param jobId - The job's ObjectId
   * @param limit - Number of items to fetch (default: 5)
   * @param skip - Number of items to skip (default: 0)
   * @returns ServiceResponse
   */
  public async getVideoCvsByJobId(
    jobId: string,
    limit: number = 5,
    skip: number = 0
  ): Promise<ServiceResponse> {
    try {
      // jobId is a string, convert to ObjectId for validation
      const jobIdObj = new Types.ObjectId(jobId);

      const [videoCvs, totalCount] = await Promise.all([
        this.videoCvRepository.findByJobId(
          jobIdObj.toString(),
          limit,
          skip
        ),
        this.videoCvRepository.countByJobId(jobIdObj.toString())
      ]);

      return {
        success: true,
        message: "Video CVs fetched successfully",
        data: {
          videoCvs,
          total: totalCount,
          hasMore: skip + videoCvs.length < totalCount,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to fetch video CVs",
        data: null,
      };
    }
  }

}

