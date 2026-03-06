import QuestionModel, { IQuestion } from "../models/question.model";
import { BaseRepository } from "./base.repository";

export class QuestionRepository extends BaseRepository<IQuestion> {
  constructor() {
    super(QuestionModel);
  }

  async findByTestIdWithTopic(testId: string) {
    return this.model
      .find({ testId } as any)
      .populate("topicId", "name _id")
      .exec();
  }
}


