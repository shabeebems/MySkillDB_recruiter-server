import { AdminVideoRepository } from "../repositories/adminVideo.repository";
import { ServiceResponse } from "./types";
import { IAdminVideo } from "../models/adminVideo.model";
import cloudinary from "../config/cloudinary";
import { createChildLogger } from "../utils/logger";

const log = createChildLogger("AdminVideoService");


export class AdminVideoService {
  private adminVideoRepository = new AdminVideoRepository();

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
      await this.adminVideoRepository.findByOrganizationId(organizationId);
    return {
      success: true,
      message: "Admin (content) videos fetched successfully",
      data: videos,
    };
  }

  public async create(payload: {
    organizationId: string;
    title: string;
    videoBase64: string;
    description?: string;
    createdBy?: string;
  }): Promise<ServiceResponse> {
    const { organizationId, title, videoBase64, description, createdBy } =
      payload;
    if (!organizationId || !title || !videoBase64) {
      return {
        success: false,
        message: "organizationId, title, and videoBase64 are required",
        data: null,
      };
    }
    try {
      const uploadResponse = await cloudinary.uploader.upload(videoBase64, {
        folder: "admin_videos",
        resource_type: "video",
      });
      const videoUrl = uploadResponse.secure_url;
      const doc = await this.adminVideoRepository.create({
        organizationId: organizationId as unknown as IAdminVideo["organizationId"],
        title,
        videoUrl,
        ...(description && { description }),
        ...(createdBy && { createdBy: createdBy as unknown as IAdminVideo["createdBy"] }),
      });
      return {
        success: true,
        message: "Admin video created successfully",
        data: doc,
      };
    } catch (err) {
      log.error({ err: err }, "Admin video create/upload error:");
      return {
        success: false,
        message:
          err instanceof Error ? err.message : "Failed to create admin video",
        data: null,
      };
    }
  }
}
