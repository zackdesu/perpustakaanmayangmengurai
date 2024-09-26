import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
const errorHandler = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  const statusCode = err instanceof ZodError ? 400 : err.statusCode || 500;

  const message =
    statusCode === 500
      ? process.env.NODE_ENV === "development"
        ? (err.errors &&
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            err.errors.map((err: any) => err.message).join(", ")) ||
          err.message
        : "Internal Server Error!"
      : // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (err.errors && err.errors.map((err: any) => err.message).join(", ")) ||
        err.message;
  console.log(message);

  return res.status(statusCode).json({
    error: message,
  });
};

export default errorHandler;
