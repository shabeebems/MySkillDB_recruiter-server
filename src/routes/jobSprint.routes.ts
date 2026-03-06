import { Router } from "express";
import { JobSprintController } from "../controller/jobSprint.controller";
import { authenticateToken } from "../middlewares/tokenValidation";
import { validate } from "../middlewares/zodValidate";
import { createJobSprintSchema } from "../schemas/jobSprint.schema";

const jobSprintRouter: Router = Router();

const jobSprintController = new JobSprintController();

jobSprintRouter.use(authenticateToken(["master_admin", "org_admin", "hod"]));

jobSprintRouter.post('/', validate(createJobSprintSchema), jobSprintController.createJobSprint);
jobSprintRouter.get('/organization/:organizationId', jobSprintController.getJobSprintsByOrganization);
jobSprintRouter.get('/:sprintId', jobSprintController.getJobSprintById);
jobSprintRouter.delete('/:sprintId', jobSprintController.deleteJobSprint);

export default jobSprintRouter;
