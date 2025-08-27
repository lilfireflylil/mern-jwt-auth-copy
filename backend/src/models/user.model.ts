import mongoose from "mongoose";
import { compareValue, hashValue } from "../utils/bcrypt.js";

export interface UserDocument extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword: (password: string) => Promise<boolean>;
}

const userSchema = new mongoose.Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    verified: { type: Boolean, default: false },
    createdAt: { type: Date, immutable: true },
    updatedAt: Date,
  },
  {
    // this will automatically add createdAt and updatedAt fields
    timestamps: true,

    // when converting the document to JSON or a plain object
    // we want to remove sensitive fields.
    toJSON: {
      transform(doc, ret) {
        // Rename _id to id
        ret.id = ret._id;
        // Remove sensitive fields
        delete ret.password;
        delete ret._id;
        delete ret.__v;

        return ret;
      },
    },
    toObject: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret.password;
        delete ret._id;
        delete ret.__v;

        return ret;
      },
    },
  }
);

// Method to compare the provided password with the hashed password
userSchema.method("comparePassword", async function (password: string) {
  return await compareValue(password, this.password);
});

// Pre-save hook to hash the password before saving the user document
userSchema.pre("save", async function (next) {
  // If the password is not modified, skip hashing
  if (!this.isModified("password")) return next();

  this.password = await hashValue(this.password);
  next();
});

export const UserModel = mongoose.model<UserDocument>("User", userSchema);
