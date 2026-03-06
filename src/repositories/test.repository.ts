import TestModel, { ITest } from "../models/test.model";
import { BaseRepository } from "./base.repository";

export class TestRepository extends BaseRepository<ITest> {
  constructor() {
    super(TestModel);
  }

  async findBySubjectId(subjectId: string) {
    return this.find({
      subjectId,
      $or: [
        { topicId: { $exists: false } },
        { topicId: null },
      ],
    } as any);
  }

  async findByTopicId(topicId: string) {
    return this.find({ topicId } as any);
  }

  async findByJobId(jobId: string) {
    return this.find({
      jobId,
      $or: [
        { skillId: { $exists: false } },
        { skillId: null },
      ],
    } as any);
  }

  async findBySkillId(skillId: string) {
    return this.find({ skillId } as any);
  }

  async findBySubjectIds(subjectIds: string[]) {
    return this.model
      .find({ subjectId: { $in: subjectIds } })
      .populate("subjectId", "name code _id")
      .populate("topicId", "name _id")
      .populate("organizationId", "name _id")
      .sort({ createdAt: -1 })
      .exec();
  }
}


