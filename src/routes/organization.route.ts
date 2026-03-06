import { Router } from "express";
import { OrganizationController } from "../controller/organization.controller";
import { validate } from "../middlewares/zodValidate";
import { organizationSchema } from "../schemas/organization.schema";
import { authenticateToken } from "../middlewares/tokenValidation";

const router = Router();
const organizationController = new OrganizationController();

router.get(
  "/:id",
  authenticateToken(["master_admin", "org_admin", "student"]),
  (req, res) => organizationController.getOrganizationById(req, res)
);

router.use(authenticateToken(["master_admin", "org_admin"]));

router.post("/", validate(organizationSchema), (req, res) =>
  organizationController.createOrganization(req, res)
);

router.get("/", (req, res) =>
  organizationController.getOrganizations(req, res)
);

router.put("/:id", validate(organizationSchema.partial()), (req, res) =>
  organizationController.updateOrganization(req, res)
);

router.patch("/:id/status", (req, res) =>
  organizationController.changeStatus(req, res)
);

export default router;
