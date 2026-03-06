import { JobRepository } from "../repositories/job.repository";
import { JobOverviewVideoRepository } from "../repositories/jobOverviewVideo.repository";
import { CompanyService } from "./company.service";
import { Messages } from "../constants/messages";
import { ServiceResponse } from "./types";
import { IJob } from "../models/job.model";
import { formatJobsOutput } from "../views/job.view";
import { NotificationBatchingService } from "./notificationBatching.service";
import { createChildLogger } from "../utils/logger";

const log = createChildLogger("JobService");


export class JobService {
  private jobRepository = new JobRepository();
  private jobOverviewVideoRepository = new JobOverviewVideoRepository();
  private companyService = new CompanyService();
  private notificationBatchingService = new NotificationBatchingService();

  public async createJob(data: any): Promise<ServiceResponse> {
    // Ensure departmentIds is populated if only legacy field provided (though unlikely now)
    if (data.departmentId && (!data.departmentIds || data.departmentIds.length === 0)) {
      data.departmentIds = [data.departmentId];
    }
    // Clean up legacy field
    delete data.departmentId;

    // Handle Company logic
    if (data.companyName) {
      const company = await this.companyService.findOrCreateCompany(
        data.companyName
      );
      data.companyId = company._id;
    }

    const newJob = await this.jobRepository.create(data);
    // Populate company for immediate return if needed, though usually create returns raw
    const populatedJob = await this.jobRepository.findById(String(newJob._id)); 
    
    // Queue FCM notifications for students in the job's departments (non-blocking).
    // Only students receive "New Job Posted"; admins do not see it in their notification feed.
    if (data.departmentIds && data.departmentIds.length > 0 && data.organizationId) {
      this.notificationBatchingService
        .queueJobNotification(
          String(newJob._id),
          data.name || "New Job",
          data.companyName || "Company",
          data.departmentIds.map((id: any) => String(id)),
          String(data.organizationId)
        )
        .catch((error) => {
          log.error({ err: error }, "Error queueing job notifications:");
          // Don't fail job creation if notification queuing fails
        });
    }

    return {
      success: true,
      message: Messages.JOB_CREATED_SUCCESS,
      data: populatedJob || newJob,
    };
  }

  public async getJobsByOrganization(
    organizationId: string,
    departmentId?: string,
    companyId?: string,
    companyName?: string,
    page?: number,
    limit?: number,
    statusFilter?: string,
    sortBy?: string
  ): Promise<ServiceResponse> {
    const result = await this.jobRepository.findByOrganizationWithFilters(
      organizationId,
        departmentId,
      companyId,
      companyName,
      page,
      limit,
      statusFilter,
      sortBy
      );
    
    return {
      success: true,
      message: Messages.JOB_FETCH_SUCCESS,
      data: {
        jobs: formatJobsOutput(result.jobs),
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages
        }
      },
    };
  }

  public async getJobById(jobId: string): Promise<ServiceResponse> {
    const job = await this.jobRepository.findById(jobId);
    if (!job) {
      return {
        success: false,
        message: Messages.JOB_NOT_FOUND,
        data: null,
      };
    }
    
    return {
      success: true,
      message: Messages.JOB_FETCH_SUCCESS,
      data: job,
    };
  }

  public async getJobsByDepartment(
    organizationId: string,
    departmentId: string
  ): Promise<ServiceResponse> {
    const jobs = await this.jobRepository.findByDepartmentAndOrganization(
      departmentId,
      organizationId
    );
    return {
      success: true,
      message: Messages.JOB_FETCH_SUCCESS,
      data: formatJobsOutput(jobs),
    };
  }

  public async getLatestJobsByOrganization(
    organizationId: string,
    limit: number = 5
  ): Promise<ServiceResponse> {
    const jobs = await this.jobRepository.findLatestJobsByOrganization(
      organizationId,
      limit
    );
    return {
      success: true,
      message: Messages.JOB_FETCH_SUCCESS,
      data: formatJobsOutput(jobs),
    };
  }

  public async getJobCountByOrganization(
    organizationId: string,
    departmentId?: string
  ): Promise<ServiceResponse> {
    let count;
    
    if (departmentId) {
      count = await this.jobRepository.countByDepartmentAndOrganization(
        departmentId,
        organizationId
      );
    } else {
      count = await this.jobRepository.countByOrganization(organizationId);
    }
    
    return {
      success: true,
      message: Messages.JOB_FETCH_SUCCESS,
      data: { count },
    };
  }

  public async getLatestJobsByDepartmentAndOrganization(
    organizationId: string,
    departmentId: string,
    limit: number = 3
  ): Promise<ServiceResponse> {
    const jobs = await this.jobRepository.findLatestJobsByDepartmentAndOrganization(
      departmentId,
      organizationId,
      limit
    );
    return {
      success: true,
      message: Messages.JOB_FETCH_SUCCESS,
      data: formatJobsOutput(jobs),
    };
  }

  public async getJobsByCompany(
    organizationId: string,
    companyId: string,
    departmentId?: string
  ): Promise<ServiceResponse> {
    let jobs;
    
    if (departmentId) {
      // Filter by both company and department
      const allCompanyJobs = await this.jobRepository.findByCompanyAndOrganization(
        companyId,
        organizationId
      );
      jobs = allCompanyJobs.filter(job => 
        job.departmentIds.some(deptId => String(deptId) === departmentId)
      );
    } else {
      jobs = await this.jobRepository.findByCompanyAndOrganization(
        companyId,
        organizationId
      );
    }
    
    return {
      success: true,
      message: Messages.JOB_FETCH_SUCCESS,
      data: formatJobsOutput(jobs),
    };
  }

  public async updateJobStatus(
    jobId: string,
    isActive: boolean
  ): Promise<ServiceResponse> {
    const job = await this.jobRepository.findById(jobId);
    if (!job) {
      return {
        success: false,
        message: Messages.JOB_NOT_FOUND,
        data: null,
      };
    }

    const updatedJob = await this.jobRepository.update(jobId, { isActive });
    if (!updatedJob) {
      return {
        success: false,
        message: "Failed to update job status",
        data: null,
      };
    }

    // Populate companyId before returning
    const populatedJob = await this.jobRepository.findById(String(updatedJob._id));

    return {
      success: true,
      message: `Job ${isActive ? "activated" : "deactivated"} successfully`,
      data: populatedJob || updatedJob,
    };
  }

  public async updateJob(jobId: string, data: any): Promise<ServiceResponse> {
    // Check if job exists
    const existingJob = await this.jobRepository.findById(jobId);
    if (!existingJob) {
      return {
        success: false,
        message: Messages.JOB_NOT_FOUND,
        data: null,
      };
    }

    // Ensure departmentIds is populated if only legacy field provided
    if (data.departmentId && (!data.departmentIds || data.departmentIds.length === 0)) {
      data.departmentIds = [data.departmentId];
    }
    // Clean up legacy field
    delete data.departmentId;

    // Handle Company logic - find or create company if companyName is provided
    if (data.companyName) {
      const company = await this.companyService.findOrCreateCompany(
        data.companyName
      );
      data.companyId = company._id;
    }

    // Update the job
    const updatedJob = await this.jobRepository.update(jobId, data);
    if (!updatedJob) {
      return {
        success: false,
        message: "Failed to update job",
        data: null,
      };
    }

    // Populate companyId before returning
    const populatedJob = await this.jobRepository.findById(String(updatedJob._id));

    return {
      success: true,
      message: Messages.JOB_UPDATED_SUCCESS,
      data: populatedJob || updatedJob,
    };
  }

  public async getJobsWithoutOverviewVideo(organizationId: string): Promise<ServiceResponse> {
    if (!organizationId) {
      return {
        success: false,
        message: "organizationId is required",
        data: null,
      };
    }
    const [allJobs, jobIdsWithOverview] = await Promise.all([
      this.jobRepository.findByOrganizationId(organizationId),
      this.jobOverviewVideoRepository.findJobIdsWithOverview(organizationId),
    ]);
    const withOverviewSet = new Set(
      jobIdsWithOverview.map((id) => id.toString())
    );
    const filtered = allJobs.filter(
      (j) => !withOverviewSet.has(String((j as any)._id))
    );
    return {
      success: true,
      message: Messages.JOB_FETCH_SUCCESS,
      data: formatJobsOutput(filtered),
    };
  }
}
