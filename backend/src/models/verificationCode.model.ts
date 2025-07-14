import mongoose from "mongoose";
import { VerificationCodeType } from "../constants/verificationCodeType.js";

interface VerificationCode extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  type: VerificationCodeType;
  createdAt: Date;
  expiresAt: Date;
}

const verificationCodeSchema = new mongoose.Schema<VerificationCode>({
  userId: {
    ref: "User",
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
  },
  type: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
  expiresAt: { type: Date, required: true },
});

export const VerificationCodeModel = mongoose.model(
  "VerificationCode",
  verificationCodeSchema,
  "verification_code"
);
