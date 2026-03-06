import cors from "cors";

export const corsMiddleware = cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5173"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});
