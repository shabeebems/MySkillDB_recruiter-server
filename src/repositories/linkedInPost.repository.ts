import { Types } from "mongoose";
import LinkedInPostModel, { ILinkedInPost } from "../models/linkedInPost.model";
import { BaseRepository } from "./base.repository";

export class LinkedInPostRepository extends BaseRepository<ILinkedInPost> {
  constructor() {
    super(LinkedInPostModel);
  }

  async findByUserAndJobAndSkill(
    userId: string,
    jobId: string,
    skillId: string
  ): Promise<ILinkedInPost[]> {
    return this.find({
      userId: new Types.ObjectId(userId),
      jobId: new Types.ObjectId(jobId),
      skillId: new Types.ObjectId(skillId),
    } as any);
  }

  async findLatestByUserId(userId: string, limit: number = 3): Promise<ILinkedInPost[]> {
    return this.model
      .find({ userId: new Types.ObjectId(userId) } as any)
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async countByUserId(userId: string): Promise<number> {
    return this.model.countDocuments({ userId: new Types.ObjectId(userId) } as any).exec();
  }

  async findByUserId(userId: string): Promise<ILinkedInPost[]> {
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

