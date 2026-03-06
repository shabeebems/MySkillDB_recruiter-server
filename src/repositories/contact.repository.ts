import ContactModel, { IContact } from "../models/contact.model";
import { BaseRepository } from "./base.repository";

export class ContactRepository extends BaseRepository<IContact> {
  constructor() {
    super(ContactModel);
  }

  async findByProperty(userId: string, designation: string): Promise<IContact[]> {
    return this.model.find({ userId, designation }).sort({ createdAt: -1 }).lean();
  }

  async findByUserId(userId: string): Promise<IContact[]> {
    return this.model.find({ userId }).sort({ createdAt: -1 }).lean();
  }
}