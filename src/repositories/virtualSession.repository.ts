import VirtualSessionModel, { IVirtualSession } from "../models/virtualSession.model";
import { BaseRepository } from "./base.repository";
import { Types } from "mongoose";

export class VirtualSessionRepository extends BaseRepository<IVirtualSession> {
  constructor() {
    super(VirtualSessionModel);
  }

  async findByOrganizationId(organizationId: string): Promise<IVirtualSession[]> {
    return this.model
      .find({ organizationId: new Types.ObjectId(organizationId) })
      .sort({ createdAt: -1 })
      .populate("subjectId", "name code")
      .populate("jobId", "name companyName")
      .populate("createdBy", "name email")
      .exec();
  }

  /** Find sessions where user is invitee (for upcoming logic). Does not filter by date so service can support legacy docs without startsAt. */
  async findForInvitee(
    organizationId: string,
    userId: string
  ): Promise<IVirtualSession[]> {
    return this.model
      .find({
        organizationId: new Types.ObjectId(organizationId),
        inviteeUserIds: new Types.ObjectId(userId),
      })
      .sort({ startsAt: 1, date: 1, time: 1 })
      .populate("subjectId", "name code")
      .populate("jobId", "name companyName")
      .exec();
  }
}
