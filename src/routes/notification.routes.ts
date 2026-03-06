import { Router } from "express";
import { NotificationController } from "../controller/notification.controller";
import { authenticateToken } from "../middlewares/tokenValidation";

const notificationRouter: Router = Router();
const notificationController = new NotificationController();

const allowedRoles = [
  "master_admin",
  "org_admin",
  "student",
];

notificationRouter.use(authenticateToken(allowedRoles));

notificationRouter.get("/", notificationController.list);
notificationRouter.patch("/:id/read", notificationController.markAsRead);

export default notificationRouter;
