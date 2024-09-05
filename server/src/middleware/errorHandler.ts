import { NextFunction } from "express";
import { Request, Response } from "../@types/reqnres";
const errorHandler = (
  err: {statusCode: number, message: string},
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;

  const message = err.message || "Terjadi kesalahan di server";

  res.status(statusCode).json({
    error: message,
  });
};

export default errorHandler;
