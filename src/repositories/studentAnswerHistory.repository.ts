import StudentAnswerModel, { IStudentAnswer } from "../models/studentAnswerHistory";
import { BaseRepository } from "./base.repository";

export class StudentAnswerHistoryRepository extends BaseRepository<IStudentAnswer> {
  constructor() {
    super(StudentAnswerModel);
  }

  async findByUserTestId(userTestId: string) {
    return this.find({ userTestId } as any);
  }

  async findByUserTestIdWithQuestion(userTestId: string) {
    return this.model
      .find({ userTestId } as any)
      .populate({
        path: "questionId",
        select: "questionText correctAnswer",
      })
      .exec();
  }

  async findByUserTestIdWithQuestionSkill(userTestId: string) {
    return this.model
      .find({ userTestId } as any)
      .populate({
        path: "questionId",
        select: "skillId",
      })
      .lean()
      .exec();
  }

  async createMany(answers: Partial<IStudentAnswer>[]) {
    return this.model.insertMany(answers);
  }
}

