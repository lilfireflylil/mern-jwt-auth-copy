import { Response, CookieOptions } from "express";
import { NODE_ENV } from "../constants/env.js";
import { fifteenMinutesFromNow, thirtyDaysFromNow } from "./date.js";

const defaults: CookieOptions = {
  sameSite: "strict",
  httpOnly: true,
  secure: NODE_ENV !== "development",
};

export const REFRESH_PATH = "/auth/refresh";

export function getAccessTokenOptions(): CookieOptions {
  return {
    ...defaults,
    expires: fifteenMinutesFromNow(),
  };
}

export function getRefreshTokenOptions(): CookieOptions {
  return {
    ...defaults,
    expires: thirtyDaysFromNow(),
    path: REFRESH_PATH,
  };
}

type SetAuthCookiesParams = {
  res: Response;
  accessToken: string;
  refreshToken: string;
};

export function setAuthCookies({
  res,
  accessToken,
  refreshToken,
}: SetAuthCookiesParams) {
  return res
    .cookie("accessToken", accessToken, getAccessTokenOptions())
    .cookie("refreshToken", refreshToken, getRefreshTokenOptions());
}

export function clearAuthCookies(res: Response) {
  return res
    .clearCookie("accessToken")
    .clearCookie("refreshToken", { path: REFRESH_PATH });
}
