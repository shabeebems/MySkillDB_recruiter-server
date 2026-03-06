import { VirtualSessionRepository } from "../repositories/virtualSession.repository";
import { Messages } from "../constants/messages";
import { ServiceResponse } from "./types";
import { IVirtualSession } from "../models/virtualSession.model";
import { NotificationBatchingService } from "./notificationBatching.service";
import { Types } from "mongoose";
import { createChildLogger } from "../utils/logger";

const log = createChildLogger("VirtualSessionService");


export class VirtualSessionService {
  private virtualSessionRepository = new VirtualSessionRepository();
  private notificationBatchingService = new NotificationBatchingService();

  private getStartsAt(dateStr: string, timeStr: string): Date | undefined {
    if (!dateStr || !timeStr) return undefined;
    const startsAt = new Date(`${dateStr}T${timeStr}`);
    if (Number.isNaN(startsAt.getTime())) return undefined;
    return startsAt;
  }

  /**
   * Compute expiresAt for non-recurring sessions: session end (date+time) + 1 hour.
   * Not set for recurring sessions so they are not auto-deleted by TTL.
   */
  private getExpiresAtForNonRecurring(dateStr: string, timeStr: string): Date | undefined {
    if (!dateStr || !timeStr) return undefined;
    const sessionEnd = new Date(`${dateStr}T${timeStr}`);
    if (Number.isNaN(sessionEnd.getTime())) return undefined;
    return new Date(sessionEnd.getTime() + 60 * 60 * 1000); // +1 hour
  }

  public async createVirtualSession(data: any, createdBy?: string): Promise<ServiceResponse> {
    const isRecurring = data.isRecurring ?? false;
    const payload: any = {
      name: data.name,
      meetLink: data.meetLink || undefined,
      date: data.date,
      time: data.time,
      sessionType: data.sessionType,
      organizationId: new Types.ObjectId(data.organizationId),
      isRecurring,
      frequency: isRecurring ? data.frequency : undefined,
      inviteeUserIds: (data.inviteeUserIds || []).map((id: string) => new Types.ObjectId(id)),
      inviteeEmails: data.inviteeEmails || [],
    };

    const startsAt = this.getStartsAt(data.date, data.time);
    if (startsAt) payload.startsAt = startsAt;

    if (!isRecurring) {
      const expiresAt = this.getExpiresAtForNonRecurring(data.date, data.time);
      if (expiresAt) payload.expiresAt = expiresAt;
    }

    if (data.sessionType === "academic") {
      if (!data.subjectId) {
        return { success: false, message: "Subject is required for academic sessions", data: null };
      }
      payload.subjectId = new Types.ObjectId(data.subjectId);
    } else if (data.sessionType === "job") {
      if (!data.jobId || !data.skillIds?.length) {
        return { success: false, message: "Job and at least one skill are required for job sessions", data: null };
      }
      payload.jobId = new Types.ObjectId(data.jobId);
      payload.skillIds = data.skillIds || [];
    }

    if (createdBy) {
      payload.createdBy = new Types.ObjectId(createdBy);
    }

    const session = await this.virtualSessionRepository.create(payload as Partial<IVirtualSession>);
    const sessionId = String(session._id);

    // Queue notifications for all invitees (non-blocking)
    this.notificationBatchingService
      .queueVirtualSessionNotification(
        sessionId,
        data.name,
        data.date,
        data.time,
        data.meetLink,
        (data.inviteeUserIds || []).map((id: string) => String(id))
      )
      .catch((error) => {
        log.error({ err: error }, "Error queueing virtual session notifications:");
      });

    const populated = await this.virtualSessionRepository.findById(sessionId);
    return {
      success: true,
      message: Messages.VIRTUAL_SESSION_CREATED_SUCCESS,
      data: populated || session,
    };
  }

  public async getVirtualSessionsByOrganization(organizationId: string): Promise<ServiceResponse> {
    const sessions = await this.virtualSessionRepository.findByOrganizationId(organizationId);
    return {
      success: true,
      message: Messages.VIRTUAL_SESSION_FETCH_SUCCESS,
      data: sessions,
    };
  }

  public async getVirtualSessionById(sessionId: string): Promise<ServiceResponse> {
    const session = await this.virtualSessionRepository.findById(sessionId);
    if (!session) {
      return {
        success: false,
        message: Messages.VIRTUAL_SESSION_NOT_FOUND,
        data: null,
      };
    }
    return {
      success: true,
      message: Messages.VIRTUAL_SESSION_FETCH_SUCCESS,
      data: session,
    };
  }

  public async getNextVirtualSessionForUser(
    organizationId: string,
    userId: string
  ): Promise<ServiceResponse> {
    if (!organizationId || !userId) {
      return { success: true, message: Messages.VIRTUAL_SESSION_FETCH_SUCCESS, data: null };
    }
    const sessions = await this.virtualSessionRepository.findForInvitee(
      organizationId,
      userId
    );
    const now = new Date();
    for (const session of sessions) {
      const start = (session as any).startsAt
        ? new Date((session as any).startsAt)
        : this.getStartsAt((session as any).date, (session as any).time);
      if (start && !Number.isNaN(start.getTime()) && start >= now) {
        return {
          success: true,
          message: Messages.VIRTUAL_SESSION_FETCH_SUCCESS,
          data: session,
        };
      }
    }
    return { success: true, message: Messages.VIRTUAL_SESSION_FETCH_SUCCESS, data: null };
  }

  public async updateVirtualSession(sessionId: string, data: any): Promise<ServiceResponse> {
    const session = await this.virtualSessionRepository.findById(sessionId);
    if (!session) {
      return { success: false, message: Messages.VIRTUAL_SESSION_NOT_FOUND, data: null };
    }
    const payload: any = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.meetLink !== undefined) payload.meetLink = data.meetLink || undefined;
    if (data.date !== undefined) payload.date = data.date;
    if (data.time !== undefined) payload.time = data.time;
    if (data.isRecurring !== undefined) payload.isRecurring = data.isRecurring;
    if (data.frequency !== undefined) payload.frequency = data.isRecurring ? data.frequency : undefined;

    const dateStr = payload.date ?? (session as any).date;
    const timeStr = payload.time ?? (session as any).time;
    const startsAt = this.getStartsAt(dateStr, timeStr);
    if (startsAt) payload.startsAt = startsAt;

    const isRecurring = payload.isRecurring ?? (session as any).isRecurring;
    if (!isRecurring) {
      const expiresAt = this.getExpiresAtForNonRecurring(dateStr, timeStr);
      if (expiresAt) payload.expiresAt = expiresAt;
    } else {
      payload.expiresAt = undefined;
    }

    const updated = await this.virtualSessionRepository.update(sessionId, payload as Partial<IVirtualSession>);
    const populated = updated ? await this.virtualSessionRepository.findById(String(updated._id)) : null;
    return {
      success: true,
      message: "Virtual session updated successfully",
      data: populated || updated,
    };
  }

  public async deleteVirtualSession(sessionId: string): Promise<ServiceResponse> {
    const session = await this.virtualSessionRepository.findById(sessionId);
    if (!session) {
      return { success: false, message: Messages.VIRTUAL_SESSION_NOT_FOUND, data: null };
    }
    await this.virtualSessionRepository.delete(sessionId);
    return { success: true, message: "Virtual session deleted successfully", data: null };
  }
}
