import { Types } from "mongoose";
import StudentTestModel, { IStudentTest } from "../models/studentTestHistory";
import { BaseRepository } from "./base.repository";

export class StudentTestHistoryRepository extends BaseRepository<IStudentTest> {
  constructor() {
    super(StudentTestModel);
  }

  async findByUserId(userId: string) {
    return this.find({ userId } as any);
  }

  async findByTestId(testId: string) {
    return this.find({ testId } as any);
  }

  async findByUserAndTestId(userId: string, testId: string) {
    return this.findOne({ userId, testId } as any);
  }

  async findBySubjectIdAndUserId(subjectId: string, userId: string) {
    // This will need to join with Test model to filter by subjectId
    // Only return subject-level tests (tests without topicId)
    // Convert string IDs to ObjectIds for proper matching
    if (!subjectId || !userId) {
      throw new Error("subjectId and userId are required");
    }
    
    const subjectObjectId = new Types.ObjectId(subjectId);
    const userObjectId = new Types.ObjectId(userId);
    
    return this.model
      .find({ userId: userObjectId } as any)
      .populate({
        path: "testId",
        match: { 
          subjectId: subjectObjectId,
          $or: [
            { topicId: { $exists: false } },
            { topicId: null }
          ]
        },
        select: "name difficultyLevel questionCount",
      })
      .exec()
      .then((results) => results.filter((item: any) => item.testId !== null));
  }

  async findByTopicIdAndUserId(topicId: string, userId: string) {
    // Filter by topicId through Test model where topic belongs to a subject (not a job)
    if (!topicId || !userId) {
      throw new Error("topicId and userId are required");
    }
    
    const topicObjectId = new Types.ObjectId(topicId);
    const userObjectId = new Types.ObjectId(userId);
    
    return this.model
      .find({ userId: userObjectId } as any)
      .populate({
        path: "testId",
        match: { 
          topicId: topicObjectId,
          subjectId: { $exists: true, $ne: null },
          $or: [
            { jobId: { $exists: false } },
            { jobId: null }
          ]
        },
        select: "name difficultyLevel questionCount",
      })
      .exec()
      .then((results) => results.filter((item: any) => item.testId !== null));
  }

  async findByJobIdAndUserId(jobId: string, userId: string) {
    // Only return job-level tests (tests without skillId)
    // Tests with skillId should be fetched via findByJobSkillIdAndUserId
    if (!jobId || !userId) {
      throw new Error("jobId and userId are required");
    }
    
    const jobObjectId = new Types.ObjectId(jobId);
    const userObjectId = new Types.ObjectId(userId);
    
    return this.model
      .find({ userId: userObjectId } as any)
      .populate({
        path: "testId",
        match: { 
          jobId: jobObjectId,
          $or: [
            { skillId: { $exists: false } },
            { skillId: null }
          ]
        },
        select: "name difficultyLevel questionCount skillId",
      })
      .exec()
      .then((results) => results.filter((item: any) => item.testId !== null));
  }

  async findByJobSkillIdAndUserId(skillId: string, userId: string) {
    // Filter by skillId through Test model where skill belongs to a job
    if (!skillId || !userId) {
      throw new Error("skillId and userId are required");
    }
    
    const skillObjectId = new Types.ObjectId(skillId);
    const userObjectId = new Types.ObjectId(userId);
    
    return this.model
      .find({ userId: userObjectId } as any)
      .populate({
        path: "testId",
        match: { 
          skillId: skillObjectId,
          jobId: { $exists: true, $ne: null }
        },
        select: "name difficultyLevel questionCount",
      })
      .exec()
      .then((results) => results.filter((item: any) => item.testId !== null));
  }
}

