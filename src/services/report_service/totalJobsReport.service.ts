import { Types } from "mongoose";
import { ServiceResponse } from "../types";
import JobModel from "../../models/job.model";
import InterviewPlannerModel from "../../models/interviewPlanner.model";
import UserModel from "../../models/user.model";
import DepartmentModel from "../../models/department.model";
import { createChildLogger } from "../../utils/logger";

const log = createChildLogger("TotalJobsReportService");


export class TotalJobsReportService {
  /**
   * Get total jobs report with company statistics and student engagement
   * Handles large datasets with efficient aggregation pipelines
   */
  public async getTotalJobsReport(
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
      const sortBy = filters.sortBy || "totalJobs";
      const sortOrder = filters.sortOrder || "desc";

      // Build match query for jobs
      const jobMatchQuery: any = {
        organizationId: new Types.ObjectId(organizationId),
        isActive: { $ne: false }, // Include active jobs (null or true)
      };

      // Filter by department if specified (departmentIds is an array)
      if (filters.departmentId) {
        jobMatchQuery.departmentIds = new Types.ObjectId(filters.departmentId);
      }

      // Build match query for students (for engagement rate calculation)
      const studentMatchQuery: any = {
        organizationId: new Types.ObjectId(organizationId),
        role: "student",
        isBlock: false,
        status: "active",
      };

      if (filters.departmentId) {
        studentMatchQuery.departmentId = new Types.ObjectId(filters.departmentId);
      }

      if (filters.sectionId) {
        studentMatchQuery.assignmentId = new Types.ObjectId(filters.sectionId);
      }

      // Main aggregation pipeline to get company statistics
      const companyPipeline: any[] = [
        // Match jobs
        { $match: jobMatchQuery },

        // Unwind departmentIds to handle array properly
        { $unwind: "$departmentIds" },

        // Group by company
        {
          $group: {
            _id: "$companyId",
            companyName: { $first: "$companyName" },
            companyIdRef: { $first: "$companyId" },
            totalJobs: { $sum: 1 },
            jobIds: { $addToSet: "$_id" },
            departmentIds: { $addToSet: "$departmentIds" },
          },
        },

        // Lookup interview planners for these jobs
        {
          $lookup: {
            from: "interviewplanners",
            localField: "jobIds",
            foreignField: "jobId",
            as: "interviewPlanners",
          },
        },

        // Count unique users who added jobs
        {
          $addFields: {
            userIds: {
              $setUnion: "$interviewPlanners.userId",
            },
          },
        },

        // Project fields
        {
          $project: {
            companyId: "$_id",
            companyName: 1,
            totalJobs: 1,
            departmentIds: 1,
            jobIds: 1,
            studentsAdded: { $size: "$userIds" },
          },
        },
      ];

      // Get all companies (before filtering and pagination)
      const allCompanies = await JobModel.aggregate(companyPipeline);

      // Get department breakdown for each company
      const companiesWithDetails = await Promise.all(
        allCompanies.map(async (company) => {
          // Get department breakdown
          const deptBreakdown = await JobModel.aggregate([
            {
              $match: {
                organizationId: new Types.ObjectId(organizationId),
                companyId: company.companyId,
                isActive: { $ne: false },
                ...(filters.departmentId && {
                  departmentIds: { $in: [new Types.ObjectId(filters.departmentId)] },
                }),
              },
            },
            { $unwind: "$departmentIds" },
            {
              $group: {
                _id: "$departmentIds",
                jobCount: { $sum: 1 },
              },
            },
            {
              $lookup: {
                from: "departments",
                localField: "_id",
                foreignField: "_id",
                as: "department",
              },
            },
            {
              $project: {
                departmentId: "$_id",
                departmentName: { $arrayElemAt: ["$department.name", 0] },
                jobCount: 1,
              },
            },
          ]);

          // Calculate total students in departments for engagement rate
          let totalStudents = 0;
          if (company.departmentIds && company.departmentIds.length > 0) {
            const deptStudentQuery: any = {
              ...studentMatchQuery,
              departmentId: { $in: company.departmentIds },
            };
            totalStudents = await UserModel.countDocuments(deptStudentQuery);
          }

          // Calculate engagement rate
          const engagementRate =
            totalStudents > 0
              ? parseFloat(((company.studentsAdded / totalStudents) * 100).toFixed(1))
              : 0;

          return {
            companyId: company.companyId?.toString() || company.companyId,
            companyName: company.companyName || "Unknown Company",
            totalJobs: company.totalJobs,
            departments: deptBreakdown.map((dept) => ({
              departmentId: dept.departmentId?.toString() || dept.departmentId,
              departmentName: dept.departmentName || "Unknown Department",
              jobCount: dept.jobCount,
            })),
            studentsAdded: company.studentsAdded,
            engagementRate,
          };
        })
      );

      // Filter by search query
      let filteredCompanies = companiesWithDetails;
      if (filters.search && filters.search.trim()) {
        const searchLower = filters.search.trim().toLowerCase();
        filteredCompanies = filteredCompanies.filter((company) =>
          company.companyName.toLowerCase().includes(searchLower)
        );
      }

      // Sort companies
      filteredCompanies.sort((a, b) => {
        let aValue: any, bValue: any;

        switch (sortBy) {
          case "company":
            aValue = a.companyName.toLowerCase();
            bValue = b.companyName.toLowerCase();
            return sortOrder === "asc"
              ? aValue.localeCompare(bValue)
              : bValue.localeCompare(aValue);

          case "totalJobs":
            aValue = a.totalJobs;
            bValue = b.totalJobs;
            break;

          case "departments":
            aValue = a.departments.length;
            bValue = b.departments.length;
            break;

          case "studentsAdded":
            aValue = a.studentsAdded;
            bValue = b.studentsAdded;
            break;

          case "engagementRate":
            aValue = a.engagementRate;
            bValue = b.engagementRate;
            break;

          default:
            aValue = a.totalJobs;
            bValue = b.totalJobs;
        }

        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      });

      // Get total count before pagination
      const totalCount = filteredCompanies.length;

      // Apply pagination
      const paginatedCompanies = filteredCompanies.slice(skip, skip + limit);

      // Calculate summary statistics
      const summary = await this.calculateSummary(
        organizationId,
        jobMatchQuery,
        studentMatchQuery
      );

      const totalPages = Math.ceil(totalCount / limit);

      return {
        success: true,
        message: "Total jobs report fetched successfully",
        data: {
          summary,
          companies: paginatedCompanies,
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
    } catch (error) {
      log.error({ err: error }, "Error fetching total jobs report:");
      return {
        success: false,
        message: "Failed to fetch total jobs report",
        data: null,
      };
    }
  }

  /**
   * Calculate summary statistics
   */
  private async calculateSummary(
    organizationId: string,
    jobMatchQuery: any,
    studentMatchQuery: any
  ): Promise<{
    totalCompanies: number;
    totalJobs: number;
    totalDepartments: number;
    totalStudentsEngaged: number;
  }> {
    try {
      // Get total companies (distinct companyIds from jobs)
      const totalCompanies = await JobModel.distinct("companyId", jobMatchQuery).then(
        (companies) => companies.filter((c) => c !== null && c !== undefined).length
      );

      // Get total jobs
      const totalJobs = await JobModel.countDocuments(jobMatchQuery);

      // Get total departments
      const totalDepartments = await DepartmentModel.countDocuments({
        organizationId: new Types.ObjectId(organizationId),
      });

      // Get all job IDs for the organization
      const jobIds = await JobModel.find(jobMatchQuery).distinct("_id");

      // Get unique students who added any of these jobs to interview planner
      const totalStudentsEngaged =
        jobIds.length > 0
          ? (
              await InterviewPlannerModel.distinct("userId", {
                jobId: { $in: jobIds },
              })
            ).length
          : 0;

      return {
        totalCompanies,
        totalJobs,
        totalDepartments,
        totalStudentsEngaged,
      };
    } catch (error) {
      log.error({ err: error }, "Error calculating summary:");
      return {
        totalCompanies: 0,
        totalJobs: 0,
        totalDepartments: 0,
        totalStudentsEngaged: 0,
      };
    }
  }

  /**
   * Get total jobs report without pagination (for exports)
   */
  public async getAllTotalJobsReport(
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
      const jobMatchQuery: any = {
        organizationId: new Types.ObjectId(organizationId),
        isActive: { $ne: false },
      };

      if (filters.departmentId) {
        jobMatchQuery.departmentIds = new Types.ObjectId(filters.departmentId);
      }

      const companyPipeline: any[] = [
        { $match: jobMatchQuery },
        { $unwind: "$departmentIds" },
        {
          $group: {
            _id: "$companyId",
            companyName: { $first: "$companyName" },
            companyIdRef: { $first: "$companyId" },
            totalJobs: { $sum: 1 },
            jobIds: { $addToSet: "$_id" },
            departmentIds: { $addToSet: "$departmentIds" },
          },
        },
        {
          $lookup: {
            from: "interviewplanners",
            localField: "jobIds",
            foreignField: "jobId",
            as: "interviewPlanners",
          },
        },
        {
          $addFields: {
            userIds: {
              $setUnion: "$interviewPlanners.userId",
            },
          },
        },
        {
          $project: {
            companyId: "$_id",
            companyName: 1,
            totalJobs: 1,
            departmentIds: 1,
            jobIds: 1,
            studentsAdded: { $size: "$userIds" },
          },
        },
      ];

      const allCompanies = await JobModel.aggregate(companyPipeline);

      // Get department breakdown and engagement rates
      const companiesWithDetails = await Promise.all(
        allCompanies.map(async (company) => {
          const deptBreakdown = await JobModel.aggregate([
            {
              $match: {
                organizationId: new Types.ObjectId(organizationId),
                companyId: company.companyId,
                isActive: { $ne: false },
                ...(filters.departmentId && {
                  departmentIds: { $in: [new Types.ObjectId(filters.departmentId)] },
                }),
              },
            },
            { $unwind: "$departmentIds" },
            {
              $group: {
                _id: "$departmentIds",
                jobCount: { $sum: 1 },
              },
            },
            {
              $lookup: {
                from: "departments",
                localField: "_id",
                foreignField: "_id",
                as: "department",
              },
            },
            {
              $project: {
                departmentId: "$_id",
                departmentName: { $arrayElemAt: ["$department.name", 0] },
                jobCount: 1,
              },
            },
          ]);

          // Calculate engagement rate
          let totalStudents = 0;
          if (company.departmentIds && company.departmentIds.length > 0) {
            totalStudents = await UserModel.countDocuments({
              organizationId: new Types.ObjectId(organizationId),
              role: "student",
              isBlock: false,
              status: "active",
              departmentId: { $in: company.departmentIds },
              ...(filters.departmentId && {
                departmentId: new Types.ObjectId(filters.departmentId),
              }),
              ...(filters.sectionId && {
                assignmentId: new Types.ObjectId(filters.sectionId),
              }),
            });
          }

          const engagementRate =
            totalStudents > 0
              ? parseFloat(((company.studentsAdded / totalStudents) * 100).toFixed(1))
              : 0;

          return {
            companyId: company.companyId?.toString() || company.companyId,
            companyName: company.companyName || "Unknown Company",
            totalJobs: company.totalJobs,
            departments: deptBreakdown.map((dept) => ({
              departmentId: dept.departmentId?.toString() || dept.departmentId,
              departmentName: dept.departmentName || "Unknown Department",
              jobCount: dept.jobCount,
            })),
            studentsAdded: company.studentsAdded,
            engagementRate,
          };
        })
      );

      // Filter by search
      let filteredCompanies = companiesWithDetails;
      if (filters.search && filters.search.trim()) {
        const searchLower = filters.search.trim().toLowerCase();
        filteredCompanies = filteredCompanies.filter((company) =>
          company.companyName.toLowerCase().includes(searchLower)
        );
      }

      // Sort by totalJobs desc by default
      filteredCompanies.sort((a, b) => b.totalJobs - a.totalJobs);

      return {
        success: true,
        message: "Total jobs report fetched successfully",
        data: filteredCompanies,
      };
    } catch (error) {
      log.error({ err: error }, "Error fetching all total jobs report:");
      return {
        success: false,
        message: "Failed to fetch total jobs report",
        data: null,
      };
    }
  }
}

