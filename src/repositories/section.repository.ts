import sectionModel, { ISection } from '../models/section.model';
import { BaseRepository } from './base.repository';

export class SectionRepository extends BaseRepository<ISection> {
  constructor() {
    super(sectionModel);
  }

}
