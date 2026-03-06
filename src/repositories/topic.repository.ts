import TopicModel, { ITopic } from "../models/topic.model";
import { BaseRepository } from "./base.repository";

export class TopicRepository extends BaseRepository<ITopic> {
  constructor() {
    super(TopicModel);
  }

  // ✅ Find topics by subjectId and populate only 'name' and '_id'
  async findBySubjectId(subjectId: string): Promise<ITopic[]> {
    return await TopicModel.find({ subjectId })
      .populate("subjectId", "name _id")
      .populate("departmentId", "name _id")
      .exec();
  }

  // Find topic by name and subjectId
  async findByNameAndSubjectId(
    name: string,
    subjectId: string
  ): Promise<ITopic | null> {
    return await TopicModel.findOne({ name, subjectId }).exec();
  }

  // Bulk create topics
  async createMany(data: Partial<ITopic>[]): Promise<ITopic[]> {
    return await TopicModel.insertMany(data) as unknown as ITopic[];
  }
}
