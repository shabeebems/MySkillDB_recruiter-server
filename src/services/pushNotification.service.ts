import { getFirebaseMessaging } from "../config/firebaseAdmin";
import FCMTokenModel, { IFCMToken } from "../models/fcmToken.model";
import NotificationHistoryModel from "../models/notificationHistory.model";
import { UserRepository } from "../repositories/user.repository";
import { IUser } from "../models/user.model";
import { Types } from "mongoose";
import admin from "firebase-admin";
import { createChildLogger } from "../utils/logger";

const log = createChildLogger("PushNotificationService");


export interface NotificationPayload {
  title: string;
  body: string;
  data?: {
    jobId?: string;
    url?: string;
    type?: string;
    [key: string]: any;
  };
  icon?: string;
  badge?: string;
  image?: string;
}

export class PushNotificationService {
  private userRepository = new UserRepository();

  /**
   * Save FCM token for a user
   */
  public async saveToken(
    userId: string,
    token: string,
    deviceInfo?: {
      userAgent?: string;
      platform?: string;
      browser?: string;
    },
    platform: "web" | "ios" | "android" = "web"
  ): Promise<IFCMToken> {
    // Remove old token if exists (token is unique)
    await FCMTokenModel.findOneAndDelete({ token });

    // Save new token
    const fcmToken = await FCMTokenModel.create({
      userId: new Types.ObjectId(userId),
      token,
      deviceInfo: deviceInfo || {},
      platform,
    });

    return fcmToken;
  }

  /**
   * Remove FCM token
   */
  public async removeToken(userId: string, token: string): Promise<void> {
    await FCMTokenModel.findOneAndDelete({
      userId: new Types.ObjectId(userId),
      token,
    });
  }

  /**
   * Remove all tokens for a user
   */
  public async removeAllUserTokens(userId: string): Promise<void> {
    await FCMTokenModel.deleteMany({
      userId: new Types.ObjectId(userId),
    });
  }

  /**
   * Get all FCM tokens for a user
   */
  public async getUserTokens(userId: string): Promise<string[]> {
    const tokens = await FCMTokenModel.find({
      userId: new Types.ObjectId(userId),
    }).select("token");

    return tokens.map((t) => t.token);
  }

  /**
   * Get all FCM tokens for multiple users
   */
  public async getUsersTokens(userIds: string[]): Promise<Map<string, string[]>> {
    const objectIds = userIds.map((id) => new Types.ObjectId(id));
    const tokens = await FCMTokenModel.find({
      userId: { $in: objectIds },
    });

    const tokenMap = new Map<string, string[]>();
    tokens.forEach((token) => {
      const userId = token.userId.toString();
      if (!tokenMap.has(userId)) {
        tokenMap.set(userId, []);
      }
      tokenMap.get(userId)!.push(token.token);
    });

    return tokenMap;
  }

  /**
   * Send notification to a single user
   */
  public async sendNotificationToUser(
    userId: string,
    payload: NotificationPayload
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const tokens = await this.getUserTokens(userId);
      if (tokens.length === 0) {
        return {
          success: false,
          error: "No FCM tokens found for user",
        };
      }

      // Send to all user's devices (history already saved for all users when queuing — avoids duplicates and covers users without push)
      const results = await this.sendMulticast(tokens, payload);

      return {
        success: results.success,
        messageId: results.messageIds?.[0],
        error: results.errors?.[0],
      };
    } catch (error: any) {
      log.error({ err: error }, "Error sending notification to user:");
      return {
        success: false,
        error: error.message || "Failed to send notification",
      };
    }
  }

  /**
   * Send notification to all students in a department
   */
  public async sendNotificationToDepartment(
    departmentId: string,
    payload: NotificationPayload
  ): Promise<{
    success: boolean;
    sent: number;
    failed: number;
    errors: string[];
  }> {
    try {
      // Find all students in the department
      const students = await this.userRepository.findByFilter({
        role: "student",
        departmentId,
      }, 0, 10000); // Large limit to get all students

      if (students.length === 0) {
        return {
          success: true,
          sent: 0,
          failed: 0,
          errors: [],
        };
      }

      const userIds = (students as IUser[]).map((s) => String(s._id));
      const tokenMap = await this.getUsersTokens(userIds);

      // Collect all tokens
      const allTokens: string[] = [];
      const userIdToTokens = new Map<string, string[]>();

      tokenMap.forEach((tokens, userId) => {
        allTokens.push(...tokens);
        userIdToTokens.set(userId, tokens);
      });

      if (allTokens.length === 0) {
        return {
          success: true,
          sent: 0,
          failed: 0,
          errors: ["No FCM tokens found for students in department"],
        };
      }

      // Send multicast notification
      const results = await this.sendMulticast(allTokens, payload);

      // Save to history for each user
      if (results.messageIds && results.messageIds.length > 0) {
        const messageId = results.messageIds[0]; // Use first message ID for batch
        for (const userId of userIds) {
          if (userIdToTokens.has(userId)) {
            await this.saveNotificationHistory(userId, payload, messageId);
          }
        }
      }

      return {
        success: results.success,
        sent: results.successCount || 0,
        failed: results.failureCount || 0,
        errors: results.errors || [],
      };
    } catch (error: any) {
      log.error({ err: error }, "Error sending notification to department:");
      return {
        success: false,
        sent: 0,
        failed: 0,
        errors: [error.message || "Failed to send notification"],
      };
    }
  }

  /**
   * Send notification to multiple departments (for job posting)
   */
  public async sendNotificationToDepartments(
    departmentIds: string[],
    payload: NotificationPayload
  ): Promise<{
    success: boolean;
    sent: number;
    failed: number;
    errors: string[];
  }> {
    let totalSent = 0;
    let totalFailed = 0;
    const allErrors: string[] = [];

    for (const departmentId of departmentIds) {
      const result = await this.sendNotificationToDepartment(departmentId, payload);
      totalSent += result.sent;
      totalFailed += result.failed;
      allErrors.push(...result.errors);
    }

    return {
      success: totalSent > 0,
      sent: totalSent,
      failed: totalFailed,
      errors: allErrors,
    };
  }

  /**
   * Send multicast notification to multiple tokens
   */
  public async sendMulticast(
    tokens: string[],
    payload: NotificationPayload
  ): Promise<{
    success: boolean;
    successCount?: number;
    failureCount?: number;
    messageIds?: string[];
    errors?: string[];
  }> {
    if (tokens.length === 0) {
      return {
        success: false,
        successCount: 0,
        failureCount: 0,
        errors: ["No tokens provided"],
      };
    }

    try {
      const messaging = getFirebaseMessaging();

      // FCM multicast limit is 500 tokens per batch
      const batchSize = 500;
      const batches: string[][] = [];
      for (let i = 0; i < tokens.length; i += batchSize) {
        batches.push(tokens.slice(i, i + batchSize));
      }

      let totalSuccess = 0;
      let totalFailure = 0;
      const allMessageIds: string[] = [];
      const allErrors: string[] = [];

      for (const batch of batches) {
        const message: admin.messaging.MulticastMessage = {
          notification: {
            title: payload.title,
            body: payload.body,
            imageUrl: payload.image,
          },
          data: {
            ...payload.data,
            // Ensure all data values are strings
            ...Object.fromEntries(
              Object.entries(payload.data || {}).map(([k, v]) => [k, String(v)])
            ),
          },
          webpush: {
            notification: {
              title: payload.title,
              body: payload.body,
              icon: payload.icon || "/icon-192x192.png",
              badge: payload.badge || "/icon-192x192.png",
              tag: payload.data?.jobId ? `job-${payload.data.jobId}` : undefined,
              requireInteraction: false,
            },
            fcmOptions: {
              link: payload.data?.url || "/",
            },
          },
          tokens: batch,
        };

        const response = await messaging.sendEachForMulticast(message);

        totalSuccess += response.successCount;
        totalFailure += response.failureCount;

        // Collect message IDs
        if (response.responses) {
          response.responses.forEach((resp, index) => {
            if (resp.success && resp.messageId) {
              allMessageIds.push(resp.messageId);
            } else if (resp.error) {
              allErrors.push(resp.error.message || "Unknown error");

              // Clean up invalid tokens
              if (
                resp.error.code === "messaging/invalid-registration-token" ||
                resp.error.code === "messaging/registration-token-not-registered"
              ) {
                // Find and remove invalid token using the index
                const invalidToken = batch[index];
                if (invalidToken) {
                  FCMTokenModel.findOneAndDelete({ token: invalidToken }).catch(
                    (err) => log.error({ err: err }, "Error removing invalid token:")
                  );
                }
              }
            }
          });
        }
      }

      return {
        success: totalSuccess > 0,
        successCount: totalSuccess,
        failureCount: totalFailure,
        messageIds: allMessageIds,
        errors: allErrors,
      };
    } catch (error: any) {
      log.error({ err: error }, "Error sending multicast notification:");
      return {
        success: false,
        successCount: 0,
        failureCount: tokens.length,
        errors: [error.message || "Failed to send multicast notification"],
      };
    }
  }

  /**
   * Save notification to history
   */
  private async saveNotificationHistory(
    userId: string,
    payload: NotificationPayload,
    fcmMessageId?: string
  ): Promise<void> {
    try {
      // Determine notification type - use payload.data.type or default to "job_posted"
      let notificationType: "job_posted" | "assignment" | "message" | "deadline" | "announcement" | "sprint_created" = 
        (payload.data?.type as any) || "job_posted";
      
      // Map "sprint_created" from data.type to notification type
      if (payload.data?.type === "sprint_created") {
        notificationType = "sprint_created";
      } else if (payload.data?.type === "jobs_batch" || payload.data?.type === "sprints_batch") {
        notificationType = "announcement";
      }

      await NotificationHistoryModel.create({
        userId: new Types.ObjectId(userId),
        jobId: payload.data?.jobId
          ? new Types.ObjectId(payload.data.jobId)
          : undefined,
        sprintId: payload.data?.sprintId
          ? new Types.ObjectId(payload.data.sprintId)
          : undefined,
        title: payload.title,
        body: payload.body,
        type: notificationType,
        fcmMessageId,
      });
    } catch (error) {
      log.error({ err: error }, "Error saving notification history:");
      // Don't throw - history is optional
    }
  }

  /**
   * Send job notification (main method for job posting)
   */
  public async sendJobNotification(
    jobId: string,
    jobTitle: string,
    companyName: string,
    departmentIds: string[],
    organizationId: string
  ): Promise<{
    success: boolean;
    sent: number;
    failed: number;
    errors: string[];
  }> {
    const payload: NotificationPayload = {
      title: "New Job Posted!",
      body: `${jobTitle} at ${companyName}`,
      data: {
        jobId,
        url: `/student/job-board?jobId=${jobId}`,
        type: "job_posted",
      },
      icon: "/icon-192x192.png",
      badge: "/icon-192x192.png",
    };

    return this.sendNotificationToDepartments(departmentIds, payload);
  }
}
