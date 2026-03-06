import { Types } from "mongoose";
import InterviewBuddyMessageModel from "../models/interviewBuddy.model";
import { ServiceResponse } from "./types";
import { Messages } from "../constants/messages";
import { createChildLogger } from "../utils/logger";

const log = createChildLogger("InterviewBuddyService");


type MessageInput = {
  role: string;
  content: string;
  question?: string;
  options?: string[];
  timestamp?: string | Date;
};

export class InterviewBuddyService {
  /**
   * Get all messages for a user + job (one doc per message, sorted by createdAt).
   * Returns { messages: [...] } so client contract stays the same.
   */
  async getChat(userId: string | undefined, jobId: string): Promise<ServiceResponse> {
    if (!userId || !jobId) {
      return { success: false, message: "userId and jobId are required", data: null };
    }

    try {
      const docs = await InterviewBuddyMessageModel.find({
        userId: new Types.ObjectId(userId),
        jobId: new Types.ObjectId(jobId),
      })
        .sort({ createdAt: 1 })
        .lean();

      const messages = docs.map((d) => ({
        role: d.role,
        content: d.content ?? "",
        ...(d.question != null && { question: d.question }),
        ...(d.options != null && d.options.length > 0 && { options: d.options }),
        timestamp: d.createdAt,
      }));

      return {
        success: true,
        message: Messages.INTERVIEW_BUDDY_CHAT_FETCH_SUCCESS ?? "Interview Buddy chat fetched successfully",
        data: messages.length ? { messages } : null,
      };
    } catch (error) {
      log.error({ err: error }, "Error fetching Interview Buddy chat:");
      return {
        success: false,
        message: "Failed to fetch Interview Buddy chat",
        data: null,
      };
    }
  }

  /**
   * Replace entire conversation: delete all messages for user+job, then insert one doc per message.
   */
  async saveChat(
    userId: string | undefined,
    jobId: string,
    messages: MessageInput[]
  ): Promise<ServiceResponse> {
    if (!userId || !jobId) {
      return { success: false, message: "userId and jobId are required", data: null };
    }

    try {
      const uid = new Types.ObjectId(userId);
      const jid = new Types.ObjectId(jobId);

      await InterviewBuddyMessageModel.deleteMany({ userId: uid, jobId: jid });

      if (messages.length > 0) {
        await InterviewBuddyMessageModel.insertMany(
          messages.map((m) => ({
            userId: uid,
            jobId: jid,
            role: m.role,
            content: m.content ?? "",
            ...(m.question != null && m.question !== "" && { question: m.question }),
            ...(m.options != null && m.options.length > 0 && { options: m.options }),
            createdAt: m.timestamp ? new Date(m.timestamp) : new Date(),
          }))
        );
      }

      return {
        success: true,
        message: Messages.INTERVIEW_BUDDY_CHAT_SAVED_SUCCESS ?? "Interview Buddy chat saved successfully",
        data: { messages },
      };
    } catch (error) {
      log.error({ err: error }, "Error saving Interview Buddy chat:");
      return {
        success: false,
        message: "Failed to save Interview Buddy chat",
        data: null,
      };
    }
  }
}
