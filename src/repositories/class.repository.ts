import classModel, { IClass } from '../models/class.model';
import { BaseRepository } from './base.repository';

export class ClassRepository extends BaseRepository<IClass> {
  constructor() {
    super(classModel);
  }

}
