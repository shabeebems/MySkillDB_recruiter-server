import { Types } from "mongoose";
import ReadingModuleModel, { IReadingModule } from "../models/readingModule.model";
import { BaseRepository } from "./base.repository";

export class ReadingModuleRepository extends BaseRepository<IReadingModule> {
  constructor() {
    super(ReadingModuleModel);
  }

  async findByJobIdAndSkillId(jobId: string, skillId: string): Promise<IReadingModule | null> {
    // Convert string IDs to ObjectIds for proper MongoDB comparison
    return this.findOne({ 
      jobId: new Types.ObjectId(jobId), 
      skillId: new Types.ObjectId(skillId) 
    } as any);
  }

  async findJobBriefsByOrganization(organizationId: string, jobId?: string): Promise<IReadingModule[]> {
    const filter: any = {
      organizationId: new Types.ObjectId(organizationId),
      moduleType: "job-brief",
    };
    if (jobId) {
      filter.jobId = new Types.ObjectId(jobId);
    }
    return this.model.find(filter).populate("jobId", "name companyName").sort({ createdAt: -1 }).exec();
  }

  async findJobBriefByJobId(jobId: string): Promise<IReadingModule | null> {
    return this.findOne({
      jobId: new Types.ObjectId(jobId),
      moduleType: "job-brief",
    } as any);
  }
}

