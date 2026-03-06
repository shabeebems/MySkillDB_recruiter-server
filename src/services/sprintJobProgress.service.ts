import { SprintJobProgressRepository } from "../repositories/sprintJobProgress.repository";
import { SprintProgressRepository } from "../repositories/sprintProgress.repository";
import { Messages } from "../constants/messages";
import { ServiceResponse } from "./types";
import JobSprintModel from "../models/jobSprint.model";
import JobModel from "../models/job.model";
import { Types } from "mongoose";
import { createChildLogger } from "../utils/logger";

const log = createChildLogger("SprintJobProgressService");


export class SprintJobProgressService {
  private sprintJobProgressRepository = new SprintJobProgressRepository();
  private sprintProgressRepository = new SprintProgressRepository();

  /**
   * Check if job should be marked as completed
   * Conditions: flipCardProgress >= 50, assessmentProgress >= 50, videoCvStatus === "completed"
   * @param progress - The progress record
   * @returns true if all conditions are met
   */
  private shouldMarkAsCompleted(progress: any): boolean {
    const flipCardProgress = progress.flipCardProgress || 0;
    const assessmentProgress = progress.assessmentProgress || 0;
    const videoCvStatus = progress.videoCvStatus || "pending";

    return (
      flipCardProgress >= 50 &&
      assessmentProgress >= 50 &&
      videoCvStatus === "completed"
    );
  }

  /**
   * Update JobSprint's completedStudents count and completionPercentage
   * @param sprintId - The sprint's ObjectId
   * @param increment - true to increment, false to decrement
   */
  private async updateJobSprintCompletedStudents(
    sprintId: string,
    increment: boolean
  ): Promise<void> {
    try {
      const sprint = await JobSprintModel.findById(sprintId);
      if (sprint) {
        const currentCount = sprint.completedStudents || 0;
        const totalStudents = sprint.totalStudents || 0;
        const newCount = increment
          ? currentCount + 1
          : Math.max(0, currentCount - 1);
        
        // Calculate completion percentage based on totalStudents and completedStudents
        const completionPercentage = totalStudents > 0
          ? Math.min(100, Math.max(0, (newCount / totalStudents) * 100))
          : 0;
        
        // Determine status based on completion percentage
        let status = sprint.status || "not_started";
        if (completionPercentage >= 100) {
          status = "completed";
        } else if (completionPercentage > 0 || newCount > 0) {
          status = "in_progress";
        } else {
          status = "not_started";
        }
        
        await JobSprintModel.findByIdAndUpdate(sprintId, {
          completedStudents: newCount,
          completionPercentage: completionPercentage,
          status: status,
        });
      }
    } catch (error) {
      log.error({ err: error }, 'Error updating JobSprint completedStudents:');
      // Don't throw - this is a side effect that shouldn't break the main flow
    }
  }

  /**
   * Update job status to completed if all conditions are met
   * Also increments completedJobsCount in sprintProgress when status changes from pending to completed
   * @param progressId - The progress record ID
   * @param progress - The progress record
   */
  private async updateJobStatusIfCompleted(
    progressId: string,
    progress: any
  ): Promise<void> {
    // Only update if conditions are met and status is not already completed
    if (this.shouldMarkAsCompleted(progress) && progress.status !== "completed") {
      const wasPending = progress.status === "pending";
      
      await this.sprintJobProgressRepository.update(progressId, {
        status: "completed",
        completedAt: new Date(),
      } as any);
      
      // Increment completedJobsCount in sprintProgress only if status changed from pending to completed
      if (wasPending) {
        const sprintProgress = await this.sprintProgressRepository.findByUserIdAndSprintId(
          progress.userId.toString(),
          progress.sprintId.toString()
        );
        
        if (sprintProgress) {
          const sprintProgressId = (sprintProgress as any)._id?.toString() || "";
          const previousStatus = sprintProgress.status;
          const newCompletedJobsCount = (sprintProgress.completedJobsCount || 0) + 1;
          const totalJobs = sprintProgress.totalJobs || 0;
          
          // Update completedJobsCount and check if all jobs are completed
          const updateData: any = {
            completedJobsCount: newCompletedJobsCount,
          };
          
          // If all jobs are completed, set status to "completed"
          if (newCompletedJobsCount >= totalJobs && sprintProgress.status !== "completed") {
            updateData.status = "completed";
          } else if (sprintProgress.status === "not_started" && newCompletedJobsCount > 0) {
            // If at least one job is completed, set status to "in_progress"
            updateData.status = "in_progress";
          }
          
          await this.sprintProgressRepository.update(sprintProgressId, updateData);
          
          // Update JobSprint's completedStudents count if status changed to "completed"
          if (updateData.status === "completed" && previousStatus !== "completed") {
            await this.updateJobSprintCompletedStudents(
              progress.sprintId.toString(),
              true
            );
          }
        }
      }
    }
  }

  /**
   * Get all jobs for a sprint with progress
   * Creates SprintJobProgress records if they don't exist
   * @param userId - The user's ObjectId
   * @param sprintId - The sprint's ObjectId
   * @returns ServiceResponse with jobs and their progress
   */
  public async getSprintJobsWithProgress(
    userId: string,
    sprintId: string
  ): Promise<ServiceResponse> {
    try {
      // Step 1: Get the sprint to find jobIds
      const sprint = await JobSprintModel.findById(sprintId).exec();
      
      if (!sprint) {
        return {
          success: false,
          message: "Sprint not found",
          data: null,
        };
      }

      // Step 2: Get all jobs for this sprint
      const jobIds = sprint.jobIds || [];
      const jobs = await JobModel.find({
        _id: { $in: jobIds },
      }).exec();

      // Step 3: Get existing progress records for this student and sprint
      const existingProgress = await this.sprintJobProgressRepository.findByUserIdAndSprintId(
        userId,
        sprintId
      );

      // Step 4: Check which jobs don't have progress records and create them
      // Normalize all IDs to strings for comparison
      const existingJobIds = new Set(
        existingProgress.map((p) => {
          const jobId = p.jobId;
          return jobId instanceof Types.ObjectId 
            ? jobId.toString() 
            : String(jobId);
        })
      );

      const missingJobIds = jobIds.filter((jobId) => {
        const jobIdStr = jobId instanceof Types.ObjectId 
          ? jobId.toString() 
          : String(jobId);
        return !existingJobIds.has(jobIdStr);
      });

      if (missingJobIds.length > 0) {
        // Create missing progress records one by one to handle duplicates gracefully
        // This prevents race conditions and duplicate key errors
        for (const jobId of missingJobIds) {
          try {
            const jobIdObj = jobId instanceof Types.ObjectId 
              ? jobId 
              : new Types.ObjectId(String(jobId));
            
            // Check if record already exists (in case of race condition)
            const existing = await this.sprintJobProgressRepository.findByUserSprintAndJob(
              userId,
              sprintId,
              jobIdObj.toString()
            );

            // Only create if it doesn't exist
            if (!existing) {
              await this.sprintJobProgressRepository.create({
                userId: new Types.ObjectId(userId) as any,
                sprintId: new Types.ObjectId(sprintId) as any,
                jobId: jobIdObj as any,
                status: "pending",
              });
            }
          } catch (error: any) {
            // Ignore duplicate key errors (E11000) - record might have been created by another request
            if (error.code !== 11000) {
              log.error({ err: error }, `Error creating progress record for job ${jobId}:`);
              // Continue with other records even if one fails
            }
          }
        }
      }

      // Step 5: Fetch all progress records again (including newly created ones)
      // Don't populate jobId since we only need IDs for comparison
      const allProgress = await this.sprintJobProgressRepository.findByUserIdAndSprintId(
        userId,
        sprintId
      );

      // Step 6: Combine jobs with their progress
      const jobsWithProgress = jobs.map((job: any) => {
        const jobId = (job._id as any)?.toString() || job._id?.toString() || "";
        const progress = allProgress.find((p) => {
          // jobId is an ObjectId (not populated), so we can directly compare
          const progressJobId = p.jobId.toString();
          return progressJobId === jobId;
        });
         return {
           jobId: jobId,
           name: job.name,
           status: progress?.status || "pending",
           flipCardProgress: progress?.flipCardProgress || 0,
           assessmentProgress: progress?.assessmentProgress || 0,
           videoCvStatus: progress?.videoCvStatus || "pending",
           completedAt: progress?.completedAt || null,
           createdAt: progress?.createdAt || null,
           progressId: (progress as any)?._id?.toString() || null,
         };
      });

      return {
        success: true,
        message: "Sprint jobs fetched successfully",
        data: {
          sprint: {
            id: (sprint as any)._id?.toString() || sprint._id?.toString() || "",
            name: sprint.name,
            type: sprint.type,
            startDate: sprint.startDate,
            endDate: sprint.endDate,
          },
          jobs: jobsWithProgress,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to fetch sprint jobs",
        data: null,
      };
    }
  }

  /**
   * Get a specific job's progress details
   * @param userId - The user's ObjectId
   * @param sprintId - The sprint's ObjectId
   * @param jobId - The job's ObjectId
   * @returns ServiceResponse with job progress details
   */
  public async getJobProgress(
    userId: string,
    sprintId: string,
    jobId: string
  ): Promise<ServiceResponse> {
    try {
      const progress = await this.sprintJobProgressRepository.findByUserSprintAndJob(
        userId,
        sprintId,
        jobId
      );

      if (!progress) {
        return {
          success: false,
          message: "Job progress not found",
          data: null,
        };
      }

      // Check if video CV exists and update status if needed
      const { VideoCvRepository } = await import("../repositories/videoCv.repository");
      const videoCvRepository = new VideoCvRepository();
      const videoCv = await videoCvRepository.findByUserIdAndJobId(userId, jobId);
      
      let videoCvStatus = progress.videoCvStatus || "pending";
      let videoCvLink = null;
      
      // If video CV exists, update status to completed
      if (videoCv && videoCv.link) {
        videoCvLink = videoCv.link;
        if (videoCvStatus === "pending") {
          videoCvStatus = "completed";
          // Update the progress record
          const progressId = (progress as any)._id?.toString() || "";
          await this.sprintJobProgressRepository.update(progressId, {
            videoCvStatus: "completed",
          } as any);
          
          // Refresh progress to get updated videoCvStatus
          const updatedProgress = await this.sprintJobProgressRepository.findById(progressId);
          if (updatedProgress) {
            // Check and update job status if all conditions are met
            await this.updateJobStatusIfCompleted(progressId, updatedProgress);
          }
        }
      }

      // Refresh progress to get latest status
      const finalProgress = await this.sprintJobProgressRepository.findByUserSprintAndJob(
        userId,
        sprintId,
        jobId
      );

      // Check and update job status if all conditions are met
      if (finalProgress) {
        const progressId = (finalProgress as any)._id?.toString() || "";
        await this.updateJobStatusIfCompleted(progressId, finalProgress);
        
        // Fetch again to get updated status
        const updatedFinalProgress = await this.sprintJobProgressRepository.findById(progressId);

        return {
          success: true,
          message: "Job progress fetched successfully",
          data: {
            progressId: progressId || null,
            status: updatedFinalProgress?.status || finalProgress.status,
            flipCardProgress: updatedFinalProgress?.flipCardProgress || finalProgress.flipCardProgress || 0,
            assessmentProgress: updatedFinalProgress?.assessmentProgress || finalProgress.assessmentProgress || 0,
            videoCvStatus: videoCvStatus,
            videoCvLink: videoCvLink,
            completedAt: updatedFinalProgress?.completedAt || finalProgress.completedAt || null,
            createdAt: updatedFinalProgress?.createdAt || finalProgress.createdAt || null,
          },
        };
      }

      return {
        success: true,
        message: "Job progress fetched successfully",
        data: {
          progressId: (progress as any)._id?.toString() || null,
          status: progress.status,
          flipCardProgress: progress.flipCardProgress || 0,
          assessmentProgress: progress.assessmentProgress || 0,
          videoCvStatus: videoCvStatus,
          videoCvLink: videoCvLink,
          completedAt: progress.completedAt || null,
          createdAt: progress.createdAt || null,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to fetch job progress",
        data: null,
      };
    }
  }

  /**
   * Update flip card progress for a job
   * Only updates if new progress is higher than existing
   * @param userId - The user's ObjectId
   * @param sprintId - The sprint's ObjectId
   * @param jobId - The job's ObjectId
   * @param flipCardProgress - The new flip card progress (0-100)
   * @returns ServiceResponse
   */
  public async updateFlipCardProgress(
    userId: string,
    sprintId: string,
    jobId: string,
    flipCardProgress: number
  ): Promise<ServiceResponse> {
    try {
      const progress = await this.sprintJobProgressRepository.findByUserSprintAndJob(
        userId,
        sprintId,
        jobId
      );

      if (!progress) {
        return {
          success: false,
          message: "Job progress not found",
          data: null,
        };
      }

      const existingProgress = progress.flipCardProgress || 0;
      
      // Only update if new progress is higher
      if (flipCardProgress > existingProgress) {
        const progressId = (progress as any)._id?.toString() || "";
        const updatedFlipCardProgress = Math.min(100, Math.max(0, flipCardProgress));
        await this.sprintJobProgressRepository.update(progressId, {
          flipCardProgress: updatedFlipCardProgress,
        } as any);
        
        // Fetch updated progress and check if job should be marked as completed
        const updatedProgress = await this.sprintJobProgressRepository.findById(progressId);
        if (updatedProgress) {
          await this.updateJobStatusIfCompleted(progressId, updatedProgress);
        }
      }

      return {
        success: true,
        message: "Flip card progress updated successfully",
        data: null,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to update flip card progress",
        data: null,
      };
    }
  }

  /**
   * Update assessment progress for a job
   * Only updates if new progress is higher than existing
   * @param userId - The user's ObjectId
   * @param sprintId - The sprint's ObjectId
   * @param jobId - The job's ObjectId
   * @param assessmentProgress - The new assessment progress (0-100)
   * @returns ServiceResponse
   */
  public async updateAssessmentProgress(
    userId: string,
    sprintId: string,
    jobId: string,
    assessmentProgress: number
  ): Promise<ServiceResponse> {
    try {
      const progress = await this.sprintJobProgressRepository.findByUserSprintAndJob(
        userId,
        sprintId,
        jobId
      );

      if (!progress) {
        return {
          success: false,
          message: "Job progress not found",
          data: null,
        };
      }

      const existingProgress = progress.assessmentProgress || 0;
      
      // Only update if new progress is higher
      if (assessmentProgress > existingProgress) {
        const progressId = (progress as any)._id?.toString() || "";
        const updatedAssessmentProgress = Math.min(100, Math.max(0, assessmentProgress));
        await this.sprintJobProgressRepository.update(progressId, {
          assessmentProgress: updatedAssessmentProgress,
        } as any);
        
        // Fetch updated progress and check if job should be marked as completed
        const updatedProgress = await this.sprintJobProgressRepository.findById(progressId);
        if (updatedProgress) {
          await this.updateJobStatusIfCompleted(progressId, updatedProgress);
        }
      }

      return {
        success: true,
        message: "Assessment progress updated successfully",
        data: null,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to update assessment progress",
        data: null,
      };
    }
  }

  /**
   * Update video CV link and status for a job
   * Saves to videoCv model and updates sprintJobProgress status
   * @param userId - The user's ObjectId
   * @param sprintId - The sprint's ObjectId
   * @param jobId - The job's ObjectId
   * @param videoCvLink - The video CV link URL
   * @returns ServiceResponse
   */
  public async updateVideoCvLink(
    userId: string,
    sprintId: string,
    jobId: string,
    videoCvLink: string
  ): Promise<ServiceResponse> {
    try {
      // Save to videoCv model
      const { VideoCvRepository } = await import("../repositories/videoCv.repository");
      const videoCvRepository = new VideoCvRepository();
      await videoCvRepository.createOrUpdate(userId, jobId, videoCvLink);

      // Update sprintJobProgress status
      const progress = await this.sprintJobProgressRepository.findByUserSprintAndJob(
        userId,
        sprintId,
        jobId
      );

      if (progress) {
        const progressId = (progress as any)._id?.toString() || "";
        await this.sprintJobProgressRepository.update(progressId, {
          videoCvStatus: "completed",
        } as any);
        
        // Fetch updated progress and check if job should be marked as completed
        const updatedProgress = await this.sprintJobProgressRepository.findById(progressId);
        if (updatedProgress) {
          await this.updateJobStatusIfCompleted(progressId, updatedProgress);
        }
      }

      return {
        success: true,
        message: "Video CV link updated successfully",
        data: null,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to update video CV link",
        data: null,
      };
    }
  }
}

