import mongoose, { Schema, Document } from "mongoose";

export interface INotificationPreferences extends Document {
  userId: Schema.Types.ObjectId;
  preferences: {
    jobs: {
      enabled: boolean;
      immediate: boolean; // true = immediate, false = batched
      batchWindow: number; // minutes
    };
    assignments: {
      enabled: boolean;
      immediate: boolean;
      batchWindow: number;
    };
    messages: {
      enabled: boolean;
      immediate: boolean;
    };
    deadlines: {
      enabled: boolean;
      immediate: boolean;
    };
    announcements: {
      enabled: boolean;
      immediate: boolean;
      batchWindow: number;
    };
  };
  rateLimit: {
    maxPerHour: number;
    maxPerMinute: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const NotificationPreferencesSchema: Schema<INotificationPreferences> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    preferences: {
      jobs: {
        enabled: { type: Boolean, default: true },
        immediate: { type: Boolean, default: false },
        batchWindow: { type: Number, default: 5 }, // 5 minutes
      },
      assignments: {
        enabled: { type: Boolean, default: true },
        immediate: { type: Boolean, default: false },
        batchWindow: { type: Number, default: 5 },
      },
      messages: {
        enabled: { type: Boolean, default: true },
        immediate: { type: Boolean, default: true }, // Messages are time-sensitive
      },
      deadlines: {
        enabled: { type: Boolean, default: true },
        immediate: { type: Boolean, default: true }, // Deadlines are urgent
      },
      announcements: {
        enabled: { type: Boolean, default: true },
        immediate: { type: Boolean, default: false },
        batchWindow: { type: Number, default: 15 }, // 15 minutes
      },
    },
    rateLimit: {
      maxPerHour: { type: Number, default: 5 },
      maxPerMinute: { type: Number, default: 1 },
    },
  },
  { timestamps: true }
);

const NotificationPreferencesModel = mongoose.model<INotificationPreferences>(
  "NotificationPreferences",
  NotificationPreferencesSchema
);
export default NotificationPreferencesModel;
