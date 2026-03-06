import { Router } from "express";
import { JobFlipCardResultController } from "../controller/jobFlipCardResult.controller";
import { authenticateToken } from "../middlewares/tokenValidation";

const jobFlipCardResultRouter: Router = Router();
const jobFlipCardResultController = new JobFlipCardResultController();

// Student accessible routes
jobFlipCardResultRouter.use(authenticateToken(["master_admin", "org_admin", "student"]));

jobFlipCardResultRouter.get("/student", jobFlipCardResultController.getFlipCardResultsByStudentId);
jobFlipCardResultRouter.post("/", jobFlipCardResultController.createOrUpdateJobFlipCardResult);

export default jobFlipCardResultRouter;

