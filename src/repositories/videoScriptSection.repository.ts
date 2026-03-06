import { Types } from "mongoose";
import VideoScriptSectionModel, { IVideoScriptSection } from "../models/videoScriptSection.model";
import { BaseRepository } from "./base.repository";

export class VideoScriptSectionRepository extends BaseRepository<IVideoScriptSection> {
  constructor() {
    super(VideoScriptSectionModel);
  }

  async findByVideoScriptId(videoScriptId: string): Promise<IVideoScriptSection[]> {
    return this.find({ videoScriptId: new Types.ObjectId(videoScriptId) } as any);
  }

  async createMany(sections: Partial<IVideoScriptSection>[]): Promise<IVideoScriptSection[]> {
    return this.model.insertMany(sections) as Promise<IVideoScriptSection[]>;
  }

  async deleteByVideoScriptId(videoScriptId: string): Promise<void> {
    await this.model.deleteMany({
      videoScriptId: new Types.ObjectId(videoScriptId),
    } as any);
  }
}

