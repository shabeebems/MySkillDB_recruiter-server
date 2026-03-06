import { Request, Response, Router } from "express";
import { authenticateToken } from "../middlewares/tokenValidation";

const meRouter: Router = Router();

meRouter.get(
  "/",
  authenticateToken(["org_admin", "master_admin", "student"]),
  (req: any, res: Response) => {
    res.status(200).json({ success: true, data: req.user });
  }
);

export default meRouter;
