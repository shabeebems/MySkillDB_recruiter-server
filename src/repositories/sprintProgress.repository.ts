import SprintProgressModel, { ISprintProgress } from "../models/sprintProgress.model";
import { BaseRepository } from "./base.repository";
import { Types } from "mongoose";
import { createChildLogger } from "../utils/logger";

const log = createChildLogger("SprintProgressRepository");


export class SprintProgressRepository extends BaseRepository<ISprintProgress> {
  constructor() {
    super(SprintProgressModel);
  }

  /**
   * Find all sprint progress records for a specific user
   * @param userId - The user's ObjectId
   * @returns Array of sprint progress records
   */
  async findByUserId(userId: string): Promise<ISprintProgress[]> {
    return this.model
      .find({ userId })
      .populate("sprintId")
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Find a sprint progress record by userId and sprintId
   * @param userId - The user's ObjectId
   * @param sprintId - The sprint's ObjectId
   * @returns Sprint progress record or null
   */
  async findByUserIdAndSprintId(
    userId: string,
    sprintId: string
  ): Promise<ISprintProgress | null> {
    return this.model
      .findOne({ userId, sprintId })
      .populate("sprintId")
      .exec();
  }

  /**
   * Find all students for a specific sprint with pagination
   * @param sprintId - The sprint's ObjectId
   * @param skip - Number of records to skip
   * @param limit - Number of records to return
   * @param filters - Optional filters (departmentId, assignmentId)
   * @returns Array of sprint progress records with populated student data
   */
  async findBySprintIdWithPagination(
    sprintId: string,
    skip: number,
    limit: number,
    filters?: { departmentId?: string; assignmentId?: string }
  ): Promise<ISprintProgress[]> {
    try {
      const query: any = { sprintId: new Types.ObjectId(sprintId) };
      
      if (filters?.departmentId) {
        query.departmentId = new Types.ObjectId(filters.departmentId);
      }
      
      if (filters?.assignmentId) {
        query.assignmentId = new Types.ObjectId(filters.assignmentId);
      }
      
      const sprintProgressRecords = await this.model
        .find(query)
        .populate({
          path: 'userId',
          model: 'User',
          select: 'name mobile',
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();
      return sprintProgressRecords;
    } catch (error) {
      log.error({ err: error }, "Error in findBySprintIdWithPagination:");
      throw error;
    }
  }

  /**
   * Get total count of students for a sprint
   * @param sprintId - The sprint's ObjectId
   * @param filters - Optional filters (departmentId, assignmentId)
   * @returns Total count
   */
  async getCountBySprintId(sprintId: string, filters?: { departmentId?: string; assignmentId?: string }): Promise<number> {
    const query: any = { sprintId: new Types.ObjectId(sprintId) };
    
    if (filters?.departmentId) {
      query.departmentId = new Types.ObjectId(filters.departmentId);
    }
    
    if (filters?.assignmentId) {
      query.assignmentId = new Types.ObjectId(filters.assignmentId);
    }
    
    return this.model.countDocuments(query).exec();
  }
}

