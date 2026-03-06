import { JobApplicationRepository } from "../repositories/jobApplication.repository";
import { ServiceResponse } from "./types";
import { Types } from "mongoose";
import { IJobApplication } from "../models/jobApplication.model";

export class JobApplicationService {
  private jobApplicationRepository = new JobApplicationRepository();

  public async createJobApplication(
    userId: string,
    jobId: string,
    organizationId: string
  ): Promise<ServiceResponse> {
    try {
      // Validate ObjectIds
      new Types.ObjectId(userId);
      new Types.ObjectId(jobId);
      new Types.ObjectId(organizationId);

      // Check if application already exists
      const existingApplication = await this.jobApplicationRepository.findOne({
        userId: userId as any,
        jobId: jobId as any,
      } as any);

      if (existingApplication) {
        return {
          success: false,
          message: "You have already applied for this job.",
          data: null,
        };
      }

      // Create new application
      const applicationData: Partial<IJobApplication> = {
        userId: userId as any,
        jobId: jobId as any,
        organizationId: organizationId as any,
        status: "submitted",
      };

      const jobApplication = await this.jobApplicationRepository.create(applicationData);

      return {
        success: true,
        message: "Job application submitted successfully",
        data: jobApplication.toObject(),
      };
    } catch (error: any) {
      // Handle duplicate key error (unique index violation)
      if (error.code === 11000) {
        return {
          success: false,
          message: "You have already applied for this job.",
          data: null,
        };
      }

      return {
        success: false,
        message: error.message || "Failed to submit job application",
        data: null,
      };
    }
  }

  public async checkJobApplication(
    userId: string,
    jobId: string
  ): Promise<ServiceResponse> {
    try {
      // Validate ObjectIds
      new Types.ObjectId(userId);
      new Types.ObjectId(jobId);

      const application = await this.jobApplicationRepository.findOne({
        userId: userId as any,
        jobId: jobId as any,
      } as any);

      return {
        success: true,
        message: application ? "Application found" : "No application found",
        data: application ? { exists: true, application: application.toObject() } : { exists: false },
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to check job application",
        data: null,
      };
    }
  }

  public async getJobApplicationsByUserId(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ServiceResponse> {
    try {
      // Validate ObjectId
      new Types.ObjectId(userId);

      const { applications, total } = await this.jobApplicationRepository.findByUserIdWithPagination(
        userId as any,
        page,
        limit
      );

      const populatedApplications = applications.map((app) => app.toObject());
      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: "Job applications retrieved successfully",
        data: {
          applications: populatedApplications,
          pagination: {
            page,
            limit,
            total,
            totalPages,
          },
        },
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to retrieve job applications",
        data: null,
      };
    }
  }
}

