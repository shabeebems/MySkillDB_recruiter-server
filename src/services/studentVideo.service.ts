import { Types } from "mongoose";
import { StudentVideoRepository } from "../repositories/studentVideo.repository";
import { ServiceResponse } from "./types";
import { Messages } from "../constants/messages";
import { IStudentVideo } from "../models/studentVideo.model";
import { createChildLogger } from "../utils/logger";

const log = createChildLogger("StudentVideoService");


export class StudentVideoService {
  private studentVideoRepository = new StudentVideoRepository();

  public async createStudentVideo(
    userId: string | undefined,
    data: {
      jobId?: string;
      skillId?: string;
      interviewPlannerId?: string;
      title: string;
      link: string;
      description?: string;
    }
  ): Promise<ServiceResponse> {
    if (!userId || !data.title || !data.link) {
      return {
        success: false,
        message: "userId, title, and link are required",
        data: null,
      };
    }

    // Validate: must have (jobId, skillId)
    const isJobVideo = data.jobId && data.skillId;
    
    if (!isJobVideo) {
      return {
        success: false,
        message: "jobId and skillId must be provided",
        data: null,
      };
    }

    try {
      // Create student video
      const videoData: Partial<IStudentVideo> = {
        userId: new Types.ObjectId(userId) as any,
        title: data.title.trim(),
        link: data.link.trim(),
        description: data.description?.trim() || undefined,
        jobId: new Types.ObjectId(data.jobId!) as any,
        skillId: new Types.ObjectId(data.skillId!) as any,
      };

      const studentVideo = await this.studentVideoRepository.create(videoData);

      return {
        success: true,
        message: Messages.STUDENT_VIDEO_CREATED_SUCCESS || "Student video created successfully",
        data: studentVideo,
      };
    } catch (error) {
      log.error({ err: error }, "Error creating student video:");
      return {
        success: false,
        message: "Failed to create student video",
        data: null,
      };
    }
  }

  public async getStudentVideosByUserJobAndSkill(
    userId: string | undefined,
    jobId: string,
    skillId: string
  ): Promise<ServiceResponse> {
    if (!userId || !jobId || !skillId) {
      return {
        success: false,
        message: "userId, jobId and skillId are required",
        data: null,
      };
    }

    try {
      const studentVideos = await this.studentVideoRepository.findByUserAndJobAndSkill(
        userId,
        jobId,
        skillId
      );

      return {
        success: true,
        message: Messages.STUDENT_VIDEO_FETCH_SUCCESS || "Student videos fetched successfully",
        data: studentVideos,
      };
    } catch (error) {
      log.error({ err: error }, "Error fetching student videos:");
      return {
        success: false,
        message: "Failed to fetch student videos",
        data: null,
      };
    }
  }

  public async getStudentVideoCount(userId: string | undefined): Promise<ServiceResponse> {
    if (!userId) {
      return {
        success: false,
        message: "userId is required",
        data: null,
      };
    }

    try {
      const count = await this.studentVideoRepository.countByUserId(userId);
      return {
        success: true,
        message: Messages.STUDENT_VIDEO_FETCH_SUCCESS || "Student video count fetched successfully",
        data: { count },
      };
    } catch (error) {
      log.error({ err: error }, "Error fetching student video count:");
      return {
        success: false,
        message: "Failed to fetch student video count",
        data: null,
      };
    }
  }

  public async getLatestStudentVideos(userId: string | undefined, limit: number = 3): Promise<ServiceResponse> {
    if (!userId) {
      return {
        success: false,
        message: "userId is required",
        data: null,
      };
    }

    try {
      const studentVideos = await this.studentVideoRepository.findLatestByUserId(userId, limit);
      return {
        success: true,
        message: Messages.STUDENT_VIDEO_FETCH_SUCCESS || "Latest student videos fetched successfully",
        data: studentVideos,
      };
    } catch (error) {
      log.error({ err: error }, "Error fetching latest student videos:");
      return {
        success: false,
        message: "Failed to fetch latest student videos",
        data: null,
      };
    }
  }

  public async getStudentVideosByUserId(userId: string): Promise<ServiceResponse> {
    if (!userId) {
      return {
        success: false,
        message: "userId is required",
        data: null,
      };
    }

    try {
      const studentVideos = await this.studentVideoRepository.findByUserId(userId);
      return {
        success: true,
        message: Messages.STUDENT_VIDEO_FETCH_SUCCESS || "Student videos fetched successfully",
        data: studentVideos,
      };
    } catch (error) {
      log.error({ err: error }, "Error fetching student videos by student:");
      return {
        success: false,
        message: "Failed to fetch student videos",
        data: null,
      };
    }
  }

  public async deleteStudentVideo(videoId: string, userId: string | undefined): Promise<ServiceResponse> {
    if (!videoId) {
      return {
        success: false,
        message: "videoId is required",
        data: null,
      };
    }

    try {
      // Verify the video belongs to the student
      const video = await this.studentVideoRepository.findById(videoId);
      if (!video) {
        return {
          success: false,
          message: "Video not found",
          data: null,
        };
      }

      // Check if user owns this video
      if (userId && String(video.userId) !== String(userId)) {
        return {
          success: false,
          message: "You don't have permission to delete this video",
          data: null,
        };
      }

      // Delete the video
      const deleted = await this.studentVideoRepository.delete(videoId);
      if (!deleted) {
        return {
          success: false,
          message: "Failed to delete video",
          data: null,
        };
      }

      return {
        success: true,
        message: "Video deleted successfully",
        data: deleted,
      };
    } catch (error) {
      log.error({ err: error }, "Error deleting student video:");
      return {
        success: false,
        message: "Failed to delete video",
        data: null,
      };
    }
  }
}

