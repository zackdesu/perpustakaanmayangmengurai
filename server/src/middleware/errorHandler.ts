import { NextFunction } from "express";
import { Request, Response } from "../@types/reqnres";
const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction // eslint-disable-line no-unused-vars
) => {
  const statusCode = err.statusCode || 500;

  const message = err.message || "Terjadi kesalahan di server";

  res.status(statusCode).json({
    error: message,
  });
};

export default errorHandler;
