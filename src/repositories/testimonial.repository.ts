import { Types } from "mongoose";
import TestimonialModel, { ITestimonial } from "../models/testimonial.model";
import { BaseRepository } from "./base.repository";

export class TestimonialRepository extends BaseRepository<ITestimonial> {
  constructor() {
    super(TestimonialModel);
  }

  async findByUserAndJobAndSkill(
    userId: string,
    jobId: string,
    skillId: string
  ): Promise<ITestimonial[]> {
    return this.find({
      userId: new Types.ObjectId(userId),
      jobId: new Types.ObjectId(jobId),
      skillId: new Types.ObjectId(skillId),
    } as any);
  }

  async findByUserId(userId: string): Promise<ITestimonial[]> {
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

