import RecordingModel, { IRecording } from "../models/recording.model";
import { BaseRepository } from "./base.repository";

export class RecordingRepository extends BaseRepository<IRecording> {
  constructor() {
    super(RecordingModel);
  }

  async findBySubjectIdAndTopicId(
    subjectId: string,
    topicId: string
  ): Promise<IRecording[]> {
    return this.model
      .find({
        subId: subjectId,
        topicId: topicId,
      })
      .populate("subId", "name _id")
      .populate("topicId", "name _id")
      .populate("jobId", "name _id")
      .populate("skillId", "name _id")
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByTopicIds(topicIds: string[]): Promise<IRecording[]> {
    return this.model
      .find({
        topicId: { $in: topicIds },
      })
      .populate("subId", "name _id")
      .populate("topicId", "name _id")
      .populate("jobId", "name _id")
      .populate("skillId", "name _id")
      .sort({ createdAt: -1 })
      .exec();
  }

  async findBySubjectId(subjectId: string): Promise<IRecording[]> {
    return this.model
      .find({
        subId: subjectId,
      })
      .populate("subId", "name code _id")
      .populate("topicId", "name _id")
      .populate("jobId", "name _id")
      .populate("skillId", "name _id")
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByJobId(jobId: string): Promise<IRecording[]> {
    return this.model
      .find({
        jobId: jobId,
      })
      .populate("jobId", "name _id")
      .populate("skillId", "name _id")
      .populate("subId", "name code _id")
      .populate("topicId", "name _id")
      .sort({ createdAt: -1 })
      .exec();
  }

  async findBySkillId(skillId: string): Promise<IRecording[]> {
    return this.model
      .find({
        skillId: skillId,
      })
      .populate("jobId", "name _id")
      .populate("skillId", "name _id")
      .populate("subId", "name code _id")
      .populate("topicId", "name _id")
      .sort({ createdAt: -1 })
      .exec();
  }
}


