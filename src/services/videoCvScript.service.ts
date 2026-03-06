import { VideoCvScriptRepository } from "../repositories/videoCvScript.repository";
import { VideoCvScriptSectionRepository } from "../repositories/videoCvScriptSection.repository";
import { ServiceResponse } from "./types";
import { Types } from "mongoose";
import { IVideoCvScript } from "../models/videoCvScript.model";

export class VideoCvScriptService {
  private videoCvScriptRepository = new VideoCvScriptRepository();
  private videoCvScriptSectionRepository = new VideoCvScriptSectionRepository();

  public async createVideoCvScript(
    userId: string,
    data: {
      jobId: string;
      userReasons?: string;
      videoDuration: string;
      tips?: string[];
      sections: Array<{
        timestamp: string;
        section: string;
        script: string;
      }>;
    }
  ): Promise<ServiceResponse> {
    try {
      // Validate ObjectIds
      new Types.ObjectId(userId);
      new Types.ObjectId(data.jobId);

      // Check if script already exists for this user and job
      const existingScript = await this.videoCvScriptRepository.findOne({
        userId: userId as any,
        jobId: data.jobId as any,
      } as any);

      let videoCvScript;
      let scriptId: string;

      if (existingScript) {
        // Check if attempt is already 3
        const currentAttempt = (existingScript as any).attempt || 1;
        if (currentAttempt >= 3) {
          return {
            success: false,
            message: "Maximum attempt limit reached. You have already generated 3 scripts for this job.",
            data: null,
          };
        }

        // Increment attempt
        const newAttempt = currentAttempt + 1;

        // Update existing script
        const updatedScript = await this.videoCvScriptRepository.update(
          (existingScript as any)._id?.toString() || String(existingScript._id),
          {
            userReasons: data.userReasons || undefined,
            videoDuration: data.videoDuration,
            tips: data.tips || [],
            attempt: newAttempt,
          } as any
        );

        if (!updatedScript) {
          return {
            success: false,
            message: "Failed to update video CV script",
            data: null,
          };
        }

        videoCvScript = updatedScript;
        scriptId = (updatedScript as any)._id?.toString() || String(updatedScript._id);

        // Delete old sections
        await this.videoCvScriptSectionRepository.deleteMany({
          videoCvScriptId: scriptId,
        });
      } else {
        // Create new script document
        const scriptData: Partial<IVideoCvScript> = {
          userId: userId as any,
          jobId: data.jobId as any,
          userReasons: data.userReasons || undefined,
          videoDuration: data.videoDuration,
          tips: data.tips || [],
          attempt: 1,
        };

        videoCvScript = await this.videoCvScriptRepository.create(scriptData);
        scriptId = (videoCvScript as any)._id?.toString() || String(videoCvScript._id);
      }

      // Create new sections
      const sectionsData = data.sections.map((section, index) => ({
        videoCvScriptId: new Types.ObjectId(scriptId) as any,
        timestamp: section.timestamp,
        section: section.section,
        script: section.script,
        order: index,
      }));

      await this.videoCvScriptSectionRepository.createMany(sectionsData);

      // Get sections to return
      const sections = await this.videoCvScriptSectionRepository.findByVideoCvScriptId(scriptId);

      return {
        success: true,
        message: existingScript 
          ? `Video CV script updated successfully (Attempt ${(videoCvScript as any).attempt})`
          : "Video CV script created successfully",
        data: {
          ...videoCvScript.toObject(),
          sections: sections,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to create video CV script",
        data: null,
      };
    }
  }

  public async getVideoCvScriptByUserAndJob(
    userId: string,
    jobId: string
  ): Promise<ServiceResponse> {
    try {
      // Validate ObjectIds
      new Types.ObjectId(userId);
      new Types.ObjectId(jobId);

      const videoCvScript = await this.videoCvScriptRepository.findOne({
        userId: userId as any,
        jobId: jobId as any,
      } as any);

      if (!videoCvScript) {
        return {
          success: false,
          message: "Video CV script not found",
          data: null,
        };
      }

      const scriptId = (videoCvScript as any)._id?.toString() || String(videoCvScript._id);
      const sections = await this.videoCvScriptSectionRepository.findByVideoCvScriptId(scriptId);

      return {
        success: true,
        message: "Video CV script fetched successfully",
        data: {
          ...videoCvScript.toObject(),
          sections: sections,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to fetch video CV script",
        data: null,
      };
    }
  }
}

