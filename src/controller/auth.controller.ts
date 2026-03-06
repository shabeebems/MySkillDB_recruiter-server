import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { handleRequest } from "../utils/handle-request.util";

export class AuthController {
  private authService = new AuthService();

  public login = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () => this.authService.login(req.body));

  public refreshToken = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () => this.authService.refreshToken(req));

  public logout = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () => this.authService.logout());

  public checkAuth = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () => this.authService.checkAuth(req, res));

  public forgotPassword = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () => this.authService.forgotPassword(req.body.email));

  public resetPassword = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.authService.resetPassword(req.body.token, req.body.newPassword)
    );
}
