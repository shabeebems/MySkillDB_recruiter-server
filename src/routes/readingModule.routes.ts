import { Router } from "express";
import { ReadingModuleController } from "../controller/readingModule.controller";
import { authenticateToken } from "../middlewares/tokenValidation";

const readingModuleRouter: Router = Router();
const readingModuleController = new ReadingModuleController();

readingModuleRouter.use(authenticateToken(["master_admin", "org_admin", "student"]));

readingModuleRouter.post("/", readingModuleController.createReadingModule);
readingModuleRouter.get("/", readingModuleController.getReadingModuleByJobAndSkill);

// Job Brief routes
readingModuleRouter.get("/job-briefs/:organizationId", readingModuleController.getJobBriefs);
readingModuleRouter.delete("/job-briefs/:id", readingModuleController.deleteJobBrief);

export default readingModuleRouter;

