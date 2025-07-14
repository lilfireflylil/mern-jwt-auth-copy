import { Request, Response } from "express";
import { setAuthCookies } from "../utils/cookies.js";
import { CREATED, OK, UNAUTHORIZED } from "../constants/http.js";
import { createAccount, loginUser } from "../services/auth.service.js";
import { loginSchema, registerSchema } from "./auth.schema.js";

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
export function handleLogout(req: Request, res: Response) {
  const cookies = req.cookies;
  console.log(cookies);

  res.json({});
}
// Refresh Controller
