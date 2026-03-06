import { Router } from "express";
import { AuthController } from "../controller/auth.controller";
import { loginSchema } from "../schemas/auth.schema";
import { validate } from "../middlewares/zodValidate";

const authRouter: Router = Router();

const authController = new AuthController();

authRouter.post("/login", validate(loginSchema), authController.login);
authRouter.post("/refresh", authController.refreshToken);
authRouter.post("/logout", authController.logout);
authRouter.post("/forgot-password", authController.forgotPassword);
authRouter.post("/reset-password", authController.resetPassword);
authRouter.get("/me", authController.checkAuth);

export default authRouter;
