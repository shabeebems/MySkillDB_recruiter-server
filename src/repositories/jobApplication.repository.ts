import JobApplicationModel, { IJobApplication } from "../models/jobApplication.model";
import { BaseRepository } from "./base.repository";

export class JobApplicationRepository extends BaseRepository<IJobApplication> {
  constructor() {
    super(JobApplicationModel);
  }

  async findByUserIdWithPagination(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ applications: IJobApplication[]; total: number }> {
    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      this.model
        .find({ userId })
        .populate('jobId', '-__v')
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.model.countDocuments({ userId }).exec()
    ]);

    return { applications, total };
  }
}

