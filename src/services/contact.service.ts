import { Messages } from "../constants/messages";
import { IContact } from "../models/contact.model";
import { ContactRepository } from "../repositories/contact.repository";
import { ServiceResponse } from "./types";

export class ContactService {
  private contactRepository = new ContactRepository();

  public async createContact(data: Partial<IContact> & { userId: string }): Promise<ServiceResponse> {
    const newContact = await this.contactRepository.create(data);

    return {
      success: true,
      message: Messages.CONTACT_CREATED_SUCCESS,
      data: newContact,
    };
  }

  public async getContactsByDesig(userId: string, designation: string): Promise<ServiceResponse> {
    const contacts = await this.contactRepository.findByProperty(userId, designation);

    return {
      success: true,
      message: Messages.CONTACT_FETCH_SUCCESS,
      data: contacts
    };
  }

  public async getAllContacts(userId: string): Promise<ServiceResponse> {
    const contacts = await this.contactRepository.findByUserId(userId);

    return {
      success: true,
      message: Messages.CONTACT_FETCH_SUCCESS,
      data: contacts
    };
  }
}
