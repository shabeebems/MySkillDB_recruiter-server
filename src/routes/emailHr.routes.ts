import { Router } from "express";
import { EmailHrController } from "../controller/emailHr.controller";
import { authenticateToken } from "../middlewares/tokenValidation";
import { validate } from "../middlewares/zodValidate";
import { createEmailHrSchema } from "../schemas/emailHr.schema";

const emailHrRouter: Router = Router();
const emailHrController = new EmailHrController();

emailHrRouter.post(
  "/",
  authenticateToken(["master_admin", "org_admin"]),
  validate(createEmailHrSchema),
  emailHrController.createEmailHr
);

emailHrRouter.get(
  "/",
  authenticateToken(["master_admin", "org_admin"]),
  emailHrController.getEmailHrByOrganization
);

// Public route for viewing student CVs (accessed via email link)
emailHrRouter.get(
  "/:id",
  emailHrController.getEmailHrWithStudents
);

// Public route for fetching student CV data
emailHrRouter.get(
  "/student/:studentId/cv",
  emailHrController.getStudentCVData
);

export default emailHrRouter;

