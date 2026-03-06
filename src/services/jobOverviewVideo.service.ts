import { JobOverviewVideoRepository } from "../repositories/jobOverviewVideo.repository";
import { ServiceResponse } from "./types";
import { createChildLogger } from "../utils/logger";

const log = createChildLogger("JobOverviewVideoService");


const YOUTUBE_URL_PATTERN =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]+/i;

function isValidYouTubeUrl(url: string): boolean {
  try {
    if (!url || typeof url !== "string") return false;
    const trimmed = url.trim();
    if (trimmed.length > 500) return false;
    return YOUTUBE_URL_PATTERN.test(trimmed);
  } catch {
    return false;
  }
}

export class JobOverviewVideoService {
  private jobOverviewVideoRepository = new JobOverviewVideoRepository();

  public async getByOrganizationId(
    organizationId: string
  ): Promise<ServiceResponse> {
    if (!organizationId) {
      return {
        success: false,
        message: "organizationId is required",
        data: null,
      };
    }
    const videos =
      await this.jobOverviewVideoRepository.findByOrganizationId(organizationId);
    return {
      success: true,
      message: "Job overview videos fetched successfully",
      data: videos,
    };
  }

  public async getByJobId(
    jobId: string,
    organizationId: string
  ): Promise<ServiceResponse> {
    if (!jobId || !organizationId) {
      return {
        success: false,
        message: "jobId and organizationId are required",
        data: null,
      };
    }
    const video =
      await this.jobOverviewVideoRepository.findOneByJobId(organizationId, jobId);
    return {
      success: true,
      message: video ? "Job overview video found" : "No overview video for this job",
      data: video,
    };
  }

  public async deleteByJobId(
    organizationId: string,
    jobId: string
  ): Promise<ServiceResponse> {
    if (!organizationId || !jobId) {
      return {
        success: false,
        message: "organizationId and jobId are required",
        data: null,
      };
    }
    const deletedCount = await this.jobOverviewVideoRepository.deleteByJobId(
      organizationId,
      jobId
    );
    return {
      success: true,
      message:
        deletedCount > 0
          ? "Job overview video deleted successfully"
          : "No video found for this job",
      data: { deletedCount },
    };
  }

  public async create(payload: {
    organizationId: string;
    jobId: string;
    title: string;
    videoUrl: string;
    description?: string;
    createdBy?: string;
  }): Promise<ServiceResponse> {
    const { organizationId, jobId, title, videoUrl, description, createdBy } =
      payload;
    if (!organizationId || !jobId || !title || !videoUrl) {
      return {
        success: false,
        message: "organizationId, jobId, title, and videoUrl are required",
        data: null,
      };
    }
    const trimmedUrl = videoUrl.trim();
    if (!isValidYouTubeUrl(trimmedUrl)) {
      return {
        success: false,
        message: "Please provide a valid YouTube video URL",
        data: null,
      };
    }
    try {
      // One job overview video per job: remove any existing for this job
      await this.jobOverviewVideoRepository.deleteByJobId(organizationId, jobId);

      const doc = await this.jobOverviewVideoRepository.create({
        organizationId: organizationId as any,
        jobId: jobId as any,
        title,
        videoUrl: trimmedUrl,
        ...(description && { description }),
        ...(createdBy && { createdBy: createdBy as any }),
      });
      return {
        success: true,
        message: "Job overview video created successfully",
        data: doc,
      };
    } catch (err) {
      log.error({ err: err }, "Job overview video create error:");
      return {
        success: false,
        message:
          err instanceof Error
            ? err.message
            : "Failed to create job overview video",
        data: null,
      };
    }
  }
}
