import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { extractTokenFromHeader } from "../utils/jwt";
import { UserRepository } from "../repositories/user.repository";
import { createChildLogger } from "../utils/logger";

const log = createChildLogger("tokenValidation");


const userSchema = new UserRepository();

export const authenticateToken = (allowedRoles: string[]) => {
  return async (req: any, res: Response, next: NextFunction) => {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization;
      const { ACCESS_TOKEN_SECRET } = process.env;

      if (!ACCESS_TOKEN_SECRET) {
        throw new Error("ACCESS_TOKEN_SECRET is not defined");
      }

      const handleUser = async (userDetails: any) => {
        if (userDetails.isBlock || !userDetails.isVerified) {
          return res.status(403).json({ success: false, message: "USER_BLOCKED" });
        }

        if (!allowedRoles.includes(userDetails.role)) {
          return res.status(403).json({ success: false, message: "UNAUTHORIZED_ACCESS" });
        }
        
        req.user = userDetails;
        next();
      };

      if (!authHeader) {
        return res.status(401).json({ success: false, message: "NO_TOKEN" });
      }

      const token = extractTokenFromHeader(req);
      if (!token) {
        return res.status(401).json({ success: false, message: "INVALID_TOKEN_FORMAT" });
      }

      // Verify access token (frontend always sends access token in Authorization header)
      try {
        const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as any;
        const userDetails = await userSchema.findUserByToken(token, ACCESS_TOKEN_SECRET);
        
        if (!userDetails) {
          return res.status(401).json({ success: false, message: "INVALID_TOKEN" });
        }

        return handleUser(userDetails);
      } catch (error) {
        // Access token is expired or invalid - return 401
        // Frontend interceptor will handle refresh token logic
        return res.status(401).json({ success: false, message: "TOKEN_EXPIRED_OR_INVALID" });
      }
    } catch (err) {
      log.error({ err }, "INTERNAL_SERVER_ERROR");
      return res.status(500).json({ success: false, message: "INTERNAL_SERVER_ERROR" });
    }
  };
};
