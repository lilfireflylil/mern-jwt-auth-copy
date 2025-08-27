import { Request, Response, NextFunction } from "express";
import { UNAUTHORIZED } from "../constants/http.js";
import { AppErrorCode } from "../constants/appErrorCode.js";
import { appAssert } from "../utils/appAssert.js";
import { verifyToken } from "../utils/jwt.js";

function authenticate(req: Request, res: Response, next: NextFunction) {
  const accessToken = req.cookies.accessToken as string | undefined;
  appAssert(
    accessToken,
    UNAUTHORIZED,
    "Not authorized",
    AppErrorCode.InvalidAccessToken
  );

  const decoded = verifyToken(accessToken, "accessToken");
  appAssert(decoded, UNAUTHORIZED, "Invalid or expired Access Token");

  req.user = decoded;
  next();
}

export default authenticate;
