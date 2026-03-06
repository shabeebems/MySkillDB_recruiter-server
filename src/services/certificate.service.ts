import { Types } from "mongoose";
import { CertificateRepository } from "../repositories/certificate.repository";
import { ServiceResponse } from "./types";
import { Messages } from "../constants/messages";
import { ICertificate } from "../models/certificate.model";
import { createChildLogger } from "../utils/logger";

const log = createChildLogger("CertificateService");


export class CertificateService {
  private certificateRepository = new CertificateRepository();

  public async createCertificate(
    userId: string | undefined,
    data: {
      jobId: string;
      skillId: string;
      title: string;
      link: string;
      storageProvider: "google drive" | "dropbox";
    }
  ): Promise<ServiceResponse> {
    if (!userId || !data.jobId || !data.skillId || !data.title || !data.link || !data.storageProvider) {
      return {
        success: false,
        message: "userId, jobId, skillId, title, link, and storageProvider are required",
        data: null,
      };
    }

    try {
      // Create certificate
      const certificate = await this.certificateRepository.create({
        userId: new Types.ObjectId(userId) as any,
        jobId: new Types.ObjectId(data.jobId) as any,
        skillId: new Types.ObjectId(data.skillId) as any,
        title: data.title.trim(),
        link: data.link.trim(),
        storageProvider: data.storageProvider,
      } as Partial<ICertificate>);

      return {
        success: true,
        message: Messages.CERTIFICATE_CREATED_SUCCESS || "Certificate created successfully",
        data: certificate,
      };
    } catch (error) {
      log.error({ err: error }, "Error creating certificate:");
      return {
        success: false,
        message: "Failed to create certificate",
        data: null,
      };
    }
  }

  public async getCertificatesByStudentJobAndSkill(
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
      const certificates = await this.certificateRepository.findByUserAndJobAndSkill(
        userId,
        jobId,
        skillId
      );

      return {
        success: true,
        message: Messages.CERTIFICATE_FETCH_SUCCESS || "Certificates fetched successfully",
        data: certificates,
      };
    } catch (error) {
      log.error({ err: error }, "Error fetching certificates:");
      return {
        success: false,
        message: "Failed to fetch certificates",
        data: null,
      };
    }
  }

  public async getCertificatesByUserId(userId: string): Promise<ServiceResponse> {
    if (!userId) {
      return {
        success: false,
        message: "userId is required",
        data: null,
      };
    }

    try {
      const certificates = await this.certificateRepository.findByUserId(userId);
      return {
        success: true,
        message: Messages.CERTIFICATE_FETCH_SUCCESS || "Certificates fetched successfully",
        data: certificates,
      };
    } catch (error) {
      log.error({ err: error }, "Error fetching certificates by student:");
      return {
        success: false,
        message: "Failed to fetch certificates",
        data: null,
      };
    }
  }

  public async deleteCertificate(certificateId: string, userId: string | undefined): Promise<ServiceResponse> {
    if (!certificateId) {
      return {
        success: false,
        message: "certificateId is required",
        data: null,
      };
    }

    try {
      // Verify the certificate belongs to the user
      const certificate = await this.certificateRepository.findById(certificateId);
      if (!certificate) {
        return {
          success: false,
          message: "Certificate not found",
          data: null,
        };
      }

      // Check if user owns this certificate
      if (userId && String(certificate.userId) !== String(userId)) {
        return {
          success: false,
          message: "You don't have permission to delete this certificate",
          data: null,
        };
      }

      // Delete the certificate
      const deleted = await this.certificateRepository.delete(certificateId);
      if (!deleted) {
        return {
          success: false,
          message: "Failed to delete certificate",
          data: null,
        };
      }

      return {
        success: true,
        message: "Certificate deleted successfully",
        data: deleted,
      };
    } catch (error) {
      log.error({ err: error }, "Error deleting certificate:");
      return {
        success: false,
        message: "Failed to delete certificate",
        data: null,
      };
    }
  }
}

