import { Router } from "express";
import { CompanyController } from "../controller/company.controller";

const router = Router();
const companyController = new CompanyController();

router.get("/", companyController.getCompanies);

export default router;

