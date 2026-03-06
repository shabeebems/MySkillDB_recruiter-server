import { Request, Response } from "express";
import { handleRequest } from "../utils/handle-request.util";
import { PushNotificationService } from "../services/pushNotification.service";
import { ServiceResponse } from "../services/types";

export class PushNotificationController {
  private pushNotificationService = new PushNotificationService();

  /**
   * Register FCM token
   * POST /fcm/register
   */
  public registerToken = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, async () => {
      const userId = (req as any).user?._id?.toString();
      if (!userId) {
        return {
          success: false,
          message: "User not authenticated",
          data: null,
          statusCode: 401,
        } as ServiceResponse & { statusCode?: number };
      }

      const rawToken = req.body?.token;
      const token = typeof rawToken === "string" ? rawToken.trim() : "";
      const rawBody = req.body || {};
      const deviceInfo = rawBody.deviceInfo && typeof rawBody.deviceInfo === "object"
        ? {
            userAgent: typeof rawBody.deviceInfo.userAgent === "string" ? rawBody.deviceInfo.userAgent : undefined,
            platform: typeof rawBody.deviceInfo.platform === "string" ? rawBody.deviceInfo.platform : undefined,
            browser: typeof rawBody.deviceInfo.browser === "string" ? rawBody.deviceInfo.browser : undefined,
          }
        : {};
      const platformRaw = rawBody.platform;
      const platform =
        platformRaw === "ios" || platformRaw === "android" ? platformRaw : "web";

      if (!token) {
        return {
          success: false,
          message: "FCM token is required",
          data: null,
        } as ServiceResponse;
      }

      try {
        const fcmToken = await this.pushNotificationService.saveToken(
          userId,
          token,
          deviceInfo,
          platform
        );

        return {
          success: true,
          message: "FCM token registered successfully",
          data: fcmToken,
        } as ServiceResponse;
      } catch (error: any) {
        return {
          success: false,
          message: error.message || "Failed to register FCM token",
          data: null,
        } as ServiceResponse;
      }
    });

  /**
   * Unregister FCM token
   * DELETE /fcm/unregister
   */
  public unregisterToken = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, async () => {
      const userId = (req as any).user?._id?.toString();
      if (!userId) {
        return {
          success: false,
          message: "User not authenticated",
          data: null,
        } as ServiceResponse;
      }

      const { token } = req.body;

      if (!token) {
        return {
          success: false,
          message: "FCM token is required",
          data: null,
        } as ServiceResponse;
      }

      try {
        await this.pushNotificationService.removeToken(userId, token);

        return {
          success: true,
          message: "FCM token unregistered successfully",
          data: null,
        } as ServiceResponse;
      } catch (error: any) {
        return {
          success: false,
          message: error.message || "Failed to unregister FCM token",
          data: null,
        } as ServiceResponse;
      }
    });

  /**
   * Test notification (admin only)
   * POST /fcm/test
   */
  public testNotification = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, async () => {
      const userId = (req as any).user?._id?.toString();
      if (!userId) {
        return {
          success: false,
          message: "User not authenticated",
          data: null,
        } as ServiceResponse;
      }

      const { title, body } = req.body;

      try {
        const result = await this.pushNotificationService.sendNotificationToUser(
          userId,
          {
            title: title || "Test Notification",
            body: body || "This is a test notification",
            data: {
              type: "test",
              url: "/",
            },
          }
        );

        return {
          success: result.success,
          message: result.success
            ? "Test notification sent successfully"
            : result.error || "Failed to send test notification",
          data: result,
        } as ServiceResponse;
      } catch (error: any) {
        return {
          success: false,
          message: error.message || "Failed to send test notification",
          data: null,
        } as ServiceResponse;
      }
    });
}
