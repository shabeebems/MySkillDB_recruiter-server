import { Router } from "express";
import { SkillController } from "../controller/skill.controller";
import { authenticateToken } from "../middlewares/tokenValidation";
import { validate } from "../middlewares/zodValidate";
import { createSkillSchema } from "../schemas/skill.schema";

const skillRouter: Router = Router();
const skillController = new SkillController();

// Student accessible route - placed before global middleware
skillRouter.get('/job/:jobId', authenticateToken(["master_admin", "org_admin", "student"]), skillController.getSkillsByJob);

skillRouter.use(authenticateToken(["master_admin", "org_admin", "student"]));

skillRouter.post('/', validate(createSkillSchema), skillController.createSkill);
skillRouter.get('/job/:jobId/type/:type', skillController.getSkillsByJobAndType);
skillRouter.get('/:skillId', skillController.getSkillById);
skillRouter.put('/:skillId', skillController.updateSkill);
skillRouter.delete('/:skillId', skillController.deleteSkill);

export default skillRouter;

