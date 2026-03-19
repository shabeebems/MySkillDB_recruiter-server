import cors from "cors";

export const corsMiddleware = cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:5174"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With", "Origin"],
  exposedHeaders: ["x-new-access-token"],
  credentials: true,
});
