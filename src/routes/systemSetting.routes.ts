import { Router } from "express";
import { SystemSettingController } from "../controller/systemSetting.controller";
import { validate } from "../middlewares/zodValidate";
import { systemSettingSchema } from "../schemas/systemSetting.schema";
import { authenticateToken } from "../middlewares/tokenValidation";

const router = Router();
const controller = new SystemSettingController();

router.use(authenticateToken(["master_admin"]));

router.post(
  "/:systemCode",
  validate(systemSettingSchema),
  controller.addOrUpdateValue
);

router.get("/:systemCode", controller.getValuesBySystemCode);
router.patch("/:systemCode", controller.deleteValueBySystemCode);

export default router;
