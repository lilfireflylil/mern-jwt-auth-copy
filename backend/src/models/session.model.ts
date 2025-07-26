import mongoose from "mongoose";
import { thirtyDaysFromNow } from "../utils/date.js";

export interface SessionDocument extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userAgent?: string;
  createdAt: Date;
  expiresAt: Date;
}

const sessionSchema = new mongoose.Schema<SessionDocument>({
  userId: { ref: "User", type: mongoose.Schema.Types.ObjectId, index: true },
  userAgent: String,
  createdAt: { type: Date, required: true, default: Date.now },
  expiresAt: {
    type: Date,
    required: true,
    default: thirtyDaysFromNow,
    index: { expireAfterSeconds: 0 },
  },
});

export const SessionModel = mongoose.model<SessionDocument>(
  "Session",
  sessionSchema
);
