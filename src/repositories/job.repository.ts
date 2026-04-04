import JobModel, { IJob } from "../models/job.model";
import { BaseRepository } from "./base.repository";
import mongoose from "mongoose";
import { escapeRegexLiteral, sanitizeSearchInput } from "../utils/regexEscape";

/** Student: org jobs + own private jobs. Admin/HOD: org-posted only; HOD may be scoped to one department. */
export type JobListVisibilityContext = {
  role: "student" | "org_admin" | "master_admin" | "hod";
  userId?: string;
  /** HOD: restrict lists to jobs that include this department */
  departmentId?: string;
};

function mergeJobListVisibility(
  filter: Record<string, unknown>,
  ctx?: JobListVisibilityContext
): Record<string, unknown> {
  if (!ctx) return filter;

  if (ctx.role === "student" && ctx.userId) {
    const uid = new mongoose.Types.ObjectId(ctx.userId);
    const vis = {
      $or: [
        { createdByStudentId: null },
        { createdByStudentId: uid },
      ],
    };
    return { $and: [filter, vis] };
  }

  if (ctx.role === "hod") {
    const parts: Record<string, unknown>[] = [
      filter,
      { createdByStudentId: null },
    ];
    if (ctx.departmentId) {
      parts.push({
        departmentIds: new mongoose.Types.ObjectId(ctx.departmentId),
      });
    }
    return { $and: parts };
  }

  if (ctx.role === "org_admin" || ctx.role === "master_admin") {
    return { $and: [filter, { createdByStudentId: null }] };
  }

  return filter;
}

export class JobRepository extends BaseRepository<IJob> {
  constructor() {
    super(JobModel);
  }

  async findByDepartmentAndOrganization(
    departmentId: string,
    organizationId: string,
    visibility?: JobListVisibilityContext
  ): Promise<IJob[]> {
    const base = {
      organizationId,
      departmentIds: departmentId,
    };
    const filter = mergeJobListVisibility(base, visibility);
    return this.model
      .find(filter)
      .populate("companyId")
      .exec();
  }

  async findByOrganizationId(
    organizationId: string,
    visibility?: JobListVisibilityContext
  ): Promise<IJob[]> {
    const filter = mergeJobListVisibility({ organizationId }, visibility);
    return this.model
      .find(filter)
      .populate("companyId")
      .exec();
  }

  async findByOrganizationWithFilters(
    organizationId: string,
    departmentId?: string,
    companyId?: string,
    companyName?: string,
    page?: number,
    limit?: number,
    statusFilter?: string,
    sortBy?: string,
    visibility?: JobListVisibilityContext
  ): Promise<{
    jobs: IJob[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const filter: Record<string, unknown> = { organizationId };

    if (departmentId) {
      filter.departmentIds = departmentId;
    }

    if (companyId) {
      filter.companyId = new mongoose.Types.ObjectId(companyId);
    } else if (companyName) {
      const safe = escapeRegexLiteral(sanitizeSearchInput(companyName));
      if (safe) {
        filter.$or = [
          { companyName: { $regex: safe, $options: "i" } },
          { "companyId.name": { $regex: safe, $options: "i" } },
        ];
      }
    }

    if (statusFilter === "active") {
      filter.isActive = { $ne: false };
    } else if (statusFilter === "inactive") {
      filter.isActive = false;
    }

    const mergedFilter = mergeJobListVisibility(filter, visibility);

    const pageNumber = page || 1;
    const pageSize = limit || 10;
    const skip = (pageNumber - 1) * pageSize;

    let sortOrder: Record<string, 1 | -1> = { createdAt: -1 };
    if (sortBy === "oldest") {
      sortOrder = { createdAt: 1 };
    } else if (sortBy === "company") {
      sortOrder = { companyName: 1 };
    } else if (sortBy === "name") {
      sortOrder = { name: 1 };
    }

    const [jobs, total] = await Promise.all([
      this.model
        .find(mergedFilter)
        .populate("companyId")
        .sort(sortOrder)
        .skip(skip)
        .limit(pageSize)
        .exec(),
      this.model.countDocuments(mergedFilter).exec(),
    ]);

    return {
      jobs,
      total,
      page: pageNumber,
      limit: pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findById(id: string): Promise<IJob | null> {
    return this.model.findById(id).populate("companyId").exec();
  }

  async findLatestJobsByOrganization(
    organizationId: string,
    limit: number = 5,
    visibility?: JobListVisibilityContext
  ): Promise<IJob[]> {
    const filter = mergeJobListVisibility({ organizationId }, visibility);
    return this.model
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("companyId")
      .exec();
  }

  async countByOrganization(
    organizationId: string,
    visibility?: JobListVisibilityContext
  ): Promise<number> {
    const filter = mergeJobListVisibility({ organizationId }, visibility);
    return this.model.countDocuments(filter).exec();
  }

  async countByDepartmentAndOrganization(
    departmentId: string,
    organizationId: string,
    visibility?: JobListVisibilityContext
  ): Promise<number> {
    const base = {
      organizationId,
      departmentIds: departmentId,
    };
    const filter = mergeJobListVisibility(base, visibility);
    return this.model.countDocuments(filter).exec();
  }

  async findLatestJobsByDepartmentAndOrganization(
    departmentId: string,
    organizationId: string,
    limit: number = 3,
    visibility?: JobListVisibilityContext
  ): Promise<IJob[]> {
    const base = {
      organizationId,
      departmentIds: departmentId,
    };
    const filter = mergeJobListVisibility(base, visibility);
    return this.model
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("companyId")
      .exec();
  }

  async findByCompanyAndOrganization(
    companyId: string,
    organizationId: string,
    visibility?: JobListVisibilityContext
  ): Promise<IJob[]> {
    const base = {
      organizationId,
      companyId: companyId,
    };
    const filter = mergeJobListVisibility(base, visibility);
    return this.model.find(filter).populate("companyId").exec();
  }
}
