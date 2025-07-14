import mongoose from "mongoose";
import { MONGO_ONLINE_URI, MONGO_URI } from "../constants/env.js";

export async function connectToDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB successfully.");
  } catch (error) {
    console.error("Failed connecting to MongoDB.");
    throw error; // let the caller decide what to do
  }
}
