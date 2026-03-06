import { Router, Request, Response } from "express";
import { TestController } from "../controller/test.controller";
import { authenticateToken } from "../middlewares/tokenValidation";
import { validate } from "../middlewares/zodValidate";
import { createTestSchema, updateTestSchema } from "../schemas/test.schema";

const testRouter: Router = Router();

const testController = new TestController();

// Student accessible routes
testRouter.get("/subject/:subjectId", authenticateToken(["master_admin", "org_admin", "student"]), testController.getTestsBySubject);
testRouter.get("/topic/:topicId", authenticateToken(["master_admin", "org_admin", "student"]), testController.getTestsByTopic);
testRouter.get("/skill/:skillId", authenticateToken(["master_admin", "org_admin", "student"]), testController.getTestsBySkill);
testRouter.get("/:testId", authenticateToken(["master_admin", "org_admin", "student"]), testController.getTestById);

// Admin-only routes - global middleware
testRouter.use(authenticateToken(["master_admin", "org_admin"]));

testRouter.post("/", validate(createTestSchema), testController.createTest);
testRouter.get("/job/:jobId", testController.getTestsByJob);
testRouter.put("/:testId", validate(updateTestSchema), testController.updateTest);
testRouter.delete("/:testId", testController.deleteTest);

export default testRouter;


