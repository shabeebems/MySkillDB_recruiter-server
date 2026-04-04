import { Router } from "express";
import { CompanyController } from "../controller/company.controller";
import { authenticateToken } from "../middlewares/tokenValidation";

const router = Router();
const companyController = new CompanyController();

router.get(
  "/",
  authenticateToken(["master_admin", "org_admin", "student", "hod"]),
  companyController.getCompanies
);

export default router;

