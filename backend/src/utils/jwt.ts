import jwt, { SignOptions } from "jsonwebtoken";
import { JWT_REFRESH_SECRET, JWT_SECRET } from "../constants/env.js";
import { UserDocument } from "../models/user.model.js";
import { SessionDocument } from "../models/session.model.js";
import { appAssert } from "./appAssert.js";

type AccessTokenPayload = {
  userId: UserDocument["_id"];
  sessionId: SessionDocument["_id"];
};

type RefreshTokenPayload = {
  sessionId: SessionDocument["_id"];
};

type SignOptionsAndSecret = SignOptions & {
  secret: string;
};

const defaults: SignOptions = {
  audience: ["user"],
};

const accessTokenSignOptions: SignOptionsAndSecret = {
  expiresIn: "30m",
  secret: JWT_SECRET,
};
export const refreshTokenSignOptions: SignOptionsAndSecret = {
  expiresIn: "30d",
  secret: JWT_REFRESH_SECRET,
};

export function signToken(
  payload: AccessTokenPayload | RefreshTokenPayload,
  options?: SignOptionsAndSecret
) {
  const { secret, ...signOpts } = options || accessTokenSignOptions;

  const token = jwt.sign(payload, secret, { ...defaults, ...signOpts });
  return token;
}
