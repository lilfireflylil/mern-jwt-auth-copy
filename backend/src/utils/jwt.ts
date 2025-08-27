import jwt, { SignOptions, VerifyOptions } from "jsonwebtoken";
import { JWT_REFRESH_SECRET, JWT_SECRET } from "../constants/env.js";
import mongoose from "mongoose";

export type AccessTokenPayload = {
  userId: mongoose.Types.ObjectId;
  sessionId: mongoose.Types.ObjectId;
};

type RefreshTokenPayload = {
  sessionId: mongoose.Types.ObjectId;
};

const signDefaults: SignOptions = {
  audience: ["user"],
};

const verifyDefaults: VerifyOptions = {
  audience: ["user"],
};

type TokenPayloadMap = {
  accessToken: AccessTokenPayload;
  refreshToken: RefreshTokenPayload;
};

export function signToken<T extends keyof TokenPayloadMap>(
  payload: TokenPayloadMap[T],
  type: T,
  options?: SignOptions
) {
  const secret = type === "accessToken" ? JWT_SECRET : JWT_REFRESH_SECRET;
  const token = jwt.sign(payload, secret, {
    expiresIn: type === "accessToken" ? "30m" : "30d",
    ...signDefaults,
    ...options,
  });

  return token;
}

export function verifyToken<T extends keyof TokenPayloadMap>(
  token: string,
  type: T,
  options?: VerifyOptions
) {
  const secret = type === "accessToken" ? JWT_SECRET : JWT_REFRESH_SECRET;
  try {
    const decoded = jwt.verify(token, secret, {
      ...verifyDefaults,
      ...options,
    }) as TokenPayloadMap[T];

    return decoded;
  } catch (error) {
    return undefined;
  }
}
