import SkillModel, { ISkill } from "../models/skill.model";
import { BaseRepository } from "./base.repository";

export class SkillRepository extends BaseRepository<ISkill> {
  constructor() {
    super(SkillModel);
  }

  // Find skills by jobId
  async findByJobId(jobId: string): Promise<ISkill[]> {
    return await SkillModel.find({ jobId })
      .populate("jobId", "name _id")
      .populate("departmentId", "name _id")
      .exec();
  }

  // Find skills by jobId and type
  async findByJobIdAndType(jobId: string, type: string): Promise<ISkill[]> {
    return await SkillModel.find({ jobId, type })
      .populate("jobId", "name _id")
      .populate("departmentId", "name _id")
      .exec();
  }

  // Find skill by name and jobId
  async findByNameAndJobId(
    name: string,
    jobId: string
  ): Promise<ISkill | null> {
    return await SkillModel.findOne({ name, jobId }).exec();
  }

  // Find skill by name, jobId, and type
  async findByNameAndJobIdAndType(
    name: string,
    jobId: string,
    type: string
  ): Promise<ISkill | null> {
    return await SkillModel.findOne({ name, jobId, type }).exec();
  }
}

