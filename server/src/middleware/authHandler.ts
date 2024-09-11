import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { throwError } from "../utils/throwError";
import { IRequest } from "../@types/express";

export const authenticate = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const secret = process.env.ACCESS_TOKEN_SECRET;

    if (!token) return throwError(404, "Access Token not found!");
    if (!secret) return throwError(500, "Access Token Secret not found!");

    const user = jwt.verify(token, secret) as Payload;
    req.payload = user;

    next();
  } catch (error) {
    next(error);
  }
};
