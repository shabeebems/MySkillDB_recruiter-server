import SprintJobProgressModel, { ISprintJobProgress } from "../models/sprintJobProgress.model";
import { BaseRepository } from "./base.repository";

export class SprintJobProgressRepository extends BaseRepository<ISprintJobProgress> {
  constructor() {
    super(SprintJobProgressModel);
  }

  /**
   * Find all job progress records for a user in a specific sprint
   * @param userId - The user's ObjectId
   * @param sprintId - The sprint's ObjectId
   * @returns Array of job progress records
   */
  async findByUserIdAndSprintId(
    userId: string,
    sprintId: string,
    populateJobId: boolean = false
  ): Promise<ISprintJobProgress[]> {
    const query = this.model.find({ userId, sprintId });
    if (populateJobId) {
      query.populate("jobId");
    }
    return query.sort({ createdAt: 1 }).exec();
  }

  /**
   * Find a specific job progress record
   * @param userId - The user's ObjectId
   * @param sprintId - The sprint's ObjectId
   * @param jobId - The job's ObjectId
   * @returns Job progress record or null
   */
  async findByUserSprintAndJob(
    userId: string,
    sprintId: string,
    jobId: string
  ): Promise<ISprintJobProgress | null> {
    return this.model
      .findOne({ userId, sprintId, jobId })
      .exec();
  }

  /**
   * Bulk create job progress records
   * @param records - Array of job progress records to create
   * @returns Created records
   */
  async bulkCreate(records: Partial<ISprintJobProgress>[]): Promise<ISprintJobProgress[]> {
    return this.model.insertMany(records) as Promise<ISprintJobProgress[]>;
  }
}

