import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import logger from "../utils/logger";
import HttpError from "../utils/HttpError";
const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = 500;
  let message = "Internal Server Error";

  if (err instanceof ZodError) {
    statusCode = 400;
    message = err.message;
  } else if (err instanceof HttpError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  logger.error(message);

  return res.status(statusCode).json({
    error: message,
  });
};

export default errorHandler;
