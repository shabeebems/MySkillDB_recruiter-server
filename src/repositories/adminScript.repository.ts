import { Types } from "mongoose";
import AdminScriptModel, { IAdminScript } from "../models/adminScript.model";
import AdminScriptSectionModel, { IAdminScriptSection } from "../models/adminScriptSection.model";
import { BaseRepository } from "./base.repository";

export class AdminScriptRepository extends BaseRepository<IAdminScript> {
  constructor() {
    super(AdminScriptModel);
  }

  async findByOrganizationId(organizationId: string, jobId?: string): Promise<IAdminScript[]> {
    const filter: Record<string, unknown> = { organizationId: new Types.ObjectId(organizationId) };
    if (jobId) {
      filter.jobId = new Types.ObjectId(jobId);
    }
    return this.model
      .find(filter)
      .populate("jobId", "name companyName")
      .sort({ createdAt: -1 })
      .lean()
      .exec() as Promise<IAdminScript[]>;
  }

  /** Returns true if at least one admin script exists for this organization and job (used for "one script per job" validation). */
  async existsByOrganizationIdAndJobId(organizationId: string, jobId: string): Promise<boolean> {
    const count = await this.model
      .countDocuments({
        organizationId: new Types.ObjectId(organizationId),
        jobId: new Types.ObjectId(jobId),
      })
      .exec();
    return count > 0;
  }

  async createWithSections(
    scriptData: Partial<IAdminScript>,
    sections: Array<{ time: string; title: string; content: string; order: number }>
  ): Promise<IAdminScript> {
    const script = await this.model.create(scriptData);
    if (sections.length > 0) {
      await AdminScriptSectionModel.insertMany(
        sections.map((s) => ({
          adminScriptId: script._id,
          ...s,
        }))
      );
    }
    return script;
  }
}

export class AdminScriptSectionRepository {
  async findByAdminScriptId(adminScriptId: string): Promise<IAdminScriptSection[]> {
    return AdminScriptSectionModel.find({
      adminScriptId: new Types.ObjectId(adminScriptId),
    })
      .sort({ order: 1 })
      .lean()
      .exec() as Promise<IAdminScriptSection[]>;
  }

  async deleteByAdminScriptId(adminScriptId: string): Promise<void> {
    await AdminScriptSectionModel.deleteMany({
      adminScriptId: new Types.ObjectId(adminScriptId),
    }).exec();
  }
}
