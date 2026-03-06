import { Router } from "express";
import { LinkedInPostController } from "../controller/linkedInPost.controller";
import { authenticateToken } from "../middlewares/tokenValidation";

const linkedInPostRouter: Router = Router();
const linkedInPostController = new LinkedInPostController();

linkedInPostRouter.use(authenticateToken(["master_admin", "org_admin", "student"]));

linkedInPostRouter.post("/", linkedInPostController.createLinkedInPost);
linkedInPostRouter.get("/latest", linkedInPostController.getLatestLinkedInPosts);
linkedInPostRouter.get("/count", linkedInPostController.getLinkedInPostCount);
linkedInPostRouter.get("/", linkedInPostController.getLinkedInPosts);
linkedInPostRouter.get("/student/all", linkedInPostController.getLinkedInPostsByStudent);
linkedInPostRouter.delete("/:id", linkedInPostController.deleteLinkedInPost);

export default linkedInPostRouter;

