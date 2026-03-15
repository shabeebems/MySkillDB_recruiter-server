import express from "express";
import connectDB from "./config/db";
import dotenv from "dotenv";
import { corsMiddleware } from "./config/cors";
import cookieParser from 'cookie-parser';
import { requestLogger } from "./utils/logger/requestLogger";
import { errorLogger } from "./utils/logger/errorLogger";
import { logger } from "./utils/logger";
// Initialize Firebase Admin SDK
import "./config/firebaseAdmin";
import authRoutes from "./routes/auth.routes";
import locationRoutes from "./routes/location.routes";
import organizationRoutes from "./routes/organization.route";
import userRoutes from "./routes/user.routes";
import systemManagerRoutes from "./routes/systemSetting.routes";
import organizationSetupRoutes from "./routes/organization-setup.routes";
import meRoutes from "./routes/me.routes";
import topicRoutes from "./routes/topic.routes";
import skillRoutes from "./routes/skill.routes";
import flipCardRoutes from "./routes/flipCard.routes";
import jobFlipCardResultRoutes from "./routes/jobFlipCardResult.routes";
import jobRoutes from "./routes/job.routes";
import jobSprintRoutes from "./routes/jobSprint.routes";
import sprintProgressRoutes from "./routes/sprintProgress.routes";
import videoCvRoutes from "./routes/videoCv.routes";
import testRoutes from "./routes/test.routes";
import recordingRoutes from "./routes/recording.routes";
import studentTestHistoryRoutes from "./routes/studentTestHistory.routes";
import interviewPlannerRoutes from "./routes/interviewPlanner.routes";
import interviewBuddyRoutes from "./routes/interviewBuddy.routes";
import readingModuleRoutes from "./routes/readingModule.routes";
import adminScriptRoutes from "./routes/adminScript.routes";
import videoScriptRoutes from "./routes/videoScript.routes";
import contactRoutes from "./routes/contact.routes";
import certificateRoutes from "./routes/certificate.routes";
import testimonialRoutes from "./routes/testimonial.routes";
import linkedInPostRoutes from "./routes/linkedInPost.routes";
import studentVideoRoutes from "./routes/studentVideo.routes";
import cvRoutes from "./routes/cv.routes";
import companyRoutes from "./routes/company.routes";
import videoCvScriptRoutes from "./routes/videoCvScript.routes";
import jobApplicationRoutes from "./routes/jobApplication.routes";
import emailHrRoutes from "./routes/emailHr.routes";
// NEW: Import the AI routes for Vertex AI integration
import aiRoutes from "./routes/ai.routes";
import studentMetricsRoutes from "./routes/studentMetrics.routes";
import totalJobsReportRoutes from "./routes/totalJobsReport.routes"; 
// Push Notification routes
import pushNotificationRoutes from "./routes/pushNotification.routes";
import adminVideoRoutes from "./routes/adminVideo.routes";
import jobOverviewVideoRoutes from "./routes/jobOverviewVideo.routes";
import virtualSessionRoutes from "./routes/virtualSession.routes";
// Notifications (in-app list + mark-as-read)
import notificationRoutes from "./routes/notification.routes";
import healthRoutes from "./routes/health.routes";
// Notification processor cron job
import { startNotificationProcessor } from "./jobs/notificationProcessor.job";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

app.use(cookieParser());
app.use(corsMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Attach Pino request logger early in the middleware chain
app.use(requestLogger);

connectDB();

// Health check (no auth) - for load balancers, Docker HEALTHCHECK, etc.
app.use("/health", healthRoutes);

// NEW: Register the AI routes under a dedicated prefix
app.use("/api/ai", aiRoutes); 

app.use("/api/organization", organizationRoutes);
app.use("/api/organization-setup", organizationSetupRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/system-manager", systemManagerRoutes);
app.use("/api/me", meRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/flip-cards", flipCardRoutes);
app.use("/api/job-flip-card-results", jobFlipCardResultRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/job-sprints", jobSprintRoutes);
app.use("/api/sprint-students", sprintProgressRoutes);
app.use("/api/video-cv", videoCvRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/recordings", recordingRoutes);
app.use("/api/student-test-history", studentTestHistoryRoutes);
app.use("/api/interview-planner", interviewPlannerRoutes);
app.use("/api/interview-buddy-chats", interviewBuddyRoutes);
app.use("/api/reading-modules", readingModuleRoutes);
app.use("/api/admin-scripts", adminScriptRoutes);
app.use("/api/video-scripts", videoScriptRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/linkedin-posts", linkedInPostRoutes);
app.use("/api/student-videos", studentVideoRoutes);
app.use("/api/cv", cvRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/video-cv-scripts", videoCvScriptRoutes);
app.use("/api/job-applications", jobApplicationRoutes);
app.use("/api/email-hr", emailHrRoutes);
app.use("/api/student-metrics", studentMetricsRoutes);
app.use("/api/total-jobs-report", totalJobsReportRoutes);
app.use("/api/fcm", pushNotificationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin-videos", adminVideoRoutes);
app.use("/api/job-overview-videos", jobOverviewVideoRoutes);
app.use("/api/virtual-sessions", virtualSessionRoutes);

// Register global error logger after all routes
app.use(errorLogger);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  
  // Start notification processor cron job
  startNotificationProcessor();
});