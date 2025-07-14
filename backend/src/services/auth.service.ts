import { CONFLICT, UNAUTHORIZED } from "../constants/http.js";
import { VerificationCodeType } from "../constants/verificationCodeType.js";
import { SessionModel } from "../models/session.model.js";
import { UserDocument, UserModel } from "../models/user.model.js";
import { VerificationCodeModel } from "../models/verificationCode.model.js";
import { appAssert } from "../utils/appAssert.js";
import { oneYearFromNow } from "../utils/date.js";
import { refreshTokenSignOptions, signToken } from "../utils/jwt.js";

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

  const accessToken = signToken({ userId, sessionId });
  const refreshToken = signToken({ sessionId }, refreshTokenSignOptions);

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

  const accessToken = signToken({ userId, sessionId });
  const refreshToken = signToken({ sessionId }, refreshTokenSignOptions);

  return { user, accessToken, refreshToken };
}

// video till 01:22:06
