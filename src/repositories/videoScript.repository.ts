import { Types } from "mongoose";
import VideoScriptModel, { IVideoScript } from "../models/videoScript.model";
import { BaseRepository } from "./base.repository";

export class VideoScriptRepository extends BaseRepository<IVideoScript> {
  constructor() {
    super(VideoScriptModel);
  }

  async findByJobIdAndSkillIdAndUserIdea(
    jobId: string,
    skillId: string,
    userIdea: string
  ): Promise<IVideoScript | null> {
    return this.findOne({
      jobId: new Types.ObjectId(jobId),
      skillId: new Types.ObjectId(skillId),
      userIdea: { $regex: new RegExp(`^${userIdea.trim()}$`, "i") },
    } as any);
  }

  async findByJobIdAndSkillId(
    jobId: string,
    skillId: string
  ): Promise<IVideoScript[]> {
    return this.find({
      jobId: new Types.ObjectId(jobId),
      skillId: new Types.ObjectId(skillId),
    } as any);
  }

  async findByUserAndJobAndSkill(
    userId: string,
    jobId: string,
    skillId: string
  ): Promise<IVideoScript[]> {
    return this.find({
      userId: new Types.ObjectId(userId),
      jobId: new Types.ObjectId(jobId),
      skillId: new Types.ObjectId(skillId),
    } as any);
  }

  async findByUserId(userId: string): Promise<IVideoScript[]> {
    return this.model
      .find({
        userId: new Types.ObjectId(userId),
      })
      .populate('jobId', 'name companyName')
      .populate('skillId', 'name title')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findLatestByUserId(userId: string, limit: number = 10): Promise<IVideoScript[]> {
    return this.model
      .find({
        userId: new Types.ObjectId(userId),
      })
      .populate('jobId', 'name companyName')
      .populate('skillId', 'name title')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }
}

