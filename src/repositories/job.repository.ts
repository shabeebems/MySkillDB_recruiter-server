import JobModel, { IJob } from "../models/job.model";
import { BaseRepository } from "./base.repository";
import mongoose from "mongoose";

export class JobRepository extends BaseRepository<IJob> {
  constructor() {
    super(JobModel);
  }

  async findByDepartmentAndOrganization(
    departmentId: string,
    organizationId: string
  ): Promise<IJob[]> {
    return this.model
      .find({
        organizationId,
        departmentIds: departmentId
      })
      .populate('companyId')
      .exec();
  }

  // Override base method to include population
  async findByOrganizationId(organizationId: string): Promise<IJob[]> {
    return this.model
      .find({ organizationId })
      .populate('companyId')
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
    sortBy?: string
  ): Promise<{ jobs: IJob[]; total: number; page: number; limit: number; totalPages: number }> {
    const filter: any = { organizationId };

    if (departmentId) {
      filter.departmentIds = departmentId;
    }

    if (companyId) {
      filter.companyId = new mongoose.Types.ObjectId(companyId);
    } else if (companyName) {
      filter.$or = [
        { companyName: { $regex: companyName, $options: "i" } },
        { "companyId.name": { $regex: companyName, $options: "i" } }
      ];
    }

    // Filter by status
    if (statusFilter === "active") {
      filter.isActive = { $ne: false };
    } else if (statusFilter === "inactive") {
      filter.isActive = false;
    }

    const pageNumber = page || 1;
    const pageSize = limit || 10;
    const skip = (pageNumber - 1) * pageSize;

    // Determine sort order
    let sortOrder: any = { createdAt: -1 }; // Default: newest first
    if (sortBy === "oldest") {
      sortOrder = { createdAt: 1 };
    } else if (sortBy === "company") {
      sortOrder = { companyName: 1 };
    } else if (sortBy === "name") {
      sortOrder = { name: 1 };
    }

    const [jobs, total] = await Promise.all([
      this.model
        .find(filter)
        .populate('companyId')
        .sort(sortOrder)
        .skip(skip)
        .limit(pageSize)
        .exec(),
      this.model.countDocuments(filter).exec()
    ]);

    return {
      jobs,
      total,
      page: pageNumber,
      limit: pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  // Override findById to include population
  async findById(id: string): Promise<IJob | null> {
    return this.model
      .findById(id)
      .populate('companyId')
      .exec();
  }

  async findLatestJobsByOrganization(
    organizationId: string,
    limit: number = 5
  ): Promise<IJob[]> {
    return this.model
      .find({ organizationId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('companyId')
      .exec();
  }

  async countByOrganization(organizationId: string): Promise<number> {
    return this.model.countDocuments({ organizationId }).exec();
  }

  async countByDepartmentAndOrganization(
    departmentId: string,
    organizationId: string
  ): Promise<number> {
    return this.model.countDocuments({
      organizationId,
      departmentIds: departmentId
    }).exec();
  }

  async findLatestJobsByDepartmentAndOrganization(
    departmentId: string,
    organizationId: string,
    limit: number = 3
  ): Promise<IJob[]> {
    return this.model
      .find({
        organizationId,
        departmentIds: departmentId
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('companyId')
      .exec();
  }

  async findByCompanyAndOrganization(
    companyId: string,
    organizationId: string
  ): Promise<IJob[]> {
    return this.model
      .find({
        organizationId,
        companyId: companyId
      })
      .populate('companyId')
      .exec();
  }
}
