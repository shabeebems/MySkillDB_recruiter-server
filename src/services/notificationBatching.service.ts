import NotificationQueueModel, {
  INotificationQueue,
} from "../models/notificationQueue.model";
import NotificationHistoryModel from "../models/notificationHistory.model";
import NotificationPreferencesModel from "../models/notificationPreferences.model";
import { PushNotificationService, NotificationPayload } from "./pushNotification.service";
import { UserRepository } from "../repositories/user.repository";
import { Types } from "mongoose";
import { createChildLogger } from "../utils/logger";

const log = createChildLogger("NotificationBatchingService");


export class NotificationBatchingService {
  private pushNotificationService = new PushNotificationService();

  /**
   * Add notification to queue
   */
  public async addToQueue(
    userId: string,
    type: "job_posted" | "assignment" | "message" | "deadline" | "announcement" | "virtual_session",
    data: {
      jobId?: string;
      sprintId?: string;
      virtualSessionId?: string;
      assignmentId?: string;
      messageId?: string;
      title?: string;
      body?: string;
      url?: string;
      [key: string]: any;
    },
    priority: "high" | "medium" | "low" = "medium"
  ): Promise<INotificationQueue> {
    const notification = await NotificationQueueModel.create({
      userId: new Types.ObjectId(userId),
      type,
      priority,
      data,
      status: "pending",
      scheduledAt: new Date(),
    });

    return notification;
  }

  /**
   * Queue job notification for all students in departments
   */
  public async queueJobNotification(
    jobId: string,
    jobTitle: string,
    companyName: string,
    departmentIds: string[],
    organizationId: string
  ): Promise<void> {
    try {
      // Find all students in the departments
      const userRepository = new UserRepository();

      const allStudents: any[] = [];
      for (const departmentId of departmentIds) {
        const students = await userRepository.findByFilter({
          role: "student",
          departmentId,
        }, 0, 10000);
        allStudents.push(...students);
      }

      // Remove duplicates (students might be in multiple departments)
      const uniqueStudents = Array.from(
        new Map(allStudents.map((s) => [s._id.toString(), s])).values()
      );

      // Queue notification for each student
      const payload: NotificationPayload = {
        title: "New Job Posted!",
        body: `${jobTitle} at ${companyName}`,
        data: {
          jobId,
          url: `/student/job-board?jobId=${jobId}`,
          type: "job_posted",
        },
      };

      // Save to NotificationHistory for EVERY user (in-app list) — so users who don't allow push still see it on dashboard refresh
      for (const student of uniqueStudents) {
        const userId = student._id.toString();
        try {
          await NotificationHistoryModel.create({
            userId: new Types.ObjectId(userId),
            jobId: new Types.ObjectId(jobId),
            title: payload.title,
            body: payload.body,
            type: "job_posted",
            read: false,
          });
        } catch (err) {
          log.error({ err: err }, `Error saving in-app notification for user ${userId}:`);
          // Continue — don't block queue
        }
      }

      for (const student of uniqueStudents) {
        await this.addToQueue(
          student._id.toString(),
          "job_posted",
          {
            jobId,
            title: payload.title,
            body: payload.body,
            url: payload.data?.url,
          },
          "high" // Jobs are high priority (send immediately)
        );
      }
      
      // Process job notifications immediately (don't wait for cron)
      this.processQueue().catch((error) => {
        log.error({ err: error }, "Error processing job notifications immediately:");
      });

      log.info(
        `✅ Queued job notification for ${uniqueStudents.length} students`
      );
    } catch (error) {
      log.error({ err: error }, "Error queueing job notification:");
      // Don't throw - don't fail job creation if notification fails
    }
  }

  /**
   * Queue job sprint notification for students
   * Handles both department type (students by department) and class type (students by assignment/class)
   */
  public async queueJobSprintNotification(
    sprintId: string,
    sprintName: string,
    sprintType: "department" | "class",
    departmentIds: string[] | undefined,
    assignmentIds: string[] | undefined,
    organizationId: string
  ): Promise<void> {
    try {
      const userRepository = new UserRepository();
      const allStudents: any[] = [];

      if (sprintType === "department") {
        // Find students by department IDs
        if (!departmentIds || departmentIds.length === 0) {
          log.warn("⚠️  No department IDs provided for department type sprint");
          return;
        }

        for (const departmentId of departmentIds) {
          const students = await userRepository.findByFilter({
            role: "student",
            departmentId,
            organizationId,
          }, 0, 10000);
          allStudents.push(...students);
        }
      } else if (sprintType === "class") {
        // Find students by assignment IDs (class)
        if (!assignmentIds || assignmentIds.length === 0) {
          log.warn("⚠️  No assignment IDs provided for class type sprint");
          return;
        }

        for (const assignmentId of assignmentIds) {
          const students = await userRepository.findByFilter({
            role: "student",
            assignmentId,
            organizationId,
          }, 0, 10000);
          allStudents.push(...students);
        }
      } else {
        log.error(`❌ Invalid sprint type: ${sprintType}`);
        return;
      }

      // Remove duplicates (students might be in multiple departments/classes)
      const uniqueStudents = Array.from(
        new Map(allStudents.map((s) => [s._id.toString(), s])).values()
      );

      if (uniqueStudents.length === 0) {
        log.info(`ℹ️  No eligible students found for sprint ${sprintName}`);
        return;
      }

      // Queue notification for each student
      const payload: NotificationPayload = {
        title: "New Job Sprint Created!",
        body: `${sprintName} - Check out the new sprint`,
        data: {
          sprintId,
          url: `/student/sprint?sprintId=${sprintId}`,
          type: "sprint_created",
        },
      };

      // Save to NotificationHistory for EVERY user (in-app list) — so users who don't allow push still see it on dashboard refresh
      for (const student of uniqueStudents) {
        const userId = student._id.toString();
        try {
          await NotificationHistoryModel.create({
            userId: new Types.ObjectId(userId),
            sprintId: new Types.ObjectId(sprintId),
            title: payload.title,
            body: payload.body,
            type: "sprint_created",
            read: false,
          });
        } catch (err) {
          log.error({ err: err }, `Error saving in-app notification for user ${userId}:`);
          // Continue — don't block queue
        }
      }

      for (const student of uniqueStudents) {
        await this.addToQueue(
          student._id.toString(),
          "announcement", // Using announcement type for sprints
          {
            sprintId,
            title: payload.title,
            body: payload.body,
            url: payload.data?.url,
          },
          "high" // Sprints are high priority (send immediately)
        );
      }

      log.info(
        `✅ Queued job sprint notification for ${uniqueStudents.length} students (type: ${sprintType})`
      );
      
      // Process sprint notifications immediately (don't wait for cron)
      this.processQueue().catch((error) => {
        log.error({ err: error }, "Error processing sprint notifications immediately:");
      });
    } catch (error) {
      log.error({ err: error }, "Error queueing job sprint notification:");
      // Don't throw - don't fail sprint creation if notification fails
    }
  }

  /**
   * Queue virtual session notification for all invitees (students)
   */
  public async queueVirtualSessionNotification(
    virtualSessionId: string,
    sessionName: string,
    date: string,
    time: string,
    meetLink: string | undefined,
    inviteeUserIds: string[]
  ): Promise<void> {
    try {
      if (!inviteeUserIds || inviteeUserIds.length === 0) {
        log.info("ℹ️  No invitees for virtual session, skipping notifications");
        return;
      }

      const bodySuffix = meetLink ? ` Join: ${meetLink}` : "";
      const title = "New Virtual Session";
      const body = `${sessionName} on ${date} at ${time}.${bodySuffix}`.trim();
      const url = `/student/courses?virtualSessionId=${virtualSessionId}`;

      // Save to NotificationHistory for every invitee (in-app list)
      for (const userId of inviteeUserIds) {
        try {
          await NotificationHistoryModel.create({
            userId: new Types.ObjectId(userId),
            virtualSessionId: new Types.ObjectId(virtualSessionId),
            title,
            body,
            type: "virtual_session",
            read: false,
          });
        } catch (err) {
          log.error({ err: err }, `Error saving in-app notification for user ${userId}:`);
        }
      }

      // Add to queue for each invitee (FCM push)
      for (const userId of inviteeUserIds) {
        await this.addToQueue(
          userId,
          "virtual_session",
          {
            virtualSessionId,
            title,
            body,
            url,
          },
          "high"
        );
      }

      // Process queue immediately (don't wait for cron)
      this.processQueue().catch((error) => {
        log.error({ err: error }, "Error processing virtual session notifications:");
      });

      log.info(`✅ Queued virtual session notification for ${inviteeUserIds.length} students`);
    } catch (error) {
      log.error({ err: error }, "Error queueing virtual session notification:");
    }
  }

  /**
   * Get user preferences (with defaults)
   */
  private async getUserPreferences(
    userId: string
  ): Promise<{
    jobs: { enabled: boolean; immediate: boolean; batchWindow: number };
    assignments: { enabled: boolean; immediate: boolean; batchWindow: number };
    messages: { enabled: boolean; immediate: boolean };
    deadlines: { enabled: boolean; immediate: boolean };
    announcements: {
      enabled: boolean;
      immediate: boolean;
      batchWindow: number;
    };
    rateLimit: { maxPerHour: number; maxPerMinute: number };
  }> {
    const prefs = await NotificationPreferencesModel.findOne({
      userId: new Types.ObjectId(userId),
    });

    if (prefs) {
      return prefs.preferences as any;
    }

    // Return defaults
    return {
      jobs: { enabled: true, immediate: true, batchWindow: 5 }, // Jobs: immediate
      assignments: { enabled: true, immediate: false, batchWindow: 5 },
      messages: { enabled: true, immediate: true },
      deadlines: { enabled: true, immediate: true },
      announcements: { enabled: true, immediate: true, batchWindow: 15 }, // Sprints: immediate
      rateLimit: { maxPerHour: 5, maxPerMinute: 1 },
    };
  }

  /**
   * Check rate limits for a user
   */
  private async checkRateLimit(userId: string): Promise<boolean> {
    const prefs = await this.getUserPreferences(userId);
    const { maxPerHour, maxPerMinute } = prefs.rateLimit;

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

    const recentHour = await NotificationQueueModel.countDocuments({
      userId: new Types.ObjectId(userId),
      status: "sent",
      sentAt: { $gte: oneHourAgo },
    });

    const recentMinute = await NotificationQueueModel.countDocuments({
      userId: new Types.ObjectId(userId),
      status: "sent",
      sentAt: { $gte: oneMinuteAgo },
    });

    return recentHour < maxPerHour && recentMinute < maxPerMinute;
  }

  /**
   * Batch notifications by type for a user
   */
  private async batchNotifications(
    userId: string,
    timeWindow: number
  ): Promise<Map<string, INotificationQueue[]>> {
    const windowStart = new Date(Date.now() - timeWindow * 60 * 1000);

    const notifications = await NotificationQueueModel.find({
      userId: new Types.ObjectId(userId),
      status: "pending",
      scheduledAt: { $lte: windowStart },
    }).sort({ scheduledAt: 1 });

    // Group by type
    const grouped = new Map<string, INotificationQueue[]>();
    notifications.forEach((notif) => {
      const type = notif.type;
      if (!grouped.has(type)) {
        grouped.set(type, []);
      }
      grouped.get(type)!.push(notif);
    });

    return grouped;
  }

  /**
   * Create batched notification payload
   */
  private createBatchedPayload(
    type: string,
    notifications: INotificationQueue[]
  ): NotificationPayload {
    if (type === "job_posted") {
      const jobCount = notifications.length;
      const firstJob = notifications[0];
      const jobTitle = firstJob.data.title || "New Job";
      const companyName = firstJob.data.body?.split(" at ")[1] || "";

      if (jobCount === 1) {
        return {
          title: "New Job Posted!",
          body: firstJob.data.body || jobTitle,
          data: {
            jobId: firstJob.data.jobId ? String(firstJob.data.jobId) : undefined,
            url: firstJob.data.url || "/student/job-board",
            type: "job_posted",
          },
        };
      } else {
        return {
          title: `${jobCount} New Jobs Posted!`,
          body: `Check out ${jobCount} new job opportunities`,
          data: {
            type: "jobs_batch",
            jobIds: notifications.map((n) => n.data.jobId ? String(n.data.jobId) : null).filter(Boolean).join(","),
            url: "/student/job-board",
          },
        };
      }
    }

    if (type === "announcement") {
      // Handle sprint notifications and other announcements
      const sprintCount = notifications.filter(n => n.data.sprintId).length;
      if (sprintCount > 0) {
        if (sprintCount === 1) {
          const firstSprint = notifications.find(n => n.data.sprintId) || notifications[0];
          return {
            title: firstSprint.data.title || "New Job Sprint Created!",
            body: firstSprint.data.body || "Check out the new sprint",
            data: {
              sprintId: firstSprint.data.sprintId ? String(firstSprint.data.sprintId) : undefined,
              url: firstSprint.data.url || "/student/sprint",
              type: "sprint_created",
            },
          };
        } else {
          return {
            title: `${sprintCount} New Job Sprints Created!`,
            body: `Check out ${sprintCount} new sprint opportunities`,
            data: {
              type: "sprints_batch",
              sprintIds: notifications
                .map((n) => n.data.sprintId ? String(n.data.sprintId) : null)
                .filter(Boolean)
                .join(","),
              url: "/student/sprint",
            },
          };
        }
      }
    }

    // Default for other types
    return {
      title: notifications[0].data.title || "New Notification",
      body: notifications[0].data.body || "You have new updates",
      data: {
        type,
        url: notifications[0].data.url || "/",
      },
    };
  }

  /**
   * Process notification queue
   */
  public async processQueue(): Promise<{
    processed: number;
    sent: number;
    failed: number;
  }> {
    const batchWindow = parseInt(
      process.env.NOTIFICATION_BATCH_WINDOW || "5"
    );
    const enableBatching =
      process.env.NOTIFICATION_ENABLE_BATCHING !== "false";

    let processed = 0;
    let sent = 0;
    let failed = 0;

    try {
      // Get all users with pending notifications
      const pendingNotifications = await NotificationQueueModel.find({
        status: "pending",
      }).distinct("userId");

      for (const userId of pendingNotifications) {
        const userIdStr = userId.toString();
        const prefs = await this.getUserPreferences(userIdStr);

        // Check if notifications are enabled for this user
        // (We'll check per notification type)

        // Check rate limits
        const withinRateLimit = await this.checkRateLimit(userIdStr);
        if (!withinRateLimit) {
          log.info(
            `⏸️  Rate limit exceeded for user ${userIdStr}, skipping`
          );
          continue;
        }

        if (enableBatching) {
          // Check for high priority notifications first - process them immediately
          const highPriorityNotifications = await NotificationQueueModel.find({
            userId: new Types.ObjectId(userIdStr),
            status: "pending",
            priority: "high",
            scheduledAt: { $lte: new Date() },
          }).limit(50);

          if (highPriorityNotifications.length > 0) {
            // Process high priority notifications immediately (no batching)
            for (const notification of highPriorityNotifications) {
              const payload: NotificationPayload = {
                title: notification.data.title || "New Notification",
                body: notification.data.body || "You have new updates",
                data: {
                  ...(notification.data.jobId && { jobId: String(notification.data.jobId) }),
                  ...(notification.data.sprintId && { sprintId: String(notification.data.sprintId) }),
                  ...(notification.data.virtualSessionId && { virtualSessionId: String(notification.data.virtualSessionId) }),
                  ...(notification.data.assignmentId && { assignmentId: String(notification.data.assignmentId) }),
                  ...(notification.data.messageId && { messageId: String(notification.data.messageId) }),
                  ...(notification.data.title && { title: notification.data.title }),
                  ...(notification.data.body && { body: notification.data.body }),
                  ...(notification.data.url && { url: notification.data.url }),
                  type: notification.type === "announcement" && notification.data.sprintId 
                    ? "sprint_created" 
                    : notification.type,
                },
              };

              const result = await this.pushNotificationService.sendNotificationToUser(
                userIdStr,
                payload
              );

              if (result.success) {
                await NotificationQueueModel.findByIdAndUpdate(
                  notification._id,
                  { status: "sent", sentAt: new Date() }
                );
                sent++;
              } else {
                await NotificationQueueModel.findByIdAndUpdate(
                  notification._id,
                  {
                    $set: {
                      status: "failed",
                      errorMessage: result.error || "Failed to send",
                    },
                    $inc: { retryCount: 1 },
                  }
                );
                failed++;
              }
              processed++;
            }
          }

          // Then process regular notifications with batching
          const grouped = await this.batchNotifications(userIdStr, batchWindow);

          for (const [type, notifications] of grouped.entries()) {
            // Check if this notification type is enabled
            const typePrefs = prefs[type as keyof typeof prefs];
            if (typePrefs && "enabled" in typePrefs && !typePrefs.enabled) {
              // Mark as sent (disabled)
              await NotificationQueueModel.updateMany(
                { _id: { $in: notifications.map((n) => n._id) } },
                { status: "sent", sentAt: new Date() }
              );
              continue;
            }

            // Check if immediate or batched
            const isImmediate =
              typePrefs && "immediate" in typePrefs && typePrefs.immediate;
            // For high priority notifications, always send immediately (don't batch)
            const isHighPriority = notifications.some(n => n.priority === "high");
            const shouldBatch =
              !isImmediate && !isHighPriority && notifications.length > 1 && (type === "job_posted" || type === "announcement");

            if (shouldBatch) {
              // Send batched notification
              const payload = this.createBatchedPayload(type, notifications);
              const result = await this.pushNotificationService.sendNotificationToUser(
                userIdStr,
                payload
              );

              if (result.success) {
                await NotificationQueueModel.updateMany(
                  { _id: { $in: notifications.map((n) => n._id) } },
                  { status: "sent", sentAt: new Date() }
                );
                sent += notifications.length;
              } else {
                await NotificationQueueModel.updateMany(
                  { _id: { $in: notifications.map((n) => n._id) } },
                  {
                    status: "failed",
                    errorMessage: result.error || "Failed to send",
                    $inc: { retryCount: 1 },
                  }
                );
                failed += notifications.length;
              }
            } else {
              // Send individually
              for (const notification of notifications) {
                const payload: NotificationPayload = {
                  title: notification.data.title || "New Notification",
                  body: notification.data.body || "You have new updates",
                  data: {
                    ...(notification.data.jobId && { jobId: String(notification.data.jobId) }),
                    ...(notification.data.sprintId && { sprintId: String(notification.data.sprintId) }),
                    ...(notification.data.virtualSessionId && { virtualSessionId: String(notification.data.virtualSessionId) }),
                    ...(notification.data.assignmentId && { assignmentId: String(notification.data.assignmentId) }),
                    ...(notification.data.messageId && { messageId: String(notification.data.messageId) }),
                    ...(notification.data.title && { title: notification.data.title }),
                    ...(notification.data.body && { body: notification.data.body }),
                    ...(notification.data.url && { url: notification.data.url }),
                    type: notification.type === "announcement" && notification.data.sprintId 
                      ? "sprint_created" 
                      : notification.type,
                  },
                };

                const result =
                  await this.pushNotificationService.sendNotificationToUser(
                    userIdStr,
                    payload
                  );

                if (result.success) {
                  await NotificationQueueModel.findByIdAndUpdate(
                    notification._id,
                    { status: "sent", sentAt: new Date() }
                  );
                  sent++;
                } else {
                  await NotificationQueueModel.findByIdAndUpdate(
                    notification._id,
                    {
                      $set: {
                        status: "failed",
                        errorMessage: result.error || "Failed to send",
                      },
                      $inc: { retryCount: 1 },
                    }
                  );
                  failed++;
                }
              }
            }

            processed += notifications.length;
          }
        } else {
          // Send immediately without batching
          const notifications = await NotificationQueueModel.find({
            userId: new Types.ObjectId(userIdStr),
            status: "pending",
            scheduledAt: { $lte: new Date() },
          }).limit(10); // Process in batches

          for (const notification of notifications) {
            const payload: NotificationPayload = {
              title: notification.data.title || "New Notification",
              body: notification.data.body || "You have new updates",
              data: {
                ...(notification.data.jobId && { jobId: String(notification.data.jobId) }),
                ...(notification.data.sprintId && { sprintId: String(notification.data.sprintId) }),
                ...(notification.data.virtualSessionId && { virtualSessionId: String(notification.data.virtualSessionId) }),
                ...(notification.data.assignmentId && { assignmentId: String(notification.data.assignmentId) }),
                ...(notification.data.messageId && { messageId: String(notification.data.messageId) }),
                ...(notification.data.title && { title: notification.data.title }),
                ...(notification.data.body && { body: notification.data.body }),
                ...(notification.data.url && { url: notification.data.url }),
                type: notification.type === "announcement" && notification.data.sprintId 
                  ? "sprint_created" 
                  : notification.type,
              },
            };

            const result =
              await this.pushNotificationService.sendNotificationToUser(
                userIdStr,
                payload
              );

            if (result.success) {
              await NotificationQueueModel.findByIdAndUpdate(
                notification._id,
                { status: "sent", sentAt: new Date() }
              );
              sent++;
            } else {
              await NotificationQueueModel.findByIdAndUpdate(
                notification._id,
                {
                  $set: {
                    status: "failed",
                    errorMessage: result.error || "Failed to send",
                  },
                  $inc: { retryCount: 1 },
                }
              );
              failed++;
            }

            processed++;
          }
        }
      }

      log.info(
        `✅ Processed ${processed} notifications: ${sent} sent, ${failed} failed`
      );

      // Log failure reason when any failed (helps debug e.g. "No FCM tokens found for user")
      if (failed > 0) {
        const sampleFailed = await NotificationQueueModel.findOne(
          { status: "failed" },
          { errorMessage: 1 },
          { sort: { updatedAt: -1 } }
        );
        const reason = sampleFailed?.errorMessage || "Unknown";
        log.warn(
          `⚠️  Notification failures (${failed}): sample reason — "${reason}". ` +
            (reason.includes("No FCM tokens")
              ? "Students must log in and allow notifications once to register their device for push."
              : "Check Firebase credentials and FCM token validity.")
        );
      }
    } catch (error) {
      log.error({ err: error }, "Error processing notification queue:");
    }

    return { processed, sent, failed };
  }
}
