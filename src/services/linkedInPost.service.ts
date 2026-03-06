import { Types } from "mongoose";
import { LinkedInPostRepository } from "../repositories/linkedInPost.repository";
import { ServiceResponse } from "./types";
import { Messages } from "../constants/messages";
import { ILinkedInPost } from "../models/linkedInPost.model";
import { createChildLogger } from "../utils/logger";

const log = createChildLogger("LinkedInPostService");


export class LinkedInPostService {
  private linkedInPostRepository = new LinkedInPostRepository();

  public async createLinkedInPost(
    userId: string | undefined,
    data: {
      jobId: string;
      skillId: string;
      interviewPlannerId: string;
      topic: string;
      postText: string;
      userTopic: string;
      userContext?: string;
    }
  ): Promise<ServiceResponse> {
    if (!userId || !data.jobId || !data.skillId || !data.topic || !data.postText || !data.userTopic) {
      return {
        success: false,
        message: "userId, jobId, skillId, topic, postText, and userTopic are required",
        data: null,
      };
    }

    try {
      // Create LinkedIn post
      const linkedInPost = await this.linkedInPostRepository.create({
        userId: new Types.ObjectId(userId) as any,
        jobId: new Types.ObjectId(data.jobId) as any,
        skillId: new Types.ObjectId(data.skillId) as any,
        topic: data.topic.trim(),
        postText: data.postText.trim(),
        userTopic: data.userTopic.trim(),
        userContext: data.userContext?.trim() || undefined,
      } as Partial<ILinkedInPost>);

      return {
        success: true,
        message: Messages.LINKEDIN_POST_CREATED_SUCCESS || "LinkedIn post created successfully",
        data: linkedInPost,
      };
    } catch (error) {
      log.error({ err: error }, "Error creating LinkedIn post:");
      return {
        success: false,
        message: "Failed to create LinkedIn post",
        data: null,
      };
    }
  }

  public async getLinkedInPostsByStudentJobAndSkill(
    userId: string | undefined,
    jobId: string,
    skillId: string
  ): Promise<ServiceResponse> {
    if (!userId || !jobId || !skillId) {
      return {
        success: false,
        message: "userId, jobId and skillId are required",
        data: null,
      };
    }

    try {
      const linkedInPosts = await this.linkedInPostRepository.findByUserAndJobAndSkill(
        userId,
        jobId,
        skillId
      );

      return {
        success: true,
        message: Messages.LINKEDIN_POST_FETCH_SUCCESS || "LinkedIn posts fetched successfully",
        data: linkedInPosts,
      };
    } catch (error) {
      log.error({ err: error }, "Error fetching LinkedIn posts:");
      return {
        success: false,
        message: "Failed to fetch LinkedIn posts",
        data: null,
      };
    }
  }

  public async getLatestLinkedInPosts(userId: string | undefined, limit: number = 3): Promise<ServiceResponse> {
    if (!userId) {
      return {
        success: false,
        message: "userId is required",
        data: null,
      };
    }

    try {
      const linkedInPosts = await this.linkedInPostRepository.findLatestByUserId(userId, limit);
      return {
        success: true,
        message: Messages.LINKEDIN_POST_FETCH_SUCCESS || "Latest LinkedIn posts fetched successfully",
        data: linkedInPosts,
      };
    } catch (error) {
      log.error({ err: error }, "Error fetching latest LinkedIn posts:");
      return {
        success: false,
        message: "Failed to fetch latest LinkedIn posts",
        data: null,
      };
    }
  }

  public async getLinkedInPostCount(userId: string | undefined): Promise<ServiceResponse> {
    if (!userId) {
      return {
        success: false,
        message: "userId is required",
        data: null,
      };
    }

    try {
      const count = await this.linkedInPostRepository.countByUserId(userId);
      return {
        success: true,
        message: Messages.LINKEDIN_POST_FETCH_SUCCESS || "LinkedIn post count fetched successfully",
        data: { count },
      };
    } catch (error) {
      log.error({ err: error }, "Error fetching LinkedIn post count:");
      return {
        success: false,
        message: "Failed to fetch LinkedIn post count",
        data: null,
      };
    }
  }

  public async getLinkedInPostsByStudentId(userId: string): Promise<ServiceResponse> {
    if (!userId) {
      return {
        success: false,
        message: "userId is required",
        data: null,
      };
    }

    try {
      const linkedInPosts = await this.linkedInPostRepository.findByUserId(userId);
      return {
        success: true,
        message: Messages.LINKEDIN_POST_FETCH_SUCCESS || "LinkedIn posts fetched successfully",
        data: linkedInPosts,
      };
    } catch (error) {
      log.error({ err: error }, "Error fetching LinkedIn posts by student:");
      return {
        success: false,
        message: "Failed to fetch LinkedIn posts",
        data: null,
      };
    }
  }

  public async deleteLinkedInPost(linkedInPostId: string, userId: string | undefined): Promise<ServiceResponse> {
    if (!linkedInPostId) {
      return {
        success: false,
        message: "linkedInPostId is required",
        data: null,
      };
    }

    try {
      // Verify the LinkedIn post belongs to the user
      const linkedInPost = await this.linkedInPostRepository.findById(linkedInPostId);
      if (!linkedInPost) {
        return {
          success: false,
          message: "LinkedIn post not found",
          data: null,
        };
      }

      // Check if user owns this LinkedIn post
      if (userId && String(linkedInPost.userId) !== String(userId)) {
        return {
          success: false,
          message: "You don't have permission to delete this LinkedIn post",
          data: null,
        };
      }

      // Delete the LinkedIn post
      const deleted = await this.linkedInPostRepository.delete(linkedInPostId);
      if (!deleted) {
        return {
          success: false,
          message: "Failed to delete LinkedIn post",
          data: null,
        };
      }

      return {
        success: true,
        message: "LinkedIn post deleted successfully",
        data: deleted,
      };
    } catch (error) {
      log.error({ err: error }, "Error deleting LinkedIn post:");
      return {
        success: false,
        message: "Failed to delete LinkedIn post",
        data: null,
      };
    }
  }
}

