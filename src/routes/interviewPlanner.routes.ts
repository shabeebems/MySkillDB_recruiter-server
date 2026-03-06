import { Router } from "express";
import { InterviewPlannerController } from "../controller/interviewPlanner.controller";
import { authenticateToken } from "../middlewares/tokenValidation";

const interviewPlannerRouter: Router = Router();

const interviewPlannerController = new InterviewPlannerController();

interviewPlannerRouter.use(authenticateToken(["master_admin", "org_admin", "student"]));

interviewPlannerRouter.post("/", interviewPlannerController.addJobToInterviewPlanner);
interviewPlannerRouter.get("/latest", interviewPlannerController.getLatestInterviewPlanners);
interviewPlannerRouter.get("/check/:jobId", interviewPlannerController.checkJobInInterviewPlanner);
interviewPlannerRouter.get("/", interviewPlannerController.getInterviewPlannerJobs);
interviewPlannerRouter.get("/count", interviewPlannerController.getInterviewPlannerCount);
interviewPlannerRouter.delete("/:interviewPlannerId", interviewPlannerController.removeJobFromInterviewPlanner);

export default interviewPlannerRouter;
