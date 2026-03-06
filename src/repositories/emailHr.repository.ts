import EmailHrModel, { IEmailHr } from "../models/emailHr.model";
import { BaseRepository } from "./base.repository";

export class EmailHrRepository extends BaseRepository<IEmailHr> {
  constructor() {
    super(EmailHrModel);
  }
}

