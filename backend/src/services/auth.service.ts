import { CONFLICT, UNAUTHORIZED } from "../constants/http.js";
import { VerificationCodeType } from "../constants/verificationCodeType.js";
import { SessionModel } from "../models/session.model.js";
import { UserModel } from "../models/user.model.js";
import { VerificationCodeModel } from "../models/verificationCode.model.js";
import { appAssert } from "../utils/appAssert.js";
import {
  ONE_DAY_MS,
  oneYearFromNow,
  thirtyDaysFromNow,
} from "../utils/date.js";
import { signToken, verifyToken } from "../utils/jwt.js";

type CreateAccountParams = {
  email: string;
  password: string;
  userAgent?: string;
};

export async function createAccount(data: CreateAccountParams) {
  const userExists = await UserModel.exists({ email: data.email });
  appAssert(!userExists, CONFLICT, "Email already in use");

  const user = await UserModel.create({
    email: data.email,
    password: data.password,
  });
  const userId = user._id;

  const verificationCode = VerificationCodeModel.create({
    userId,
    type: VerificationCodeType.EmailVerification,
    expiresAt: oneYearFromNow(),
  });

  const session = await SessionModel.create({
    userId,
    userAgent: data.userAgent,
  });
  const sessionId = session._id;

  const accessToken = signToken({ userId, sessionId }, "access");
  const refreshToken = signToken({ sessionId }, "refresh");

  return { user, accessToken, refreshToken };
}

// LoginUser
type LoginParams = {
  email: string;
  password: string;
  userAgent?: string;
};

export async function loginUser(request: LoginParams) {
  const { email, password, userAgent } = request;

  const user = await UserModel.findOne({ email });
  appAssert(user, UNAUTHORIZED, "Invalid email or password");
  const userId = user._id;

  const isValid = await user.comparePassword(password);
  appAssert(isValid, UNAUTHORIZED, "Invalid email or password");

  const session = await SessionModel.create({ userId, userAgent });
  const sessionId = session._id;

  const accessToken = signToken({ userId, sessionId }, "access");
  const refreshToken = signToken({ sessionId }, "refresh");

  return { user, accessToken, refreshToken };
}

export async function refreshUserAccessToken(refreshToken: string) {
  const payload = verifyToken(refreshToken, "refresh");
  appAssert(payload, UNAUTHORIZED, "Invalid refresh token");

  const session = await SessionModel.findById(payload.sessionId);
  appAssert(session, UNAUTHORIZED, "Session expired");

  const now = Date.now();
  const sessionNeedsRefresh = session.expiresAt.getTime() - now <= ONE_DAY_MS;

  if (sessionNeedsRefresh) {
    session.expiresAt = thirtyDaysFromNow();
    await session.save();
  }

  const newRefreshToken = sessionNeedsRefresh
    ? signToken({ sessionId: session._id }, "refresh")
    : undefined;
  const accessToken = signToken(
    { sessionId: session._id, userId: session.userId },
    "access"
  );

  return { accessToken, newRefreshToken };
}
