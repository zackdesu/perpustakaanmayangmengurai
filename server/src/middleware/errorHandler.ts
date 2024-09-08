import { Request, Response, NextFunction } from "express";
const errorHandler = (
  err: { statusCode: number; message?: string },
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;

  const message =
    process.env.NODE_ENV === "development"
      ? err.message
      : "Internal Server Error!";

  res.status(statusCode).json({
    error: message,
  });
};

export default errorHandler;
