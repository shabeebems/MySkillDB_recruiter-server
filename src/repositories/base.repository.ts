import { FilterQuery } from "mongoose";
import { Document, Model } from "mongoose";

export abstract class BaseRepository<T extends Document> {
  constructor(protected model: Model<T>) {}

  async create(item: Partial<T>): Promise<T> {
    return this.model.create(item);
  }

  async findAll(): Promise<T[]> {
    return this.model.find().exec();
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  async update(id: string, item: Partial<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, item, { new: true }).exec();
  }

  async delete(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id).exec();
  }

  async findByOrganizationId(organizationId: string): Promise<T[]> {
    return this.model.find({ organizationId }).exec();
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne(filter).exec();
  }

  async find(filter: FilterQuery<T>): Promise<T[]> {
    return this.model.find(filter).exec();
  }
}
