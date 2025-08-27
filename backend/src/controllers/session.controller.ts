import { Request, Response } from "express";
import { SessionModel } from "../models/session.model.js";
import { BAD_REQUEST, NOT_FOUND, OK } from "../constants/http.js";
import { appAssert } from "../utils/appAssert.js";
import { z } from "zod";
import { clearAuthCookies } from "../utils/cookies.js";

export async function getSessionsHandler(req: Request, res: Response) {
  const sessions = await SessionModel.find(
    { userId: req.user?.userId },
    { _id: 1, userAgent: 1, createdAt: 1 },
    { sort: { createdAt: -1 } }
  );
  appAssert(sessions, NOT_FOUND, "No session found");

  res.status(OK).json(
    sessions.map((session) => ({
      ...session.toObject(),
      ...(String(session._id) === String(req.user?.sessionId) && {
        current: true,
      }),
    }))
  );
}

export async function deleteSessionHandler(req: Request, res: Response) {
  const sessionId = z.string().length(24).parse(req.params.id);
  appAssert(sessionId, BAD_REQUEST, "Invalid session Id");

  const deletedSession = await SessionModel.findOneAndDelete({
    _id: sessionId,
    userId: req.user?.userId,
  });
  appAssert(deletedSession, NOT_FOUND, "No session found to remove");

  if (sessionId === String(req.user?.sessionId)) {
    clearAuthCookies(res);
  }

  res.status(OK).json({ message: "Session removed" });
}
