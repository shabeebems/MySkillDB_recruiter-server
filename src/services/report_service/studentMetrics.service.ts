import { Types } from "mongoose";
import { ServiceResponse } from "../types";
import { UserRepository } from "../../repositories/user.repository";
import { CVProfileRepository } from "../../repositories/cvProfile.repository";
import { InterviewPlannerRepository } from "../../repositories/interviewPlanner.repository";
import { StudentTestHistoryRepository } from "../../repositories/studentTestHistory.repository";
import { VideoScriptRepository } from "../../repositories/videoScript.repository";
import UserModel from "../../models/user.model";
import CVProfileModel from "../../models/cvProfile.model";
import InterviewPlannerModel from "../../models/interviewPlanner.model";
import StudentTestModel from "../../models/studentTestHistory";
import VideoScriptModel from "../../models/videoScript.model";
import { createChildLogger } from "../../utils/logger";

const log = createChildLogger("StudentMetricsService");


export class StudentMetricsService {
  private userRepository = new UserRepository();
  private cvProfileRepository = new CVProfileRepository();
  private interviewPlannerRepository = new InterviewPlannerRepository();
  private studentTestRepository = new StudentTestHistoryRepository();
  private videoScriptRepository = new VideoScriptRepository();

  /**
   * Get student metrics with efficient aggregation pipeline
   * Handles thousands of students with pagination
   */
  public async getStudentMetrics(
    organizationId: string,
    filters: {
      departmentId?: string;
      classId?: string;
      sectionId?: string; // assignmentId
      search?: string;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }
  ): Promise<ServiceResponse> {
    try {
      const page = parseInt(String(filters.page || 1));
      const limit = parseInt(String(filters.limit || 10));
      const skip = (page - 1) * limit;
      const sortBy = filters.sortBy || "name";
      const sortOrder = filters.sortOrder || "asc";

      // Build match query for students
      const matchQuery: any = {
        organizationId: new Types.ObjectId(organizationId),
        role: "student",
        isBlock: false,
        status: "active",
      };

      if (filters.departmentId) {
        matchQuery.departmentId = new Types.ObjectId(filters.departmentId);
      }

      if (filters.classId) {
        // Note: classId filtering might need to go through Assignment model
        // For now, we'll skip it if not directly available
      }

      if (filters.sectionId) {
        matchQuery.assignmentId = new Types.ObjectId(filters.sectionId);
      }

      // Search filter
      if (filters.search && filters.search.trim()) {
        const searchRegex = { $regex: filters.search.trim(), $options: "i" };
        matchQuery.$or = [
          { name: searchRegex },
          { email: searchRegex },
        ];
      }

      // Build sort object
      const sortObj: any = {};
      if (sortBy === "name") {
        sortObj.name = sortOrder === "asc" ? 1 : -1;
      } else if (sortBy === "hasProfile") {
        sortObj.hasProfile = sortOrder === "asc" ? 1 : -1;
      } else if (sortBy === "jobsInInterviewPlanner") {
        sortObj.jobsInInterviewPlanner = sortOrder === "asc" ? 1 : -1;
      } else if (sortBy === "assessmentsTaken") {
        sortObj.assessmentsTaken = sortOrder === "asc" ? 1 : -1;
      } else if (sortBy === "activeScriptsCreated") {
        sortObj.activeScriptsCreated = sortOrder === "asc" ? 1 : -1;
      } else if (sortBy === "lastLogin") {
        sortObj.lastLogin = sortOrder === "asc" ? 1 : -1;
      } else {
        sortObj.name = 1; // Default sort
      }

      // Use aggregation pipeline for efficient querying
      const pipeline: any[] = [
        // Match students
        { $match: matchQuery },

        // Lookup CV profiles
        {
          $lookup: {
            from: "cvprofiles",
            localField: "_id",
            foreignField: "userId",
            as: "profile",
          },
        },

        // Lookup interview planner jobs
        {
          $lookup: {
            from: "interviewplanners",
            localField: "_id",
            foreignField: "userId",
            as: "interviewPlannerJobs",
          },
        },

        // Lookup completed assessments
        {
          $lookup: {
            from: "studenttests",
            localField: "_id",
            foreignField: "userId",
            pipeline: [
              { $match: { status: "Completed" } },
            ],
            as: "completedAssessments",
          },
        },

        // Lookup video scripts
        {
          $lookup: {
            from: "videoscripts",
            localField: "_id",
            foreignField: "userId",
            as: "videoScripts",
          },
        },

        // Project computed fields
        {
          $project: {
            _id: 1,
            name: 1,
            email: 1,
            mobile: 1,
            profilePicture: 1,
            createdAt: 1,
            lastLogin: 1,
            hasProfile: { $gt: [{ $size: "$profile" }, 0] },
            jobsInInterviewPlanner: { $size: "$interviewPlannerJobs" },
            assessmentsTaken: { $size: "$completedAssessments" },
            activeScriptsCreated: { $size: "$videoScripts" },
          },
        },

        // Sort
        { $sort: sortObj },
      ];

      // Get total count (before pagination)
      const countPipeline = [
        ...pipeline,
        { $count: "total" },
      ];
      const countResult = await UserModel.aggregate(countPipeline);
      const totalCount = countResult[0]?.total || 0;

      // Add pagination
      pipeline.push(
        { $skip: skip },
        { $limit: limit }
      );

      // Execute aggregation
      const students = await UserModel.aggregate(pipeline);

      // Calculate summary statistics
      const summaryPipeline = [
        { $match: matchQuery },
        {
          $lookup: {
            from: "cvprofiles",
            localField: "_id",
            foreignField: "userId",
            as: "profile",
          },
        },
        {
          $lookup: {
            from: "interviewplanners",
            localField: "_id",
            foreignField: "userId",
            as: "interviewPlannerJobs",
          },
        },
        {
          $lookup: {
            from: "studenttests",
            localField: "_id",
            foreignField: "userId",
            pipeline: [{ $match: { status: "Completed" } }],
            as: "completedAssessments",
          },
        },
        {
          $project: {
            hasProfile: { $gt: [{ $size: "$profile" }, 0] },
            jobsInInterviewPlanner: { $size: "$interviewPlannerJobs" },
            assessmentsTaken: { $size: "$completedAssessments" },
          },
        },
        {
          $group: {
            _id: null,
            totalStudents: { $sum: 1 },
            profilesCreated: { $sum: { $cond: ["$hasProfile", 1, 0] } },
            avgJobsInPlanner: { $avg: "$jobsInInterviewPlanner" },
            avgAssessments: { $avg: "$assessmentsTaken" },
          },
        },
      ];

      const summaryResult = await UserModel.aggregate(summaryPipeline);
      const summary = summaryResult[0] || {
        totalStudents: 0,
        profilesCreated: 0,
        avgJobsInPlanner: 0,
        avgAssessments: 0,
      };

      const totalPages = Math.ceil(totalCount / limit);

      return {
        success: true,
        message: "Student metrics fetched successfully",
        data: {
          students: students.map((student) => ({
            _id: student._id,
            name: student.name,
            email: student.email,
            mobile: student.mobile,
            profilePicture: student.profilePicture,
            hasProfile: student.hasProfile,
            jobsInInterviewPlanner: student.jobsInInterviewPlanner,
            assessmentsTaken: student.assessmentsTaken,
            activeScriptsCreated: student.activeScriptsCreated,
            lastLogin: student.lastLogin || student.createdAt,
            createdAt: student.createdAt,
          })),
          pagination: {
            currentPage: page,
            totalPages,
            totalCount,
            hasNext: page < totalPages,
            hasPrev: page > 1,
            limit,
          },
          summary: {
            totalStudents: summary.totalStudents,
            profilesCreated: summary.profilesCreated,
            avgJobsInPlanner: Math.round(summary.avgJobsInPlanner || 0),
            avgAssessments: Math.round(summary.avgAssessments || 0),
          },
        },
      };
    } catch (error) {
      log.error({ err: error }, "Error fetching student metrics:");
      return {
        success: false,
        message: "Failed to fetch student metrics",
        data: null,
      };
    }
  }

  /**
   * Get student metrics without pagination (for exports or bulk operations)
   */
  public async getAllStudentMetrics(
    organizationId: string,
    filters: {
      departmentId?: string;
      classId?: string;
      sectionId?: string;
      search?: string;
    }
  ): Promise<ServiceResponse> {
    try {
      // Build match query
      const matchQuery: any = {
        organizationId: new Types.ObjectId(organizationId),
        role: "student",
        isBlock: false,
        status: "active",
      };

      if (filters.departmentId) {
        matchQuery.departmentId = new Types.ObjectId(filters.departmentId);
      }

      if (filters.sectionId) {
        matchQuery.assignmentId = new Types.ObjectId(filters.sectionId);
      }

      if (filters.search && filters.search.trim()) {
        const searchRegex = { $regex: filters.search.trim(), $options: "i" };
        matchQuery.$or = [
          { name: searchRegex },
          { email: searchRegex },
        ];
      }

      const pipeline: any[] = [
        { $match: matchQuery },
        {
          $lookup: {
            from: "cvprofiles",
            localField: "_id",
            foreignField: "userId",
            as: "profile",
          },
        },
        {
          $lookup: {
            from: "interviewplanners",
            localField: "_id",
            foreignField: "userId",
            as: "interviewPlannerJobs",
          },
        },
        {
          $lookup: {
            from: "studenttests",
            localField: "_id",
            foreignField: "userId",
            pipeline: [{ $match: { status: "Completed" } }],
            as: "completedAssessments",
          },
        },
        {
          $lookup: {
            from: "videoscripts",
            localField: "_id",
            foreignField: "userId",
            as: "videoScripts",
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            email: 1,
            mobile: 1,
            profilePicture: 1,
            createdAt: 1,
            lastLogin: 1,
            hasProfile: { $gt: [{ $size: "$profile" }, 0] },
            jobsInInterviewPlanner: { $size: "$interviewPlannerJobs" },
            assessmentsTaken: { $size: "$completedAssessments" },
            activeScriptsCreated: { $size: "$videoScripts" },
          },
        },
        { $sort: { name: 1 } },
      ];

      const students = await UserModel.aggregate(pipeline);

      return {
        success: true,
        message: "Student metrics fetched successfully",
        data: students.map((student) => ({
          _id: student._id,
          name: student.name,
          email: student.email,
          mobile: student.mobile,
          profilePicture: student.profilePicture,
          hasProfile: student.hasProfile,
          jobsInInterviewPlanner: student.jobsInInterviewPlanner,
          assessmentsTaken: student.assessmentsTaken,
          activeScriptsCreated: student.activeScriptsCreated,
          lastLogin: student.lastLogin || student.createdAt,
          createdAt: student.createdAt,
        })),
      };
    } catch (error) {
      log.error({ err: error }, "Error fetching all student metrics:");
      return {
        success: false,
        message: "Failed to fetch student metrics",
        data: null,
      };
    }
  }
}

