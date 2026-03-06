import { Types } from "mongoose";
import OrganizationActivityModel, {
  IOrganizationActivity,
  OrganizationActivityType,
} from "../models/organizationActivity.model";
import NotificationHistoryModel from "../models/notificationHistory.model";
import { createChildLogger } from "../utils/logger";

const log = createChildLogger("NotificationService");


/** Frontend notification item shape */
export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: "job" | "video_cv" | "sprint" | "student" | "test" | "virtual_session";
  read: boolean;
  createdAt: string;
  source: "activity" | "history";
  metadata?: { jobId?: string; videoCvId?: string; sprintId?: string; userId?: string; virtualSessionId?: string };
}

const ADMIN_ROLES = ["master_admin", "org_admin", "hod", "recruiter"];

function activityTypeToFrontend(type: OrganizationActivityType): NotificationItem["type"] {
  const map: Record<OrganizationActivityType, NotificationItem["type"]> = {
    job_posted: "job",
    video_cv_submitted: "video_cv",
    sprint_completed: "sprint",
    student_registered: "student",
  };
  return map[type] ?? "job";
}

function historyTypeToFrontend(
  type: "job_posted" | "assignment" | "message" | "deadline" | "announcement" | "sprint_created" | "virtual_session"
): NotificationItem["type"] {
  if (type === "job_posted") return "job";
  if (type === "sprint_created") return "sprint";
  if (type === "virtual_session") return "virtual_session";
  if (type === "assignment" || type === "message" || type === "deadline") return "test";
  return "test";
}

export class NotificationService {
  /**
   * Create an organization-level activity (for admin feed).
   */
  public async createOrganizationActivity(
    organizationId: string,
    type: OrganizationActivityType,
    title: string,
    message: string,
    metadata?: { jobId?: string; videoCvId?: string; sprintId?: string; userId?: string }
  ): Promise<IOrganizationActivity | null> {
    try {
      const doc = await OrganizationActivityModel.create({
        organizationId: new Types.ObjectId(organizationId),
        type,
        title,
        message,
        metadata: metadata
          ? Object.fromEntries(
              Object.entries(metadata).filter(
                (entry): entry is [string, string] => entry[1] != null && typeof entry[1] === "string"
              )
            )
          : undefined,
        readBy: [],
      });
      return doc;
    } catch (err) {
      log.error({ err: err }, "Error creating organization activity:");
      return null;
    }
  }

  /**
   * List notifications for the current user.
   * - Admin (org_admin, master_admin, etc.): org activity feed.
   * - Student (and others): NotificationHistory (FCM history).
   */
  public async listForUser(
    userId: string,
    role: string,
    organizationId: string | null,
    limit: number = 50
  ): Promise<NotificationItem[]> {
    if (ADMIN_ROLES.includes(role) && organizationId) {
      return this.listOrganizationActivity(organizationId, userId, limit);
    }
    return this.listUserNotificationHistory(userId, limit);
  }

  private async listOrganizationActivity(
    organizationId: string,
    userId: string,
    limit: number
  ): Promise<NotificationItem[]> {
    const activities = await OrganizationActivityModel.find({
      organizationId: new Types.ObjectId(organizationId),
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return activities.map((a: any) => ({
      _id: String(a._id),
      title: a.title,
      message: a.message,
      type: activityTypeToFrontend(a.type),
      read: Array.isArray(a.readBy) && a.readBy.some((id: any) => id != null && String(id) === userId),
      createdAt: a.createdAt,
      source: "activity" as const,
      metadata: a.metadata && typeof a.metadata === "object" ? { ...a.metadata } : undefined,
    }));
  }

  private async listUserNotificationHistory(
    userId: string,
    limit: number
  ): Promise<NotificationItem[]> {
    const items = await NotificationHistoryModel.find({
      userId: new Types.ObjectId(userId),
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return items.map((h: any) => {
      const metadata: NotificationItem["metadata"] = {};
      if (h.jobId) metadata.jobId = String(h.jobId);
      if (h.sprintId) metadata.sprintId = String(h.sprintId);
      if (h.virtualSessionId) metadata.virtualSessionId = String(h.virtualSessionId);

      return {
        _id: String(h._id),
        title: h.title,
        message: h.body,
        type: historyTypeToFrontend(h.type),
        read: !!h.read,
        createdAt: h.createdAt,
        source: "history" as const,
        metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
      };
    });
  }

  /**
   * Mark a notification as read.
   * source: 'activity' | 'history' determines which collection to update.
   */
  public async markAsRead(
    id: string,
    userId: string,
    source: "activity" | "history"
  ): Promise<boolean> {
    try {
      if (source === "activity") {
        await OrganizationActivityModel.findByIdAndUpdate(id, {
          $addToSet: { readBy: new Types.ObjectId(userId) },
        });
        return true;
      }
      const updated = await NotificationHistoryModel.findOneAndUpdate(
        { _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) },
        { read: true, readAt: new Date() }
      );
      return !!updated;
    } catch {
      return false;
    }
  }
}
