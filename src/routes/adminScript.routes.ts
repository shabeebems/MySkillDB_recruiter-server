import { Router } from "express";
import { AdminScriptController } from "../controller/adminScript.controller";
import { authenticateToken } from "../middlewares/tokenValidation";

const adminScriptRouter = Router();
const adminScriptController = new AdminScriptController();

adminScriptRouter.use(authenticateToken(["master_admin", "org_admin"]));

adminScriptRouter.get(
  "/organization/:organizationId",
  adminScriptController.getByOrganizationId
);
adminScriptRouter.get("/:id/sections", adminScriptController.getSections);
adminScriptRouter.delete("/:id", adminScriptController.deleteAdminScript);

export default adminScriptRouter;
