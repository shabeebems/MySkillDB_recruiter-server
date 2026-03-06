import JobOverviewVideoModel, {
  IJobOverviewVideo,
} from "../models/jobOverviewVideo.model";
import { BaseRepository } from "./base.repository";
import mongoose from "mongoose";

export class JobOverviewVideoRepository extends BaseRepository<IJobOverviewVideo> {
  constructor() {
    super(JobOverviewVideoModel);
  }

  async findByOrganizationId(
    organizationId: string
  ): Promise<IJobOverviewVideo[]> {
    return JobOverviewVideoModel.find({
      organizationId: new mongoose.Types.ObjectId(organizationId),
    })
      .populate("jobId", "name companyName")
      .sort({ createdAt: -1 })
      .lean()
      .exec() as Promise<IJobOverviewVideo[]>;
  }

  async findJobIdsWithOverview(
    organizationId: string
  ): Promise<mongoose.Types.ObjectId[]> {
    const docs = await JobOverviewVideoModel.find({
      organizationId: new mongoose.Types.ObjectId(organizationId),
    })
      .select("jobId")
      .lean()
      .exec();
    return (docs as unknown as { jobId: mongoose.Types.ObjectId }[])
      .map((d) => d.jobId)
      .filter((id): id is mongoose.Types.ObjectId => id != null);
  }

  async deleteByJobId(
    organizationId: string,
    jobId: string
  ): Promise<number> {
    const result = await JobOverviewVideoModel.deleteMany({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      jobId: new mongoose.Types.ObjectId(jobId),
    }).exec();
    return result.deletedCount ?? 0;
  }

  async findOneByJobId(
    organizationId: string,
    jobId: string
  ): Promise<IJobOverviewVideo | null> {
    return JobOverviewVideoModel.findOne({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      jobId: new mongoose.Types.ObjectId(jobId),
    })
      .lean()
      .exec() as Promise<IJobOverviewVideo | null>;
  }
}
