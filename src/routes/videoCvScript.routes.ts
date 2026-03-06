import { Router } from "express";
import { VideoCvScriptController } from "../controller/videoCvScript.controller";
import { authenticateToken } from "../middlewares/tokenValidation";
import { validate } from "../middlewares/zodValidate";
import { createVideoCvScriptSchema } from "../schemas/videoCvScript.schema";

const videoCvScriptRouter: Router = Router();
const videoCvScriptController = new VideoCvScriptController();

videoCvScriptRouter.post(
  "/",
  authenticateToken(["master_admin", "org_admin", "student"]),
  validate(createVideoCvScriptSchema),
  videoCvScriptController.createVideoCvScript
);

videoCvScriptRouter.get(
  "/job/:jobId",
  authenticateToken(["master_admin", "org_admin", "student"]),
  videoCvScriptController.getVideoCvScriptByUserAndJob
);

export default videoCvScriptRouter;

