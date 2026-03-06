import { Router } from "express";
import { CertificateController } from "../controller/certificate.controller";
import { authenticateToken } from "../middlewares/tokenValidation";

const certificateRouter: Router = Router();
const certificateController = new CertificateController();

certificateRouter.use(authenticateToken(["master_admin", "org_admin", "student"]));

certificateRouter.post("/", certificateController.createCertificate);
certificateRouter.get("/", certificateController.getCertificates);
certificateRouter.get("/student/all", certificateController.getCertificatesByStudent);
certificateRouter.delete("/:id", certificateController.deleteCertificate);

export default certificateRouter;

