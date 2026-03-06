import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { HttpStatus } from "../constants/statusCode";
import { Messages } from "../constants/messages";
import { createChildLogger } from "../utils/logger";

const log = createChildLogger("zodValidate");


export const validate =
  (schema: ZodSchema<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsedData = schema.parse(req.body);
      req.body = parsedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        log.error({ issues: error.issues }, "Validation error:");
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: Messages.VALIDATION_FAILED,
          errors: error.issues.reduce((acc, err) => {
            const fieldPath = err.path.join('.');
            acc[fieldPath] = err.message;
            return acc;
          }, {} as Record<string, string>),
        });
      }

      // Any other error
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: Messages.INTERNAL_SERVER_ERROR });
    }
  };
