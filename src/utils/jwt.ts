import { Request } from "express";
import jwt from "jsonwebtoken";
import { Messages } from "../constants/messages";

interface TokenPayload {
  _id: any;
  email: string;
  role: string;
  organizationId?: any;
}

/**
 * Creates an access token and returns it as a string
 * (No longer sets cookies - tokens are returned in JSON response)
 */
export const createAccessToken = (payload: TokenPayload): string => {
  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) throw new Error(Messages.ACCESS_TOKEN_NOT_DEFINED);

  return jwt.sign(payload, secret, {
    expiresIn: "30m",
    algorithm: "HS256",
  });
};

/**
 * Creates a refresh token and returns it as a string
 * (No longer sets cookies - tokens are returned in JSON response)
 */
export const createRefreshToken = (payload: TokenPayload): string => {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (!secret) throw new Error(Messages.REFRESH_TOKEN_NOT_DEFINED);
  return jwt.sign(payload, secret, {
    expiresIn: "5d",
    algorithm: "HS256",
  });
};

/**
 * Extract token from Authorization header
 * Format: "Bearer <token>"
 */
export const extractTokenFromHeader = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  return parts[1];
};

/**
 * Decode token from Authorization header
 */
export const decodeToken = async (req: Request): Promise<any> => {
  const token = extractTokenFromHeader(req);
  if (!token) return null;
  return jwt.decode(token);
};
