import mongoose, { Schema, Document } from "mongoose";
import { createChildLogger } from "../utils/logger";
import JobModel from "./job.model";

const log = createChildLogger("CompanyModel");

export interface ICompany extends Document {
  name: string;
  /** Lowercase trimmed name — one canonical company per key (no duplicates). */
  nameKey: string;
  description?: string;
  logo?: string;
  website?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema: Schema<ICompany> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    nameKey: { type: String, required: true, trim: true, lowercase: true },
    description: { type: String, trim: true },
    logo: { type: String, trim: true },
    website: { type: String, trim: true },
  },
  { timestamps: true }
);

CompanySchema.index({ nameKey: 1 }, { unique: true });

CompanySchema.pre("save", function (next) {
  if (this.isModified("name") || this.isNew) {
    (this as ICompany).nameKey = String(this.name).trim().toLowerCase();
  }
  next();
});

const CompanyModel = mongoose.model<ICompany>("Company", CompanySchema);
export default CompanyModel;

/**
 * Backfill nameKey, merge duplicate companies (same nameKey), drop legacy indexes, sync.
 * Run after DB connect.
 */
export async function ensureCompanyIndexes(): Promise<void> {
  try {
    const coll = mongoose.connection.collection("companies");

    for (const indexName of ["name_1", "name_1_createdByStudentId_1"]) {
      try {
        await coll.dropIndex(indexName);
        log.info({ indexName }, "Dropped legacy companies index");
      } catch (e: any) {
        if (e?.codeName !== "IndexNotFound" && e?.code !== 27) {
          log.warn({ err: e, indexName }, "Could not drop legacy index");
        }
      }
    }

    await CompanyModel.updateMany(
      { createdByStudentId: { $exists: true } },
      { $unset: { createdByStudentId: 1 } }
    ).exec();

    const needsKey = await CompanyModel.find({
      $or: [{ nameKey: { $exists: false } }, { nameKey: null }, { nameKey: "" }],
    })
      .select("_id name")
      .lean()
      .exec();
    for (const row of needsKey) {
      const nk = String(row.name ?? "")
        .trim()
        .toLowerCase();
      if (nk) {
        await CompanyModel.updateOne({ _id: row._id }, { $set: { nameKey: nk } }).exec();
      }
    }

    const dupGroups = await CompanyModel.aggregate([
      { $match: { nameKey: { $exists: true, $nin: [null, ""] } } },
      {
        $group: {
          _id: "$nameKey",
          ids: { $push: "$_id" },
          count: { $sum: 1 },
        },
      },
      { $match: { count: { $gt: 1 } } },
    ]).exec();

    for (const g of dupGroups) {
      const ids = (g.ids as mongoose.Types.ObjectId[])
        .map((id) => id.toString())
        .sort();
      const keep = ids[0];
      for (let i = 1; i < ids.length; i++) {
        const dup = ids[i];
        await JobModel.updateMany(
          { companyId: dup },
          { $set: { companyId: keep } }
        ).exec();
        await CompanyModel.deleteOne({ _id: dup }).exec();
        log.info({ mergedInto: keep, removed: dup, nameKey: g._id }, "Merged duplicate company");
      }
    }

    await CompanyModel.syncIndexes();
    log.info("Company indexes synced");
  } catch (err) {
    log.error({ err }, "ensureCompanyIndexes failed");
  }
}
