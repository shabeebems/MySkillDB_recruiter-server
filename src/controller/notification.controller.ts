import { Request, Response } from "express";
import { handleRequest } from "../utils/handle-request.util";
import { NotificationService } from "../services/notification.service";
import { ServiceResponse } from "../services/types";

export class NotificationController {
  private notificationService = new NotificationService();

  /**
   * GET /notifications
   * List notifications for the current user (admin: org activity, student: FCM history).
   */
  public list = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, async () => {
      const user = (req as any).user;
      if (!user || !user._id) {
        return {
          success: false,
          message: "User not authenticated",
          data: null,
        } as ServiceResponse;
      }

      const userId = String(user._id);
      const role = user.role || "";
      const organizationId = user.organizationId
        ? String(user.organizationId)
        : Array.isArray(user.organizationIds) && user.organizationIds.length > 0
          ? String(user.organizationIds[0])
          : null;

      const limit = Math.min(
        Math.max(1, parseInt(String((req as any).query?.limit), 10) || 50),
        100
      );

      const items = await this.notificationService.listForUser(
        userId,
        role,
        organizationId,
        limit
      );

      return {
        success: true,
        message: "Notifications fetched successfully",
        data: items,
      } as ServiceResponse;
    });

  /**
   * PATCH /notifications/:id/read
   * Body: { source: 'activity' | 'history' }
   * Mark a notification as read.
   */
  public markAsRead = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, async () => {
      const user = (req as any).user;
      if (!user || !user._id) {
        return {
          success: false,
          message: "User not authenticated",
          data: null,
        } as ServiceResponse;
      }

      const id = (req as any).params?.id;
      const source = (req as any).body?.source;

      if (!id) {
        return {
          success: false,
          message: "Notification id is required",
          data: null,
        } as ServiceResponse;
      }

      if (source !== "activity" && source !== "history") {
        return {
          success: false,
          message: "source must be 'activity' or 'history'",
          data: null,
        } as ServiceResponse;
      }

      const ok = await this.notificationService.markAsRead(
        String(id),
        String(user._id),
        source
      );

      if (!ok) {
        return {
          success: false,
          message: "Failed to mark notification as read or notification not found",
          data: null,
        } as ServiceResponse;
      }

      return {
        success: true,
        message: "Notification marked as read",
        data: null,
      } as ServiceResponse;
    });
}
