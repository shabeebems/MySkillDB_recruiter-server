import VideoCvScriptModel, { IVideoCvScript } from "../models/videoCvScript.model";
import { BaseRepository } from "./base.repository";

export class VideoCvScriptRepository extends BaseRepository<IVideoCvScript> {
  constructor() {
    super(VideoCvScriptModel);
  }
}

