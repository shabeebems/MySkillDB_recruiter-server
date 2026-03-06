import { Router } from "express";
import { VideoCvController } from "../controller/videoCv.controller";
import { authenticateToken } from "../middlewares/tokenValidation";

const videoCvRouter: Router = Router();
const videoCvController = new VideoCvController();

// Student accessible routes
videoCvRouter.post(
  "/",
  authenticateToken(["master_admin", "org_admin", "student"]),
  videoCvController.createOrUpdateVideoCv
);

videoCvRouter.get(
  "/job/:jobId",
  authenticateToken(["master_admin", "org_admin", "student"]),
  videoCvController.getVideoCvByUserAndJob
);

videoCvRouter.get(
  "/user/all",
  authenticateToken(["master_admin", "org_admin", "student"]),
  videoCvController.getVideoCvsByUserId
);

videoCvRouter.get(
  "/user/count",
  authenticateToken(["master_admin", "org_admin", "student"]),
  videoCvController.getVideoCvCountByUserId
);

// Public route for fetching all video CVs by job ID (for email HR view)
videoCvRouter.get(
  "/job/:jobId/all",
  videoCvController.getVideoCvsByJobId
);

export default videoCvRouter;

