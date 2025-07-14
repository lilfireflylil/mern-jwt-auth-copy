import { AppErrorCode } from "../constants/appErrorCode.js";
import { HttpStatusCode } from "../constants/http.js";
import assert from "node:assert";
import { AppError } from "./AppError.js";

type AppAssert = (
  condition: any,
  httpStatusCode: HttpStatusCode,
  message: string,
  appErrorCode?: AppErrorCode
) => asserts condition;

//  Asserts a condition and throws an AppError if the condition is falsy.
export const appAssert: AppAssert = (
  condition,
  httpStatusCode,
  message,
  appErrorCode
) => assert(condition, new AppError(httpStatusCode, message, appErrorCode));
