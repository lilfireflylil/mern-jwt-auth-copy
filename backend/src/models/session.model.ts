import mongoose from "mongoose";
import { thirtyDaysFromNow } from "../utils/date.js";

export interface SessionDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  userAgent?: string;
  createdAt: Date;
  expiresAt: Date;
}

const sessionSchema = new mongoose.Schema<SessionDocument>({
  userId: { ref: "User", type: mongoose.Schema.Types.ObjectId, index: true },
  userAgent: String,
  createdAt: { type: Date, required: true, default: Date.now },
  expiresAt: { type: Date, required: true, default: thirtyDaysFromNow },
});

export const SessionModel = mongoose.model("Session", sessionSchema);
