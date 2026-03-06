import { JobSprintRepository } from "../repositories/jobSprint.repository";
import { Messages } from "../constants/messages";
import { ServiceResponse } from "./types";
import SprintProgressModel from "../models/sprintProgress.model";
import UserModel from "../models/user.model";
import { Types } from "mongoose";
import { NotificationBatchingService } from "./notificationBatching.service";
import { createChildLogger } from "../utils/logger";

const log = createChildLogger("JobSprintService");


export class JobSprintService {
  private jobSprintRepository = new JobSprintRepository();
  private notificationBatchingService = new NotificationBatchingService();

  public async createJobSprint(data: any): Promise<ServiceResponse> {
    // Validate required fields
    if (!data.startDate) {
      return {
        success: false,
        message: "Start date is required",
        data: null,
      };
    }

    if (!data.endDate) {
      return {
        success: false,
        message: "End date is required",
        data: null,
      };
    }

    // Convert string dates to Date objects if needed
    const startDate = typeof data.startDate === 'string' ? new Date(data.startDate) : data.startDate;
    const endDate = typeof data.endDate === 'string' ? new Date(data.endDate) : data.endDate;

    // Validate dates are valid
    if (isNaN(startDate.getTime())) {
      return {
        success: false,
        message: "Start date must be a valid date",
        data: null,
      };
    }

    if (isNaN(endDate.getTime())) {
      return {
        success: false,
        message: "End date must be a valid date",
        data: null,
      };
    }

    // Validate end date is after start date
    if (endDate <= startDate) {
      return {
        success: false,
        message: "End date must be after start date",
        data: null,
      };
    }

    // Validate that depIds or assignmentIds are provided based on type
    if (data.type === 'department' && (!data.depIds || data.depIds.length === 0)) {
      return {
        success: false,
        message: "Department IDs are required for department type sprint",
        data: null,
      };
    }

    if (data.type === 'class' && (!data.assignmentIds || data.assignmentIds.length === 0)) {
      return {
        success: false,
        message: "Assignment IDs are required for class type sprint",
        data: null,
      };
    }

    if (!data.jobIds || data.jobIds.length === 0) {
      return {
        success: false,
        message: "At least one job ID is required",
        data: null,
      };
    }

    if (data.jobIds.length > 3) {
      return {
        success: false,
        message: "Maximum 3 jobs allowed per sprint",
        data: null,
      };
    }

    // Step 1: Detect sprint type and find eligible students
    let eligibleStudents: any[] = [];

    if (data.type === 'department') {
      // Find students by department IDs
      const depObjectIds = data.depIds.map((id: string) => new Types.ObjectId(id));
      eligibleStudents = await UserModel.find({
        role: "student",
        departmentId: { $in: depObjectIds },
        organizationId: new Types.ObjectId(data.organizationId),
        // isBlock: false,
        // status: "active",
      }).select("_id departmentId assignmentId").lean();
    } else if (data.type === 'class') {
      // Find students by assignment IDs
      const assignmentObjectIds = data.assignmentIds.map((id: string) => new Types.ObjectId(id));
      eligibleStudents = await UserModel.find({
        role: "student",
        assignmentId: { $in: assignmentObjectIds },
        organizationId: new Types.ObjectId(data.organizationId),
        // isBlock: false,
        // status: "active",
      }).select("_id departmentId assignmentId").lean();
    }

    // Step 2: Save JobSprint with totalStudents and completedStudents
    const sprintData = {
      ...data,
      startDate, // Use converted Date object
      endDate,   // Use converted Date object
      totalStudents: eligibleStudents.length,
      completedStudents: 0,
      status: "not_started",
    };
    const newJobSprint = await this.jobSprintRepository.create(sprintData);
    const sprintId = String(newJobSprint._id);

    // Step 3: Bulk insert SprintProgress records
    if (eligibleStudents.length > 0) {
      const totalJobs = data.jobIds.length;
      const sprintProgressRecords = eligibleStudents.map((student) => ({
        userId: student._id,
        sprintId: new Types.ObjectId(sprintId),
        departmentId: student.departmentId ? new Types.ObjectId(student.departmentId) : undefined,
        assignmentId: student.assignmentId ? new Types.ObjectId(student.assignmentId) : undefined,
        status: "not_started",
        completedJobsCount: 0,
        totalJobs: totalJobs,
      }));
      await SprintProgressModel.insertMany(sprintProgressRecords);
    }

    // Step 4: Queue FCM notifications for eligible students (non-blocking)
    if (data.organizationId) {
      this.notificationBatchingService
        .queueJobSprintNotification(
          sprintId,
          data.name || "New Job Sprint",
          data.type as "department" | "class",
          data.depIds ? data.depIds.map((id: any) => String(id)) : undefined,
          data.assignmentIds ? data.assignmentIds.map((id: any) => String(id)) : undefined,
          String(data.organizationId)
        )
        .catch((error) => {
          log.error({ err: error }, "Error queueing job sprint notifications:");
          // Don't fail sprint creation if notification queuing fails
        });
    }

    return {
      success: true,
      message: Messages.JOB_SPRINT_CREATED_SUCCESS,
      data: newJobSprint,
    };
  }

  public async getJobSprintsByOrganization(
    organizationId: string,
    query: any = {}
  ): Promise<ServiceResponse> {
    // Always use pagination with defaults: page 1, limit 6
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 6;
    const skip = (page - 1) * limit;

    const jobSprints = await this.jobSprintRepository.findByOrganizationId(
      organizationId,
      skip,
      limit
    );
    const totalCount = await this.jobSprintRepository.getCountByOrganizationId(organizationId);
    const totalPages = Math.ceil(totalCount / limit);
    
    return {
      success: true,
      message: Messages.JOB_SPRINT_FETCH_SUCCESS,
      data: {
        sprints: jobSprints,
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
  }

  public async getJobSprintById(sprintId: string): Promise<ServiceResponse> {
    const sprint = await this.jobSprintRepository.findByIdWithJobs(sprintId);
    
    if (!sprint) {
      return {
        success: false,
        message: "Job sprint not found",
        data: null,
      };
    }
    
    return {
      success: true,
      message: Messages.JOB_SPRINT_FETCH_SUCCESS,
      data: sprint,
    };
  }

  public async deleteJobSprint(sprintId: string): Promise<ServiceResponse> {
    // First delete all sprint progress records linked to this sprint
    await SprintProgressModel.deleteMany({ sprintId: new Types.ObjectId(sprintId) });

    // Then delete the sprint itself
    const deleted = await this.jobSprintRepository.delete(sprintId);

    if (!deleted) {
      return {
        success: false,
        message: "Job sprint not found",
        data: null,
      };
    }

    return {
      success: true,
      message: "Job sprint deleted successfully",
      data: deleted,
    };
  }
}
