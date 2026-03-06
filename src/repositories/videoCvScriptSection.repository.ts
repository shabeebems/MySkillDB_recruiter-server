import { Types } from "mongoose";
import VideoCvScriptSectionModel, { IVideoCvScriptSection } from "../models/videoCvScriptSection.model";
import { BaseRepository } from "./base.repository";

export class VideoCvScriptSectionRepository extends BaseRepository<IVideoCvScriptSection> {
  constructor() {
    super(VideoCvScriptSectionModel);
  }

  async findByVideoCvScriptId(videoCvScriptId: string): Promise<IVideoCvScriptSection[]> {
    return this.model
      .find({ videoCvScriptId: new Types.ObjectId(videoCvScriptId) })
      .sort({ order: 1 })
      .exec();
  }

  async createMany(sections: Partial<IVideoCvScriptSection>[]): Promise<IVideoCvScriptSection[]> {
    return this.model.insertMany(sections) as unknown as IVideoCvScriptSection[];
  }

  async deleteMany(filter: { videoCvScriptId: string | Types.ObjectId }): Promise<void> {
    const query: any = {
      videoCvScriptId: typeof filter.videoCvScriptId === 'string' 
        ? new Types.ObjectId(filter.videoCvScriptId) 
        : filter.videoCvScriptId
    };
    await this.model.deleteMany(query).exec();
  }
}

