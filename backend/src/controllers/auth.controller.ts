import { Request, Response } from "express";
import {
  clearAuthCookies,
  getAccessTokenOptions,
  getRefreshTokenOptions,
  setAuthCookies,
} from "../utils/cookies.js";
import { CREATED, OK, UNAUTHORIZED } from "../constants/http.js";
import {
  createAccount,
  loginUser,
  refreshUserAccessToken,
} from "../services/auth.service.js";
import { loginSchema, registerSchema } from "./auth.schema.js";
import { verifyToken } from "../utils/jwt.js";
import { SessionModel } from "../models/session.model.js";
import { appAssert } from "../utils/appAssert.js";

// Register Controller
export async function handleRegister(req: Request, res: Response) {
  const request = registerSchema.parse({
    ...req.body,
    userAgent: req.headers["user-agent"],
  });

  const { user, accessToken, refreshToken } = await createAccount(request);

  setAuthCookies({ res, accessToken, refreshToken })
    .status(CREATED)
    .json({ user });
}

// Login Controller
export async function handleLogin(req: Request, res: Response) {
  const request = loginSchema.parse({
    ...req.body,
    userAgent: req.headers["user-agent"],
  });

  const { user, accessToken, refreshToken } = await loginUser(request);

  setAuthCookies({ res, accessToken, refreshToken })
    .status(OK)
    .json({ message: "Login successful" });
}

// Logout Controller
export async function handleLogout(req: Request, res: Response) {
  const accessToken = req.cookies.accessToken as string | undefined;
  const payload = verifyToken(accessToken || "", "access");

  if (payload) {
    await SessionModel.findByIdAndDelete(payload.sessionId);
  }

  clearAuthCookies(res).status(OK).json({ message: "Logout successfully" });
}

// Refresh Controller
export async function handleRefresh(req: Request, res: Response) {
  const refreshToken = req.cookies.refreshToken as string | undefined;
  appAssert(refreshToken, UNAUTHORIZED, "Missing refresh token");

  const { accessToken, newRefreshToken } = await refreshUserAccessToken(
    refreshToken
  );

  if (newRefreshToken) {
    res.cookie("refreshToken", newRefreshToken, getRefreshTokenOptions());
  }

  res
    .cookie("accessToken", accessToken, getAccessTokenOptions())
    .status(OK)
    .json({
      message: "Access token refreshed",
    });
}
