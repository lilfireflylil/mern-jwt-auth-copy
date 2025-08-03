import { APP_ORIGIN } from "../constants/env.js";
import {
  CONFLICT,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  UNAUTHORIZED,
} from "../constants/http.js";
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
import { getVerifyEmailTemplate } from "../utils/emailTemplate.js";
import { signToken, verifyToken } from "../utils/jwt.js";
import sendMail from "../utils/sendMail.js";

type CreateAccountParams = {
  email: string;
  password: string;
  userAgent?: string;
};

export async function createAccount(data: CreateAccountParams) {
  await SessionModel.deleteMany();
  await UserModel.deleteMany();
  await VerificationCodeModel.deleteMany();

  const userExists = await UserModel.exists({ email: data.email });
  appAssert(!userExists, CONFLICT, "Email already in use");

  const user = await UserModel.create({
    email: data.email,
    password: data.password,
  });
  const userId = user._id;

  const verificationCode = await VerificationCodeModel.create({
    userId,
    type: VerificationCodeType.EmailVerification,
    expiresAt: oneYearFromNow(),
  });

  const url = `${APP_ORIGIN}/auth/email/verify/${verificationCode._id}`;
  const { error } = await sendMail({
    to: user.email,
    ...getVerifyEmailTemplate(url),
  });
  if (error) console.error({ error });

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

export async function verifyEmail(code: string) {
  const verificationCode = await VerificationCodeModel.findOne({
    _id: code,
    type: VerificationCodeType.EmailVerification,
  });
  appAssert(
    verificationCode,
    NOT_FOUND,
    "Invalid or expired verification code"
  );

  const updatedUser = await UserModel.findByIdAndUpdate(
    verificationCode.userId,
    { verified: true },
    { new: true }
  );
  appAssert(updatedUser, INTERNAL_SERVER_ERROR, "Failed to verify email");

  await verificationCode.deleteOne();

  return { user: updatedUser };
}
