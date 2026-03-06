import { Request, Response } from "express";
import { handleRequest } from "../utils/handle-request.util";
import { InterviewBuddyService } from "../services/interviewBuddy.service";

const interviewBuddyService = new InterviewBuddyService();

/**
 * GET /api/interview-buddy-chats?jobId=
 * Returns the Interview Buddy chat for the authenticated user + job (one per job).
 */
export const getInterviewBuddyChat = (req: Request, res: Response): Promise<void> =>
  handleRequest(res, () => {
    const userId = (req as any).user?._id?.toString();
    const jobId = req.query.jobId as string;
    return interviewBuddyService.getChat(userId, jobId);
  });

/**
 * PUT /api/interview-buddy-chats
 * Body: { jobId: string, messages: { role, content, timestamp }[] }
 * Creates or updates the Interview Buddy chat for the authenticated user.
 */
export const saveInterviewBuddyChat = (req: Request, res: Response): Promise<void> =>
  handleRequest(res, () => {
    const userId = (req as any).user?._id?.toString();
    const { jobId, messages } = req.body;
    return interviewBuddyService.saveChat(userId, jobId, messages ?? []);
  });
