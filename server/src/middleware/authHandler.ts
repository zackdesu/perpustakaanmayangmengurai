import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import HttpError from "../utils/HttpError";
import { IRequest } from "../@types/express";

export const authenticate = async (
  req: IRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const secret = process.env.ACCESS_TOKEN_SECRET;

    if (!token) throw new HttpError(401, "Unauthorized Access!");
    if (!secret) throw new HttpError(500, "Access Token Secret not found!");

    const user = jwt.verify(token, secret) as Payload;
    req.payload = user;

    next();
  } catch (error) {
    next(error);
  }
};
