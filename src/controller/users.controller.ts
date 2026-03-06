import { Request, Response } from "express";
import { handleRequest } from "../utils/handle-request.util";
import { UserService } from "../services/users.service";

export class UserController {
  private userService = new UserService();

  public createUser = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () => this.userService.createUser(req.body));

  public findUsersByFilter = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () => this.userService.findUsersByFilter(req.query));

  public getAccManagerById = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () => this.userService.getAccManagerById(req.params.id));

  public updateUser = (req: any, res: Response): Promise<void> => {
    const userId = req.params.id || req.user?._id?.toString();
    return handleRequest(res, () => this.userService.updateUser(userId, req.body));
  };

  public deleteUser = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () => this.userService.deleteUser(req.params.id));

  public bulkCreateStudents = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () => this.userService.bulkCreateStudents(req.body.students || []));

  public changePassword = (req: any, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString();
    const { oldPassword, newPassword, confirmPassword } = req.body;
    
    if (!userId) {
      return handleRequest(
        res,
        async () => ({
          success: false,
          message: "User not authenticated",
          data: null,
        })
      );
    }
    
    return handleRequest(
      res,
      () => this.userService.changePassword(userId, oldPassword, newPassword, confirmPassword)
    );
  };
}
