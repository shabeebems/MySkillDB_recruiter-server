import VideoCvModel, { IVideoCv } from "../models/videoCv.model";
import { BaseRepository } from "./base.repository";

export class VideoCvRepository extends BaseRepository<IVideoCv> {
  constructor() {
    super(VideoCvModel);
  }

  async findByUserIdAndJobId(
    userId: string,
    jobId: string
  ): Promise<IVideoCv | null> {
    return this.model
      .findOne({ userId, jobId })
      .exec();
  }

  async findByUserId(userId: string): Promise<IVideoCv[]> {
    return this.model
      .find({ userId })
      .populate("jobId")
      .sort({ createdAt: -1 })
      .exec();
  }

  async createOrUpdate(
    userId: string,
    jobId: string,
    link: string
  ): Promise<IVideoCv> {
    return this.model.findOneAndUpdate(
      { userId, jobId },
      { userId, jobId, link },
      { upsert: true, new: true }
    ).exec();
  }

  async countByUserId(userId: string): Promise<number> {
    return this.model.countDocuments({ userId }).exec();
  }

  async findByJobId(jobId: string, limit?: number, skip?: number): Promise<IVideoCv[]> {
    const query = this.model
      .find({ jobId })
      .populate("userId", "name email profilePicture")
      .populate("jobId", "name companyName")
      .sort({ createdAt: -1 });
    
    if (skip !== undefined) {
      query.skip(skip);
    }
    if (limit !== undefined) {
      query.limit(limit);
    }
    
    return query.exec();
  }

  async countByJobId(jobId: string): Promise<number> {
    return this.model.countDocuments({ jobId }).exec();
  }
}

