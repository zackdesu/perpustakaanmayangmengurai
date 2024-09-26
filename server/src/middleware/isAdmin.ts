import { Response, NextFunction } from "express";
import { IRequest } from "../@types/express";
import { throwError } from "../utils/throwError";

const isAdmin = (req: IRequest, res: Response, next: NextFunction) => {
  if (!req.payload) return throwError(500, "req.payload undefined!");
  const { role } = req.payload;

  if (role !== "ADMIN")
    return throwError(403, "Penghapusan buku harus di lakukan oleh admin!");

  next();
};

export default isAdmin;
