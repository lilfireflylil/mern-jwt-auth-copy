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
  resetPassword,
  sendPasswordResetEmail,
  verifyEmail,
} from "../services/auth.service.js";
import {
  emailSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verificationCodeSchema,
} from "./auth.schema.js";
import { verifyToken } from "../utils/jwt.js";
import { SessionModel } from "../models/session.model.js";
import { appAssert } from "../utils/appAssert.js";

// Register Controller
export async function registerHandler(req: Request, res: Response) {
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
export async function loginHandler(req: Request, res: Response) {
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
export async function logoutHandler(req: Request, res: Response) {
  const accessToken = req.cookies.accessToken as string | undefined;
  const payload = verifyToken(accessToken || "", "accessToken");

  if (payload) {
    await SessionModel.findByIdAndDelete(payload.sessionId);
  }

  clearAuthCookies(res).status(OK).json({ message: "Logout successfully" });
}

// Refresh Controller
export async function refreshHandler(req: Request, res: Response) {
  const refreshToken = req.cookies.refreshToken as string | undefined;
  appAssert(refreshToken, UNAUTHORIZED, "Missing refresh token");

  const { accessToken, newRefreshToken } =
    await refreshUserAccessToken(refreshToken);

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

export async function verifyEmailHandler(req: Request, res: Response) {
  const verificationCode = verificationCodeSchema.parse(req.params.code);
  await verifyEmail(verificationCode);

  res.status(OK).json({ message: "Email was successfully verified" });
}

export async function sendPasswordResetHandler(req: Request, res: Response) {
  const email = emailSchema.parse(req.body.email);

  await sendPasswordResetEmail(email);

  res.status(OK).json({ message: "Password reset email sent" });
}

export async function resetPasswordHandler(req: Request, res: Response) {
  const request = resetPasswordSchema.parse(req.body);

  await resetPassword(request);

  clearAuthCookies(res)
    .status(OK)
    .json({ message: "Password was reset successfully" });
}
