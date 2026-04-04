import { JobRepository } from "../repositories/job.repository";
import type { JobListVisibilityContext } from "../repositories/job.repository";
import { JobOverviewVideoRepository } from "../repositories/jobOverviewVideo.repository";
import { CompanyService } from "./company.service";
import { Messages } from "../constants/messages";
import { ServiceResponse } from "./types";
import { IJob } from "../models/job.model";
import { formatJobsOutput } from "../views/job.view";
import { NotificationBatchingService } from "./notificationBatching.service";
import { createChildLogger } from "../utils/logger";
import { Types } from "mongoose";

const log = createChildLogger("JobService");

/** Authenticated user from token middleware */
export type JobRequestUser = {
  _id: Types.ObjectId | string;
  role: string;
  organizationId?: Types.ObjectId | string | null;
  departmentId?: Types.ObjectId | string | null;
};

function toListVisibility(
  user?: JobRequestUser
): JobListVisibilityContext | undefined {
  if (!user) return undefined;
  if (user.role === "student") {
    return { role: "student", userId: String(user._id) };
  }
  if (user.role === "hod") {
    return {
      role: "hod",
      departmentId: user.departmentId ? String(user.departmentId) : undefined,
    };
  }
  if (user.role === "org_admin" || user.role === "master_admin") {
    return { role: user.role };
  }
  return undefined;
}

/** Admins must not load or mutate student-created (private) jobs */
function assertAdminCannotSeeStudentPrivateJob(
  job: IJob,
  user?: JobRequestUser
): ServiceResponse | null {
  if (!job.createdByStudentId || !user) return null;
  if (
    user.role === "org_admin" ||
    user.role === "master_admin" ||
    user.role === "hod"
  ) {
    return {
      success: false,
      message: Messages.JOB_NOT_FOUND,
      data: null,
      statusCode: 404,
    };
  }
  return null;
}

function assertStudentOwnsPrivateJob(job: IJob, user?: JobRequestUser): ServiceResponse | null {
  if (!user || user.role !== "student") return null;
  const owner = job.createdByStudentId
    ? String(job.createdByStudentId)
    : null;
  if (!owner || owner !== String(user._id)) {
    return {
      success: false,
      message: Messages.JOB_ACCESS_DENIED,
      data: null,
      statusCode: 403,
    };
  }
  return null;
}

function assertStudentCannotEditOrgJob(job: IJob, user?: JobRequestUser): ServiceResponse | null {
  if (!user || user.role !== "student") return null;
  if (!job.createdByStudentId) {
    return {
      success: false,
      message: Messages.JOB_ACCESS_DENIED,
      data: null,
      statusCode: 403,
    };
  }
  return assertStudentOwnsPrivateJob(job, user);
}

function isMasterAdmin(user?: JobRequestUser): boolean {
  return user?.role === "master_admin";
}

/** Tenant scoping: non–master_admin callers must match the given organization id. */
function assertUserCanAccessOrganization(
  user: JobRequestUser | undefined,
  organizationId: string
): ServiceResponse | null {
  if (!user) {
    return {
      success: false,
      message: Messages.ORGANIZATION_ACCESS_DENIED,
      data: null,
      statusCode: 403,
    };
  }
  if (isMasterAdmin(user)) return null;
  if (!user.organizationId) {
    return {
      success: false,
      message: Messages.ORGANIZATION_ACCESS_DENIED,
      data: null,
      statusCode: 403,
    };
  }
  if (String(user.organizationId) !== String(organizationId)) {
    return {
      success: false,
      message: Messages.ORGANIZATION_ACCESS_DENIED,
      data: null,
      statusCode: 403,
    };
  }
  return null;
}

/** Job must belong to the caller's organization (master_admin bypass). */
function assertJobInCallerOrganization(
  job: IJob,
  user?: JobRequestUser
): ServiceResponse | null {
  if (!user) {
    return {
      success: false,
      message: Messages.JOB_ACCESS_DENIED,
      data: null,
      statusCode: 403,
    };
  }
  if (isMasterAdmin(user)) return null;
  if (!user.organizationId) {
    return {
      success: false,
      message: Messages.JOB_ACCESS_DENIED,
      data: null,
      statusCode: 403,
    };
  }
  if (String(job.organizationId) !== String(user.organizationId)) {
    return {
      success: false,
      message: Messages.JOB_ACCESS_DENIED,
      data: null,
      statusCode: 403,
    };
  }
  return null;
}

/** HOD may only access jobs that include their department (master_admin bypass via caller). */
function assertHodJobDepartmentScope(job: IJob, user?: JobRequestUser): ServiceResponse | null {
  if (!user || user.role !== "hod" || !user.departmentId) return null;
  const hid = String(user.departmentId);
  const ok = job.departmentIds?.some((d) => String(d) === hid);
  if (!ok) {
    return {
      success: false,
      message: Messages.JOB_ACCESS_DENIED,
      data: null,
      statusCode: 403,
    };
  }
  return null;
}

export class JobService {
  private jobRepository = new JobRepository();
  private jobOverviewVideoRepository = new JobOverviewVideoRepository();
  private companyService = new CompanyService();
  private notificationBatchingService = new NotificationBatchingService();

  public async createJob(
    data: any,
    user?: JobRequestUser
  ): Promise<ServiceResponse> {
    delete data.createdByStudentId;

    if (data.departmentId && (!data.departmentIds || data.departmentIds.length === 0)) {
      data.departmentIds = [data.departmentId];
    }
    delete data.departmentId;

    if (user?.role === "student") {
      data.createdByStudentId = new Types.ObjectId(String(user._id));
      if (user.organizationId) {
        data.organizationId = String(user.organizationId);
      }
      if (user.departmentId) {
        data.departmentIds = [String(user.departmentId)];
      }
    } else if (user && !isMasterAdmin(user)) {
      if (!user.organizationId) {
        return {
          success: false,
          message: Messages.ORGANIZATION_ACCESS_DENIED,
          data: null,
          statusCode: 403,
        };
      }
      data.organizationId = String(user.organizationId);
      if (user.role === "hod" && user.departmentId) {
        data.departmentIds = [String(user.departmentId)];
      }
    }

    if (data.companyName) {
      const company = await this.companyService.findOrCreateCompany(
        data.companyName
      );
      data.companyId = company._id;
    }

    const newJob = await this.jobRepository.create(data);
    const populatedJob = await this.jobRepository.findById(String(newJob._id));

    const isPrivateStudentJob = !!data.createdByStudentId;
    if (
      !isPrivateStudentJob &&
      data.departmentIds &&
      data.departmentIds.length > 0 &&
      data.organizationId
    ) {
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
    sortBy?: string,
    user?: JobRequestUser
  ): Promise<ServiceResponse> {
    const orgDenied = assertUserCanAccessOrganization(user, organizationId);
    if (orgDenied) return orgDenied;

    const result = await this.jobRepository.findByOrganizationWithFilters(
      organizationId,
      departmentId,
      companyId,
      companyName,
      page,
      limit,
      statusFilter,
      sortBy,
      toListVisibility(user)
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
          totalPages: result.totalPages,
        },
      },
    };
  }

  public async getJobById(
    jobId: string,
    user?: JobRequestUser
  ): Promise<ServiceResponse> {
    const job = await this.jobRepository.findById(jobId);
    if (!job) {
      return {
        success: false,
        message: Messages.JOB_NOT_FOUND,
        data: null,
      };
    }

    const orgJob = assertJobInCallerOrganization(job, user);
    if (orgJob) return orgJob;

    const hodDept = assertHodJobDepartmentScope(job, user);
    if (hodDept) return hodDept;

    if (user?.role === "student" && job.createdByStudentId) {
      if (String(job.createdByStudentId) !== String(user._id)) {
        return {
          success: false,
          message: Messages.JOB_ACCESS_DENIED,
          data: null,
          statusCode: 403,
        };
      }
    }

    const adminHidden = assertAdminCannotSeeStudentPrivateJob(job, user);
    if (adminHidden) return adminHidden;

    return {
      success: true,
      message: Messages.JOB_FETCH_SUCCESS,
      data: job,
    };
  }

  public async getJobsByDepartment(
    organizationId: string,
    departmentId: string,
    user?: JobRequestUser
  ): Promise<ServiceResponse> {
    const orgDenied = assertUserCanAccessOrganization(user, organizationId);
    if (orgDenied) return orgDenied;

    const jobs = await this.jobRepository.findByDepartmentAndOrganization(
      departmentId,
      organizationId,
      toListVisibility(user)
    );
    return {
      success: true,
      message: Messages.JOB_FETCH_SUCCESS,
      data: formatJobsOutput(jobs),
    };
  }

  public async getLatestJobsByOrganization(
    organizationId: string,
    limit: number = 5,
    user?: JobRequestUser
  ): Promise<ServiceResponse> {
    const orgDenied = assertUserCanAccessOrganization(user, organizationId);
    if (orgDenied) return orgDenied;

    const jobs = await this.jobRepository.findLatestJobsByOrganization(
      organizationId,
      limit,
      toListVisibility(user)
    );
    return {
      success: true,
      message: Messages.JOB_FETCH_SUCCESS,
      data: formatJobsOutput(jobs),
    };
  }

  public async getJobCountByOrganization(
    organizationId: string,
    departmentId?: string,
    user?: JobRequestUser
  ): Promise<ServiceResponse> {
    const orgDenied = assertUserCanAccessOrganization(user, organizationId);
    if (orgDenied) return orgDenied;

    let count: number;

    if (departmentId) {
      count = await this.jobRepository.countByDepartmentAndOrganization(
        departmentId,
        organizationId,
        toListVisibility(user)
      );
    } else {
      count = await this.jobRepository.countByOrganization(
        organizationId,
        toListVisibility(user)
      );
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
    limit: number = 3,
    user?: JobRequestUser
  ): Promise<ServiceResponse> {
    const orgDenied = assertUserCanAccessOrganization(user, organizationId);
    if (orgDenied) return orgDenied;

    const jobs = await this.jobRepository.findLatestJobsByDepartmentAndOrganization(
      departmentId,
      organizationId,
      limit,
      toListVisibility(user)
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
    departmentId?: string,
    user?: JobRequestUser
  ): Promise<ServiceResponse> {
    const orgDenied = assertUserCanAccessOrganization(user, organizationId);
    if (orgDenied) return orgDenied;

    const vis = toListVisibility(user);
    let jobs;

    if (departmentId) {
      const allCompanyJobs = await this.jobRepository.findByCompanyAndOrganization(
        companyId,
        organizationId,
        vis
      );
      jobs = allCompanyJobs.filter((job) =>
        job.departmentIds.some((deptId) => String(deptId) === departmentId)
      );
    } else {
      jobs = await this.jobRepository.findByCompanyAndOrganization(
        companyId,
        organizationId,
        vis
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
    isActive: boolean,
    user?: JobRequestUser
  ): Promise<ServiceResponse> {
    const job = await this.jobRepository.findById(jobId);
    if (!job) {
      return {
        success: false,
        message: Messages.JOB_NOT_FOUND,
        data: null,
      };
    }

    const denied = assertStudentCannotEditOrgJob(job, user);
    if (denied) return denied;

    const adminPriv = assertAdminCannotSeeStudentPrivateJob(job, user);
    if (adminPriv) return adminPriv;

    const orgJob = assertJobInCallerOrganization(job, user);
    if (orgJob) return orgJob;

    const hodDept = assertHodJobDepartmentScope(job, user);
    if (hodDept) return hodDept;

    const updatedJob = await this.jobRepository.update(jobId, { isActive });
    if (!updatedJob) {
      return {
        success: false,
        message: "Failed to update job status",
        data: null,
      };
    }

    const populatedJob = await this.jobRepository.findById(String(updatedJob._id));

    return {
      success: true,
      message: `Job ${isActive ? "activated" : "deactivated"} successfully`,
      data: populatedJob || updatedJob,
    };
  }

  public async updateJob(
    jobId: string,
    data: any,
    user?: JobRequestUser
  ): Promise<ServiceResponse> {
    delete data.createdByStudentId;

    const existingJob = await this.jobRepository.findById(jobId);
    if (!existingJob) {
      return {
        success: false,
        message: Messages.JOB_NOT_FOUND,
        data: null,
      };
    }

    const denied = assertStudentCannotEditOrgJob(existingJob, user);
    if (denied) return denied;

    const adminPriv = assertAdminCannotSeeStudentPrivateJob(existingJob, user);
    if (adminPriv) return adminPriv;

    const orgJob = assertJobInCallerOrganization(existingJob, user);
    if (orgJob) return orgJob;

    const hodDept = assertHodJobDepartmentScope(existingJob, user);
    if (hodDept) return hodDept;

    if (!isMasterAdmin(user)) {
      delete data.organizationId;
    }

    if (data.departmentId && (!data.departmentIds || data.departmentIds.length === 0)) {
      data.departmentIds = [data.departmentId];
    }
    delete data.departmentId;

    if (user?.role === "student") {
      if (user.organizationId) {
        data.organizationId = String(user.organizationId);
      }
      if (user.departmentId) {
        data.departmentIds = [String(user.departmentId)];
      }
    } else if (user?.role === "hod" && user.departmentId) {
      data.departmentIds = [String(user.departmentId)];
    }

    if (data.companyName) {
      const company = await this.companyService.findOrCreateCompany(
        data.companyName
      );
      data.companyId = company._id;
    }

    const updatedJob = await this.jobRepository.update(jobId, data);
    if (!updatedJob) {
      return {
        success: false,
        message: "Failed to update job",
        data: null,
      };
    }

    const populatedJob = await this.jobRepository.findById(String(updatedJob._id));

    return {
      success: true,
      message: Messages.JOB_UPDATED_SUCCESS,
      data: populatedJob || updatedJob,
    };
  }

  public async getJobsWithoutOverviewVideo(
    organizationId: string,
    user?: JobRequestUser
  ): Promise<ServiceResponse> {
    if (!organizationId) {
      return {
        success: false,
        message: "organizationId is required",
        data: null,
      };
    }
    const orgDenied = assertUserCanAccessOrganization(user, organizationId);
    if (orgDenied) return orgDenied;

    const [allJobs, jobIdsWithOverview] = await Promise.all([
      this.jobRepository.findByOrganizationId(
        organizationId,
        toListVisibility(user)
      ),
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
