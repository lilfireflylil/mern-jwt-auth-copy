import { ErrorRequestHandler, Response } from "express";
import { ZodError } from "zod";
import { INTERNAL_SERVER_ERROR } from "../constants/http.js";
import { AppError } from "../utils/AppError.js";
import { clearAuthCookies, REFRESH_PATH } from "../utils/cookies.js";

function zodErrorHandler(error: ZodError, res: Response) {
  const errorsList = error.errors.map((errObject) => {
    const path = errObject.path.join(",");
    const message = errObject.message;
    return path ? `${path}: ${message}` : message;
  });
  res.status(INTERNAL_SERVER_ERROR).json({ errors: errorsList });
}

function handleAppError(error: AppError, res: Response) {
  res.status(error.statusCode).json({
    message: error.message,
    errorCode: error.errorCode,
  });
}

export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  if (req.path === REFRESH_PATH) {
    clearAuthCookies(res);
  }

  if (error instanceof ZodError) {
    return zodErrorHandler(error, res);
  }

  if (error instanceof AppError) {
    return handleAppError(error, res);
  }

  console.log(`Path: ${req.path}`);
  console.log(error);
  res
    .status(INTERNAL_SERVER_ERROR)
    .json("Internal Error, end of errorHandler function");
};
