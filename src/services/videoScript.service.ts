import { Types } from "mongoose";
import { VideoScriptRepository } from "../repositories/videoScript.repository";
import { VideoScriptSectionRepository } from "../repositories/videoScriptSection.repository";
import { ServiceResponse } from "./types";
import { Messages } from "../constants/messages";
import { IVideoScript } from "../models/videoScript.model";
import { createChildLogger } from "../utils/logger";

const log = createChildLogger("VideoScriptService");


export class VideoScriptService {
  private videoScriptRepository = new VideoScriptRepository();
  private videoScriptSectionRepository = new VideoScriptSectionRepository();

  public async createVideoScript(
    userId: string | undefined,
    data: {
      jobId: string;
      skillId: string;
      interviewPlannerId: string;
      userIdea: string;
      selectedLength: string;
      sections: Array<{ time: string; title: string; content: string }>;
    }
  ): Promise<ServiceResponse> {
    if (!userId || !data.jobId || !data.skillId || !data.userIdea) {
      return {
        success: false,
        message: "userId, jobId, skillId, and userIdea are required",
        data: null,
      };
    }

    try {
      // Check if video script already exists with same jobId, skillId, and userIdea
      const existingScript = await this.videoScriptRepository.findByJobIdAndSkillIdAndUserIdea(
        data.jobId,
        data.skillId,
        data.userIdea
      );

      if (existingScript) {
        return {
          success: false,
          message: "Video script with this idea already exists for this skill and job",
          data: existingScript,
        };
      }

      // Create video script
      const videoScript = await this.videoScriptRepository.create({
        userId: new Types.ObjectId(userId) as any,
        jobId: new Types.ObjectId(data.jobId) as any,
        skillId: new Types.ObjectId(data.skillId) as any,
        userIdea: data.userIdea.trim(),
        selectedLength: data.selectedLength,
      } as Partial<IVideoScript>);

      // Create sections
      if (data.sections && data.sections.length > 0) {
        const sectionsToCreate = data.sections.map((section, index) => ({
          videoScriptId: new Types.ObjectId(String(videoScript._id)) as any,
          time: section.time,
          title: section.title.trim(),
          content: section.content,
          order: index,
        }));

        await this.videoScriptSectionRepository.createMany(sectionsToCreate);
      }

      return {
        success: true,
        message: Messages.VIDEO_SCRIPT_CREATED_SUCCESS || "Video script created successfully",
        data: videoScript,
      };
    } catch (error) {
      log.error({ err: error }, "Error creating video script:");
      return {
        success: false,
        message: "Failed to create video script",
        data: null,
      };
    }
  }

  public async getVideoScriptsByJobAndSkillForStudent(
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
      const videoScripts = await this.videoScriptRepository.findByUserAndJobAndSkill(
        userId,
        jobId,
        skillId
      );
      return {
        success: true,
        message: Messages.VIDEO_SCRIPT_FETCH_SUCCESS || "Video scripts fetched successfully",
        data: videoScripts,
      };
    } catch (error) {
      log.error({ err: error }, "Error fetching video scripts:");
      return {
        success: false,
        message: "Failed to fetch video scripts",
        data: null,
      };
    }
  }

  public async getVideoScriptSections(videoScriptId: string): Promise<ServiceResponse> {
    if (!videoScriptId) {
      return {
        success: false,
        message: "videoScriptId is required",
        data: null,
      };
    }

    try {
      const sections = await this.videoScriptSectionRepository.findByVideoScriptId(videoScriptId);

      // Sort by order
      const sortedSections = sections.sort((a, b) => a.order - b.order);
      return {
        success: true,
        message: Messages.VIDEO_SCRIPT_SECTIONS_FETCH_SUCCESS || "Video script sections fetched successfully",
        data: sortedSections,
      };
    } catch (error) {
      log.error({ err: error }, "Error fetching video script sections:");
      return {
        success: false,
        message: "Failed to fetch video script sections",
        data: null,
      };
    }
  }

  public async getVideoScriptsByUserId(userId: string): Promise<ServiceResponse> {
    if (!userId) {
      return {
        success: false,
        message: "userId is required",
        data: null,
      };
    }

    try {
      const videoScripts = await this.videoScriptRepository.findByUserId(userId);
      return {
        success: true,
        message: Messages.VIDEO_SCRIPT_FETCH_SUCCESS || "Video scripts fetched successfully",
        data: videoScripts,
      };
    } catch (error) {
      log.error({ err: error }, "Error fetching video scripts by student:");
      return {
        success: false,
        message: "Failed to fetch video scripts",
        data: null,
      };
    }
  }

  public async getLatestVideoScriptsByUserId(userId: string, limit: number = 10): Promise<ServiceResponse> {
    if (!userId) {
      return {
        success: false,
        message: "userId is required",
        data: null,
      };
    }

    try {
      const videoScripts = await this.videoScriptRepository.findLatestByUserId(userId, limit);
      return {
        success: true,
        message: Messages.VIDEO_SCRIPT_FETCH_SUCCESS || "Video scripts fetched successfully",
        data: videoScripts,
      };
    } catch (error) {
      log.error({ err: error }, "Error fetching latest video scripts by student:");
      return {
        success: false,
        message: "Failed to fetch video scripts",
        data: null,
      };
    }
  }

  public async deleteVideoScript(videoScriptId: string, userId: string | undefined): Promise<ServiceResponse> {
    if (!videoScriptId) {
      return {
        success: false,
        message: "videoScriptId is required",
        data: null,
      };
    }

    try {
      // Verify the script belongs to the user
      const script = await this.videoScriptRepository.findById(videoScriptId);
      if (!script) {
        return {
          success: false,
          message: "Video script not found",
          data: null,
        };
      }

      // Check if user owns this script
      if (userId && String(script.userId) !== String(userId)) {
        return {
          success: false,
          message: "You don't have permission to delete this script",
          data: null,
        };
      }

      // Delete all sections associated with this script
      await this.videoScriptSectionRepository.deleteByVideoScriptId(videoScriptId);

      // Delete the script
      const deleted = await this.videoScriptRepository.delete(videoScriptId);
      if (!deleted) {
        return {
          success: false,
          message: "Failed to delete video script",
          data: null,
        };
      }

      return {
        success: true,
        message: "Video script deleted successfully",
        data: deleted,
      };
    } catch (error) {
      log.error({ err: error }, "Error deleting video script:");
      return {
        success: false,
        message: "Failed to delete video script",
        data: null,
      };
    }
  }
}

