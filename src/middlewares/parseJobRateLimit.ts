import rateLimit from "express-rate-limit";

/** Limit AI job-parse calls per user to control Vertex cost (after auth). */
export const parseJobRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const u = (req as { user?: { _id?: { toString: () => string } } }).user;
    const id = u?._id?.toString?.();
    if (id) return `parse-job:${id}`;
    return `parse-job:${req.ip ?? "unknown"}`;
  },
  message: {
    success: false,
    error: "Too many parse requests. Please wait a moment and try again.",
  },
  statusCode: 429,
});
