import { Response, NextFunction } from "express";
import { IRequest } from "../@types/express";
import HttpError from "../utils/HttpError";

const isAdmin = (req: IRequest, _res: Response, next: NextFunction) => {
  if (!req.payload) throw new HttpError(500, "req.payload undefined!");
  const { role } = req.payload;
  if (role !== "ADMIN")
    throw new HttpError(403, "Hanya Admin yang dapat mengakses!");

  next();
};

export default isAdmin;
