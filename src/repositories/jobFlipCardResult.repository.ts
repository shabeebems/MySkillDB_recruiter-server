import JobFlipCardResultModel, { IJobFlipCardResult } from "../models/jobFlipCardResult.model";
import { BaseRepository } from "./base.repository";

export class JobFlipCardResultRepository extends BaseRepository<IJobFlipCardResult> {
  constructor() {
    super(JobFlipCardResultModel);
  }

  async findByUserIdAndJobId(
    userId: string,
    jobId: string
  ): Promise<IJobFlipCardResult | null> {
    return this.model
      .findOne({ userId, jobId })
      .exec();
  }

  async findByUserId(userId: string): Promise<IJobFlipCardResult[]> {
    return this.model
      .find({ userId })
      .populate("jobId")
      .sort({ completedAt: -1 })
      .exec();
  }
}

