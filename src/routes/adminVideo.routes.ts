import { Router } from "express";
import { AdminVideoController } from "../controller/adminVideo.controller";
import { authenticateToken } from "../middlewares/tokenValidation";

const adminVideoRouter = Router();
const adminVideoController = new AdminVideoController();

adminVideoRouter.use(authenticateToken(["master_admin", "org_admin"]));

adminVideoRouter.get(
  "/organization/:organizationId",
  adminVideoController.getByOrganizationId
);
adminVideoRouter.post("/", adminVideoController.create);

export default adminVideoRouter;
