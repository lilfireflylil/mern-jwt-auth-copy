import { Response, CookieOptions } from "express";
import { NODE_ENV } from "../constants/env.js";
import { fifteenMinutesFromNow, thirtyDaysFromNow } from "./date.js";

const defaults: CookieOptions = {
  sameSite: "strict",
  httpOnly: true,
  secure: NODE_ENV !== "development",
};

function getAccessTokenOptions(): CookieOptions {
  return {
    ...defaults,
    expires: fifteenMinutesFromNow(),
  };
}

function getRefreshTokenOptions(): CookieOptions {
  return {
    ...defaults,
    expires: thirtyDaysFromNow(),
    path: "/auth/refresh",
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
