import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/user.repository";
import { OrganizationRepository } from "../repositories/organization.repository";
import { Messages } from "../constants/messages";
import { LoginRequest, ServiceResponse } from "./types";
import {
  createAccessToken,
  createRefreshToken,
  extractTokenFromHeader,
} from "../utils/jwt";
import { sendEmail } from "./email.service";
import { getPasswordResetEmailTemplate } from "../utils/email-template.util";
import crypto from "crypto";
import { decryptPassword, isEncryptedPassword } from "../utils/passwordDecrypt";
import { createChildLogger } from "../utils/logger";

const log = createChildLogger("AuthService");


export class AuthService {
  private userRepository = new UserRepository();
  private organizationRepository = new OrganizationRepository();

  public async login(
    data: LoginRequest
  ): Promise<ServiceResponse> {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) return { success: false, message: Messages.USER_NOT_FOUND };

    if (!user.password) {
      return { success: false, message: Messages.PASSWORD_INCORRECT };
    }

    // Decrypt password if it's encrypted (from new client)
    let plainPassword: string;
    
    if (isEncryptedPassword(data.password)) {
      try {
        // Decrypt the password
        plainPassword = decryptPassword(data.password);
      } catch (error) {
        log.error({ err: error }, "Password decryption failed:");
        return { success: false, message: Messages.PASSWORD_INCORRECT };
      }
    } else {
      // Plain password (legacy support or direct input)
      plainPassword = data.password;
    }

    // Compare with bcrypt hash stored in database (as before)
    const isPasswordValid = await bcrypt.compare(plainPassword, user.password);

    if (!isPasswordValid)
      return { success: false, message: Messages.PASSWORD_INCORRECT };

    if (user.isBlock) return { success: false, message: Messages.USER_BLOCKED };

    if (user.organizationId) {
      const organization = await this.organizationRepository.findById(
        user.organizationId.toString()
      );
      if (!organization) {
        return { success: false, message: Messages.ORGANIZATION_NOT_FOUND };
      }
      if (organization.status !== "active") {
        return { success: false, message: Messages.ORGANIZATION_NOT_ACTIVE };
      }
    }

    const { _id, email, role, organizationId } = user;
    const payload = { _id, email, role, organizationId };

    // Generate tokens and return in response body
    const accessToken = createAccessToken(payload);
    const refreshToken = createRefreshToken(payload);

    return {
      success: true,
      message: Messages.LOGIN_SUCCESS,
      data: {
        ...payload,
        accessToken,
        refreshToken,
      },
    };
  }

  public async refreshToken(req: Request): Promise<ServiceResponse> {
    try {
      const refreshToken = extractTokenFromHeader(req);
      const { REFRESH_TOKEN_SECRET } = process.env;

      if (!REFRESH_TOKEN_SECRET) {
        return { success: false, message: "Token secret is not defined" };
      }

      if (!refreshToken) {
        return { success: false, message: "Refresh token is required" };
      }

      // Verify refresh token
      try {
        jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
        const userDetails = await this.userRepository.findUserByToken(
          refreshToken,
          REFRESH_TOKEN_SECRET
        );

        if (!userDetails) {
          return { success: false, message: "Invalid refresh token" };
        }

        if (userDetails.isBlock || !userDetails.isVerified) {
          return { success: false, message: Messages.USER_BLOCKED };
        }

        // Generate new access token
        const { _id, email, role, organizationId } = userDetails;
        const newAccessToken = createAccessToken({ _id, email, role, organizationId });

        return {
          success: true,
          message: "Token refreshed successfully",
          data: {
            accessToken: newAccessToken,
          },
        };
      } catch (error) {
        return { success: false, message: "Invalid or expired refresh token" };
      }
    } catch (err) {
      log.error({ err: err }, "Refresh token error:");
      return { success: false, message: Messages.INTERNAL_SERVER_ERROR };
    }
  }

  public async logout(): Promise<ServiceResponse> {
    return { success: true, message: Messages.LOGOUT_SUCCESS };
  }

  public async checkAuth(req: Request, res: Response): Promise<ServiceResponse> {
    try {
      const token = extractTokenFromHeader(req);
      const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env;

      if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
        return { success: false, message: "Token secrets are not defined" };
      }

      if (!token) {
        // No token - return success with null data (expected for auth pages)
        return { success: true, message: "No authentication found", data: null };
      }

      // Try access token first
      try {
        jwt.verify(token, ACCESS_TOKEN_SECRET);
        const userDetails = await this.userRepository.findUserByToken(
          token,
          ACCESS_TOKEN_SECRET
        );

        if (userDetails && !userDetails.isBlock && userDetails.isVerified) {
          const { _id, email, role, organizationId } = userDetails;
          return {
            success: true,
            message: "User authenticated",
            data: { _id, email, role, organizationId },
          };
        }
      } catch {
        // Access token invalid, try refresh token
      }

      // Try refresh token
      try {
        jwt.verify(token, REFRESH_TOKEN_SECRET);
        const userDetails = await this.userRepository.findUserByToken(
          token,
          REFRESH_TOKEN_SECRET
        );

        if (userDetails && !userDetails.isBlock && userDetails.isVerified) {
          const { _id, email, role, organizationId } = userDetails;
          
          // Create new access token and return in response
          const newAccessToken = createAccessToken({ _id, email, role, organizationId });

          // Set new access token in response header for client to update
          res.setHeader('X-New-Access-Token', newAccessToken);

          return {
            success: true,
            message: "User authenticated",
            data: { _id, email, role, organizationId },
          };
        }
      } catch {
        // Refresh token invalid
      }

      // No valid tokens - return success with null data (this is expected for auth pages)
      return { success: true, message: "No authentication found", data: null };
    } catch (err) {
      log.error({ err: err }, "Check auth error:");
      return { success: false, message: Messages.INTERNAL_SERVER_ERROR };
    }
  }

  public async forgotPassword(email: string): Promise<ServiceResponse> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      return { success: false, message: "No account found with this email address." };
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Save token and expiration to user (1 hour expiration)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000);
    await user.save();

    // Send email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    log.info(resetUrl);
    const emailHtml = getPasswordResetEmailTemplate({
      resetUrl,
      userName: user.name
    });

    try {
      await sendEmail(user.email, "Password Reset Request", emailHtml);
      return { success: true, message: "Password reset link sent to your email." };
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      return { success: false, message: "Email could not be sent" };
    }
  }

  public async resetPassword(token: string, newPassword: string): Promise<ServiceResponse> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.userRepository.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() }, // Check if not expired
    });

    if (!user) {
      return { success: false, message: "Invalid or expired token" };
    }

    // Decrypt password if encrypted
    let plainNewPassword: string;
    
    if (isEncryptedPassword(newPassword)) {
      try {
        plainNewPassword = decryptPassword(newPassword);
      } catch (error) {
        return { success: false, message: "Invalid encrypted password format" };
      }
    } else {
      plainNewPassword = newPassword;
    }

    // Validate password
    if (plainNewPassword.length < 8) {
        return { success: false, message: "Password must be at least 8 characters" };
    }

    // Hash password with bcrypt (as before)
    const hashedPassword = await bcrypt.hash(plainNewPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return { success: true, message: "Password reset successfully" };
  }
}
