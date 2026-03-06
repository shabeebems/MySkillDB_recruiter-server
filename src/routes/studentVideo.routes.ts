import { Router } from "express";
import { StudentVideoController } from "../controller/studentVideo.controller";
import { authenticateToken } from "../middlewares/tokenValidation";

const studentVideoRouter: Router = Router();
const studentVideoController = new StudentVideoController();

studentVideoRouter.use(authenticateToken(["master_admin", "org_admin", "student"]));

studentVideoRouter.post("/", studentVideoController.createStudentVideo);
studentVideoRouter.get("/latest", studentVideoController.getLatestStudentVideos);
studentVideoRouter.get("/", studentVideoController.getStudentVideos);
studentVideoRouter.get("/student/all", studentVideoController.getStudentVideosByStudent);
studentVideoRouter.get("/count", studentVideoController.getStudentVideoCount);
studentVideoRouter.delete("/:id", studentVideoController.deleteStudentVideo);

export default studentVideoRouter;

