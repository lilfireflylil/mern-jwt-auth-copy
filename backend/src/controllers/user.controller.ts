import { Request, Response } from "express";
import { UserModel } from "../models/user.model.js";
import { appAssert } from "../utils/appAssert.js";
import { NOT_FOUND, OK } from "../constants/http.js";

export async function getUserHandler(req: Request, res: Response) {
  const user = await UserModel.findById(req.user?.userId);
  appAssert(user, NOT_FOUND, "User not found");

  res.status(OK).json(user);
}
