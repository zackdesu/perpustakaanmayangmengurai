import { User } from "@prisma/client";
import { NextFunction, Response } from "express";
import prisma from "../utils/db";
import { throwError } from "../utils/throwError";
import { IRequest } from "../@types/express";

export const readUser = async (
  req: IRequest<User>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.payload) return throwError(500, "req.payload undefined!");
    const { role } = req.payload;

    if (role !== "ADMIN")
      return throwError(403, "Peminjaman harus di lakukan oleh admin!");

    const { id } = req.payload;

    const user = await prisma.user.findFirst({ where: { accId: id } });

    if (!user) return throwError(500, "Registered acc not found user!");

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: IRequest<User>,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = req.body;

    if (!req.payload) return throwError(500, "req.payload undefined!");
    const { role } = req.payload;

    if (role !== "ADMIN")
      return throwError(403, "Peminjaman harus di lakukan oleh admin!");

    const { id } = req.payload;

    await prisma.user.update({ where: { id }, data });

    return res.status(200).json({
      message: "Berhasil mengupdate user",
    });
  } catch (error) {
    next(error);
  }
};
