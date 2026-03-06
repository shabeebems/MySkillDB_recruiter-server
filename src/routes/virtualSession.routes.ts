import { Router } from "express";
import { VirtualSessionController } from "../controller/virtualSession.controller";
import { authenticateToken } from "../middlewares/tokenValidation";
import { validate } from "../middlewares/zodValidate";
import { createVirtualSessionSchema, updateVirtualSessionSchema } from "../schemas/virtualSession.schema";

const virtualSessionRouter: Router = Router();
const virtualSessionController = new VirtualSessionController();

virtualSessionRouter.use(authenticateToken(["master_admin", "org_admin", "student"]));

virtualSessionRouter.post(
  "/",
  validate(createVirtualSessionSchema),
  virtualSessionController.createVirtualSession
);
virtualSessionRouter.get(
  "/my/next",
  virtualSessionController.getNextForCurrentUser
);
virtualSessionRouter.get(
  "/organization/:organizationId",
  virtualSessionController.getVirtualSessionsByOrganization
);
virtualSessionRouter.get(
  "/:sessionId",
  virtualSessionController.getVirtualSessionById
);
virtualSessionRouter.put(
  "/:sessionId",
  validate(updateVirtualSessionSchema),
  virtualSessionController.updateVirtualSession
);
virtualSessionRouter.delete(
  "/:sessionId",
  virtualSessionController.deleteVirtualSession
);

export default virtualSessionRouter;
