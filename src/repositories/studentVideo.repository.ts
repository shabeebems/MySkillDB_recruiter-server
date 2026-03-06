import { Types } from "mongoose";
import StudentVideoModel, { IStudentVideo } from "../models/studentVideo.model";
import { BaseRepository } from "./base.repository";

export class StudentVideoRepository extends BaseRepository<IStudentVideo> {
  constructor() {
    super(StudentVideoModel);
  }

  async findByUserAndJobAndSkill(
    userId: string,
    jobId: string,
    skillId: string
  ): Promise<IStudentVideo[]> {
    return this.find({
      userId: new Types.ObjectId(userId),
      jobId: new Types.ObjectId(jobId),
      skillId: new Types.ObjectId(skillId),
    } as any);
  }

  async countByUserId(userId: string): Promise<number> {
    return this.model.countDocuments({ userId: new Types.ObjectId(userId) } as any).exec();
  }

  async findLatestByUserId(userId: string, limit: number = 3): Promise<IStudentVideo[]> {
    return this.model
      .find({ userId: new Types.ObjectId(userId) } as any)
      .populate('jobId', 'name companyName')
      .populate('skillId', 'name title')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async findByUserId(userId: string): Promise<IStudentVideo[]> {
    return this.model
      .find({
        userId: new Types.ObjectId(userId),
      })
      .populate('jobId', 'name companyName')
      .populate('skillId', 'name title')
      .sort({ createdAt: -1 })
      .exec();
  }
}

