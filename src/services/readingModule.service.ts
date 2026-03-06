import { Types } from "mongoose";
import { ReadingModuleRepository } from "../repositories/readingModule.repository";
import { ServiceResponse } from "./types";
import { Messages } from "../constants/messages";
import { IReadingModule } from "../models/readingModule.model";
import { createChildLogger } from "../utils/logger";

const log = createChildLogger("ReadingModuleService");


export class ReadingModuleService {
  private readingModuleRepository = new ReadingModuleRepository();

  public async createReadingModule(
    data: {
      jobId: string;
      skillId: string;
      skillName: string;
      jobContext: string;
      introduction: string;
      keyConcepts: Array<{ title: string; content: string }>;
      practicalExample?: string;
      summary: string[];
    }
  ): Promise<ServiceResponse> {
    // Validate required fields
    if (!data.jobId || !data.skillId) {
      return {
        success: false,
        message: "jobId and skillId are required",
        data: null,
      };
    }
    
    if (!data.skillName || !data.jobContext || !data.introduction) {
      return {
        success: false,
        message: "skillName, jobContext, and introduction are required",
        data: null,
      };
    }
    
    if (!Array.isArray(data.keyConcepts) || data.keyConcepts.length === 0) {
      return {
        success: false,
        message: "keyConcepts must be a non-empty array",
        data: null,
      };
    }
    
    // Validate each keyConcept has title and content
    for (const concept of data.keyConcepts) {
      if (!concept.title || !concept.content) {
        return {
          success: false,
          message: "Each keyConcept must have both title and content",
          data: null,
        };
      }
    }
    
    if (!Array.isArray(data.summary) || data.summary.length === 0) {
      return {
        success: false,
        message: "summary must be a non-empty array of strings",
        data: null,
      };
    }
    
    // Validate ObjectId format
    if (!Types.ObjectId.isValid(data.jobId) || !Types.ObjectId.isValid(data.skillId)) {
      return {
        success: false,
        message: "Invalid jobId or skillId format",
        data: null,
      };
    }

    try {
      // Check if reading module already exists for this job and skill
      const existingModule = await this.readingModuleRepository.findByJobIdAndSkillId(
        data.jobId,
        data.skillId
      );

      if (existingModule) {
        return {
          success: false,
          message: "Reading module already exists for this job and skill",
          data: existingModule,
        };
      }

      const readingModule = await this.readingModuleRepository.create({
        jobId: new Types.ObjectId(data.jobId) as any,
        skillId: new Types.ObjectId(data.skillId) as any,
        skillName: data.skillName,
        jobContext: data.jobContext,
        introduction: data.introduction,
        keyConcepts: data.keyConcepts,
        practicalExample: data.practicalExample,
        summary: data.summary,
        moduleType: "skill-module",
      } as Partial<IReadingModule>);

      return {
        success: true,
        message: Messages.READING_MODULE_CREATED_SUCCESS || "Reading module created successfully",
        data: readingModule,
      };
    } catch (error: any) {
      log.error({ err: error }, "Error creating reading module:");
      
      // Handle Mongoose validation errors
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors || {}).map((err: any) => err.message);
        return {
          success: false,
          message: `Validation error: ${validationErrors.join(', ')}`,
          data: null,
        };
      }
      
      // Handle duplicate key errors
      if (error.code === 11000) {
        return {
          success: false,
          message: "Reading module already exists for this job and skill",
          data: null,
        };
      }
      
      return {
        success: false,
        message: error.message || "Failed to create reading module",
        data: null,
      };
    }
  }

  /**
   * Create a job brief readable module (AI-generated e-book style content)
   */
  public async createJobBrief(
    data: {
      jobId: string;
      organizationId: string;
      title: string;
      sections: Array<{ heading: string; icon: string; content: string }>;
      metadata?: {
        wordCount?: number;
        readingTimeMinutes?: number;
        targetAudience?: string;
      };
    }
  ): Promise<ServiceResponse> {
    if (!data.jobId || !data.organizationId) {
      return {
        success: false,
        message: "jobId and organizationId are required",
        data: null,
      };
    }

    if (!Types.ObjectId.isValid(data.jobId) || !Types.ObjectId.isValid(data.organizationId)) {
      return {
        success: false,
        message: "Invalid jobId or organizationId format",
        data: null,
      };
    }

    if (!data.title || !data.sections || data.sections.length === 0) {
      return {
        success: false,
        message: "title and sections are required",
        data: null,
      };
    }

    try {
      // Check if a job brief already exists for this job
      const existing = await this.readingModuleRepository.findJobBriefByJobId(data.jobId);

      if (existing) {
        // Update the existing one instead of creating a duplicate
        const updated = await this.readingModuleRepository.update(existing._id as string, {
          title: data.title,
          sections: data.sections,
          metadata: data.metadata,
        } as Partial<IReadingModule>);
        return {
          success: true,
          message: "Job brief updated successfully",
          data: updated,
        };
      }

      const readingModule = await this.readingModuleRepository.create({
        jobId: new Types.ObjectId(data.jobId) as any,
        organizationId: new Types.ObjectId(data.organizationId) as any,
        moduleType: "job-brief",
        title: data.title,
        sections: data.sections,
        metadata: data.metadata,
      } as Partial<IReadingModule>);

      return {
        success: true,
        message: "Job brief created successfully",
        data: readingModule,
      };
    } catch (error: any) {
      log.error({ err: error }, "Error creating job brief:");
      return {
        success: false,
        message: error.message || "Failed to create job brief",
        data: null,
      };
    }
  }

  /**
   * Get all job briefs for an organization, optionally filtered by job
   */
  public async getJobBriefs(
    organizationId: string,
    jobId?: string
  ): Promise<ServiceResponse> {
    if (!organizationId) {
      return {
        success: false,
        message: "organizationId is required",
        data: null,
      };
    }

    if (!Types.ObjectId.isValid(organizationId)) {
      return {
        success: false,
        message: "Invalid organizationId format",
        data: null,
      };
    }

    try {
      const modules = await this.readingModuleRepository.findJobBriefsByOrganization(
        organizationId,
        jobId
      );
      return {
        success: true,
        message: "Job briefs fetched successfully",
        data: modules,
      };
    } catch (error: any) {
      log.error({ err: error }, "Error fetching job briefs:");
      return {
        success: false,
        message: error.message || "Failed to fetch job briefs",
        data: null,
      };
    }
  }

  /**
   * Delete a job brief by ID
   */
  public async deleteJobBrief(id: string): Promise<ServiceResponse> {
    if (!id || !Types.ObjectId.isValid(id)) {
      return {
        success: false,
        message: "Valid module ID is required",
        data: null,
      };
    }

    try {
      const deleted = await this.readingModuleRepository.delete(id);
      if (!deleted) {
        return {
          success: false,
          message: "Job brief not found",
          data: null,
        };
      }
      return {
        success: true,
        message: "Job brief deleted successfully",
        data: deleted,
      };
    } catch (error: any) {
      log.error({ err: error }, "Error deleting job brief:");
      return {
        success: false,
        message: error.message || "Failed to delete job brief",
        data: null,
      };
    }
  }

  public async getReadingModuleByJobAndSkill(
    jobId: string,
    skillId: string
  ): Promise<ServiceResponse> {
    log.info({ data: skillId }, "Fetching reading module with jobId:", jobId, "skillId:");
    
    if (!jobId || !skillId) {
      log.error("Missing jobId or skillId");
      return {
        success: false,
        message: "jobId and skillId are required",
        data: null,
      };
    }

    // Validate ObjectId format
    if (!Types.ObjectId.isValid(jobId) || !Types.ObjectId.isValid(skillId)) {
      log.error({ err: skillId }, "Invalid ObjectId format - jobId:", jobId, "skillId:");
      return {
        success: false,
        message: "Invalid jobId or skillId format",
        data: null,
      };
    }

    try {
      const readingModule = await this.readingModuleRepository.findByJobIdAndSkillId(jobId, skillId);

      if (!readingModule) {
        log.info({ data: skillId }, "Reading module not found for jobId:", jobId, "skillId:");
        return {
          success: true,
          message: "Reading module not found",
          data: null,
        };
      }

      log.info("Reading module found successfully");
      return {
        success: true,
        message: Messages.READING_MODULE_FETCH_SUCCESS || "Reading module fetched successfully",
        data: readingModule,
      };
    } catch (error) {
      log.error({ err: error }, "Error fetching reading module:");
      return {
        success: false,
        message: "Failed to fetch reading module",
        data: null,
      };
    }
  }
}

