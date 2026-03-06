import { Router } from "express";
import { UserController } from "../controller/users.controller";
import { authenticateToken } from "../middlewares/tokenValidation";

const userRouter: Router = Router();

const userController = new UserController();

// Allow users to update their own profile (must be before admin-only middleware)
userRouter.put(
  "/me",
  authenticateToken(["org_admin", "master_admin", "student"]),
  userController.updateUser
);

// Allow users to change their password (must be before admin-only middleware)
userRouter.post(
  "/me/change-password",
  authenticateToken(["org_admin", "master_admin", "student"]),
  userController.changePassword
);

// Admin-only routes
userRouter.use(authenticateToken(["master_admin", "org_admin"]));

userRouter.post('/', userController.createUser);
userRouter.get('/', userController.findUsersByFilter);
userRouter.put("/:id", userController.updateUser)
userRouter.delete("/:id", userController.deleteUser)

// Bulk create students
userRouter.post('/bulk', userController.bulkCreateStudents);

export default userRouter;
