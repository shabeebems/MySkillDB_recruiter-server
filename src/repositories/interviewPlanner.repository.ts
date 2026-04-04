import InterviewPlannerModel, { IInterviewPlanner } from "../models/interviewPlanner.model";
import { BaseRepository } from "./base.repository";

export class InterviewPlannerRepository extends BaseRepository<IInterviewPlanner> {
  constructor() {
    super(InterviewPlannerModel);
  }

  async findByUserId(userId: string): Promise<IInterviewPlanner[]> {
    return this.model
      .find({ userId } as any)
      .populate({
        path: 'jobId',
        select: 'name companyName place salaryRange createdByStudentId',
      })
      .exec();
  }

  async findByUserIdAndJobId(userId: string, jobId: string): Promise<IInterviewPlanner | null> {
    return this.findOne({ userId, jobId } as any);
  }

  async countByUserId(userId: string): Promise<number> {
    return this.model.countDocuments({ userId } as any).exec();
  }

  async findLatestByUserId(userId: string, limit: number = 3): Promise<IInterviewPlanner[]> {
    return this.model
      .find({ userId } as any)
      .populate({
        path: 'jobId',
        select: 'name companyName place salaryRange createdByStudentId',
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }
}
