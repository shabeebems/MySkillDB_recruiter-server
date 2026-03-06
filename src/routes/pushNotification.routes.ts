import { Router } from "express";
import { PushNotificationController } from "../controller/pushNotification.controller";
import { authenticateToken } from "../middlewares/tokenValidation";

const pushNotificationRouter: Router = Router();

const pushNotificationController = new PushNotificationController();

// All routes require authentication - available to all authenticated users
pushNotificationRouter.use(authenticateToken(["master_admin", "org_admin", "student"]));

// Register FCM token
pushNotificationRouter.post(
  "/register",
  pushNotificationController.registerToken
);

// Unregister FCM token
pushNotificationRouter.delete(
  "/unregister",
  pushNotificationController.unregisterToken
);

// Test notification (for authenticated users to test their own notifications)
pushNotificationRouter.post(
  "/test",
  pushNotificationController.testNotification
);

export default pushNotificationRouter;
