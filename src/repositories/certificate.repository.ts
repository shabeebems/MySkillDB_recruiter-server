import { Types } from "mongoose";
import CertificateModel, { ICertificate } from "../models/certificate.model";
import { BaseRepository } from "./base.repository";

export class CertificateRepository extends BaseRepository<ICertificate> {
  constructor() {
    super(CertificateModel);
  }

  async findByUserAndJobAndSkill(
    userId: string,
    jobId: string,
    skillId: string
  ): Promise<ICertificate[]> {
    return this.find({
      userId: new Types.ObjectId(userId),
      jobId: new Types.ObjectId(jobId),
      skillId: new Types.ObjectId(skillId),
    } as any);
  }

  async findByUserId(userId: string): Promise<ICertificate[]> {
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

