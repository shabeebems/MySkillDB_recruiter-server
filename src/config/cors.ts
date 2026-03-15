import cors from "cors";

export const corsMiddleware = cors({
  origin: function (origin, callback) {
    // Always allow the origin to pass CORS
    callback(null, origin || true);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With", "Origin"],
  exposedHeaders: ["x-new-access-token"],
  credentials: true,
});
