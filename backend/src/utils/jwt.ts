import jwt, { SignOptions } from "jsonwebtoken";
import { JWT_REFRESH_SECRET, JWT_SECRET } from "../constants/env.js";
import { Types } from "mongoose";

type AccessTokenPayload = {
  userId: Types.ObjectId;
  sessionId: Types.ObjectId;
};

type RefreshTokenPayload = {
  sessionId: Types.ObjectId;
};

type TokenPayloadMap = {
  access: AccessTokenPayload;
  refresh: RefreshTokenPayload;
};

type TokenType = "access" | "refresh";

type TokenConfigEntry = {
  expiresIn: string;
  secret: string;
  audience: string[];
};

const tokenConfig: Record<TokenType, TokenConfigEntry> = {
  access: {
    expiresIn: "30m",
    secret: JWT_SECRET,
    audience: ["users"],
  },
  refresh: {
    expiresIn: "30d",
    secret: JWT_REFRESH_SECRET,
    audience: ["users"],
  },
};

export function signToken<T extends TokenType>(
  payload: TokenPayloadMap[T],
  type: T,
  options?: SignOptions
) {
  const { secret, expiresIn, audience } = tokenConfig[type];
  return jwt.sign(payload, secret, {
    expiresIn,
    audience,
    ...options,
  } as SignOptions);
}

export function verifyToken<T extends TokenType>(token: string, type: T) {
  const { secret, audience } = tokenConfig[type];
  try {
    return jwt.verify(token, secret, { audience }) as TokenPayloadMap[T];
  } catch (error) {
    return undefined;
  }
}
