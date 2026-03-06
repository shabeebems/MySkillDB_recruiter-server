import { Response } from "express";
import { HttpStatus } from "../constants/statusCode";
import { LogMessages } from "../constants/messages";
import { createChildLogger } from "./logger";

const log = createChildLogger("HandleRequestUtil");

type HandlerFunction<T> = () => Promise<{
  success: boolean;
  message: string;
  data?: T;
}>;

export async function handleRequest<T>(
  res: Response,
  fn: HandlerFunction<T>
): Promise<void> {
  try {
    const result = await fn();
    const { success, message, data } = result;
    const statusCode = (result as { statusCode?: number }).statusCode;
    const status = success
      ? HttpStatus.OK
      : statusCode && statusCode >= 400 && statusCode < 600
        ? statusCode
        : HttpStatus.BAD_REQUEST;
    res.status(status).json({ success, message, data });
  } catch (error: any) {
    log.error({ err: error, message: error.message }, LogMessages.HANDLE_REQUEST_ERROR);

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
}
