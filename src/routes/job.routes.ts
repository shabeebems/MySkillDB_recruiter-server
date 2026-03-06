import { Router } from "express";
import { JobController } from "../controller/job.controller";
import { authenticateToken } from "../middlewares/tokenValidation";
import { validate } from "../middlewares/zodValidate";
import { createJobSchema, updateJobSchema } from "../schemas/job.schema";

const jobRouter: Router = Router();

const jobController = new JobController();

jobRouter.use(authenticateToken(["master_admin", "org_admin", "student", "hod"]));

jobRouter.post('/', validate(createJobSchema), jobController.createJob);
jobRouter.put('/:jobId', validate(updateJobSchema), jobController.updateJob);
jobRouter.get('/organization/:organizationId/department/:departmentId/latest', jobController.getLatestJobsByDepartmentAndOrganization);
jobRouter.get('/organization/:organizationId/latest', jobController.getLatestJobsByOrganization);
jobRouter.get('/organization/:organizationId/count', jobController.getJobCountByOrganization);
jobRouter.get('/organization/:organizationId/company/:companyId', jobController.getJobsByCompany);
jobRouter.get('/organization/:organizationId/without-overview-video', jobController.getJobsWithoutOverviewVideo);
jobRouter.get('/organization/:organizationId', jobController.getJobsByOrganization);
jobRouter.get('/departments/:organizationId/:departmentId', jobController.getJobsByDepartment);
jobRouter.get('/:jobId', jobController.getJobById);
jobRouter.post('/:jobId/status', jobController.updateJobStatus);

export default jobRouter;
