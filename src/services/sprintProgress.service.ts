import { SprintProgressRepository } from "../repositories/sprintProgress.repository";
import { Messages } from "../constants/messages";
import { ServiceResponse } from "./types";
import { createChildLogger } from "../utils/logger";

const log = createChildLogger("SprintProgressService");


export class SprintProgressService {
  private sprintProgressRepository = new SprintProgressRepository();

  /**
   * Get all sprints for a specific user
   * @param userId - The user's ObjectId
   * @returns ServiceResponse with sprint data including sprint details
   */
  public async getSprintsByUserId(
    userId: string
  ): Promise<ServiceResponse> {
    try {
      const sprintProgressRecords = await this.sprintProgressRepository.findByUserId(
        userId
      );

      // Transform the data to include sprint details and student progress
      const sprints = sprintProgressRecords.map((sprintProgress) => {
        const sprint = sprintProgress.sprintId as any;
        return {
          id: (sprintProgress as any)._id?.toString() || sprintProgress.id?.toString() || "",
          sprintId: sprint?._id?.toString() || null,
          name: sprint?.name || "",
          type: sprint?.type || "",
          startDate: sprint?.startDate || null,
          endDate: sprint?.endDate || null,
          status: sprintProgress.status,
          completedJobsCount: sprintProgress.completedJobsCount,
          totalJobs: sprintProgress.totalJobs,
        };
      });

      return {
        success: true,
        message: Messages.JOB_SPRINT_FETCH_SUCCESS,
        data: sprints,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to fetch sprints",
        data: null,
      };
    }
  }

  /**
   * Get all students for a specific sprint with pagination
   * @param sprintId - The sprint's ObjectId
   * @param query - Query parameters (page, limit, departmentId, assignmentId)
   * @returns ServiceResponse with students data and pagination info
   */
  public async getStudentsBySprintId(
    sprintId: string,
    query: any = {}
  ): Promise<ServiceResponse> {
    try {
      const page = parseInt(query.page as string) || 1;
      const limit = parseInt(query.limit as string) || 6;
      const skip = (page - 1) * limit;
      
      // Build filters
      const filters: { departmentId?: string; assignmentId?: string } = {};
      if (query.departmentId) {
        filters.departmentId = query.departmentId as string;
      }
      if (query.assignmentId) {
        filters.assignmentId = query.assignmentId as string;
      }
      
      log.info({ data: sprintId }, "sprintId");
      const sprintProgressRecords = await this.sprintProgressRepository.findBySprintIdWithPagination(
        sprintId,
        skip,
        limit,
        filters
      );
      log.info({ data: sprintProgressRecords }, "sprintProgressRecords");
      const totalCount = await this.sprintProgressRepository.getCountBySprintId(sprintId, filters);
      const totalPages = Math.ceil(totalCount / limit);

      // Transform the data to include user/student details and progress
      const students = sprintProgressRecords.map((progress) => {
        const user = progress.userId as any;
        return {
          id: (progress as any)._id?.toString() || progress.id?.toString() || "",
          userId: user?._id?.toString() || null,
          name: user?.name || "",
          email: user?.email || "",
          rollNumber: user?.mobile || "", // Using mobile as rollNumber since rollNumber doesn't exist
          status: progress.status,
          completedJobsCount: progress.completedJobsCount,
          totalJobs: progress.totalJobs,
          completionPercentage: progress.totalJobs > 0
            ? Math.round((progress.completedJobsCount / progress.totalJobs) * 100)
            : 0,
        };
      });

      return {
        success: true,
        message: Messages.JOB_SPRINT_FETCH_SUCCESS,
        data: {
          students,
          pagination: {
            currentPage: page,
            totalPages,
            totalCount,
            hasNext: page < totalPages,
            hasPrev: page > 1,
            limit,
          },
        },
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to fetch students",
        data: null,
      };
    }
  }
}

