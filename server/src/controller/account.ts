import { NextFunction } from "express";
import { compareSync, hash } from "bcryptjs";
import { isEmpty, isEmail } from "validator";
import prisma from "../utils/db";
import jwt from "jsonwebtoken";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken";
import { Request, Response } from "../@types/reqnres";
import { throwError } from "../utils/throwError";
import sendEmail from "../utils/sendEmail";
import generateOTP from "../utils/generateOTP";

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, name, email, password, otp } = req.body;

    if (!username || isEmpty(username))
      return throwError(404, "Username harus di isi!");
    if (!name || isEmpty(name)) return throwError(404, "Nama harus di isi!");
    if (!password || isEmpty(password) || password.length < 6)
      return throwError(
        404,
        "Password harus di isi dan tidak boleh kurang dari 6 karakter!"
      );

    if (email && !isEmail(email)) return throwError(403, "Email tidak valid!");
    if (username.length <= 3)
      return throwError(403, "username harus lebih dari 3 karakter!");

    const hashedPassword = await hash(password, 10);
    const usernameExists = await prisma.user.findFirst({ where: { username } });

    if (usernameExists)
      return throwError(
        403,

        "Username sudah digunakan, ganti username anda dengan yang lain."
      );

    if (email) {
      if (!otp) return throwError(403, "Masukkan kode OTP dari email!");
      const findOTP = await prisma.oTP.findFirst({ where: { email } });
      if (!findOTP)
        return throwError(403, "Kamu belum mengirim OTP ke emailmu!");
      if (otp != findOTP.otp) return throwError(403, "Kode OTP salah!");
      await prisma.oTP.delete({ where: { id: findOTP.id } });
    }

    const createAcc = await prisma.user.create({
      data: {
        username,
        name,
        password: hashedPassword,
        email: email ? email.trim() : null,
      },
    });

    return res.status(201).json({
      message: "Akun berhasil dibuat!",
      user: {
        id: createAcc.id,
        username: createAcc.username,
        name: createAcc.name,
        email: createAcc.email,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const read = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { accessToken } = req.cookies;
    const secret = process.env.ACCESS_TOKEN_SECRET;

    if (!accessToken)
      return throwError(404, "Access Token in cookie not found!");

    if (!secret) return throwError(500, "Access Token Secret not found!");

    const user = jwt.verify(accessToken, secret);

    return res.json(user);
  } catch (error) {
    next(error);
  }
};

export const update = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken)
      return throwError(404, "Refresh Token in cookie not found!");

    const secret = process.env.REFRESH_TOKEN_SECRET;
    if (!secret) return throwError(500, "Refresh Token Secret not found!");

    const { name, email, oldPassword, newPassword } = req.body;

    if (!name) return throwError(403, "Nama tidak boleh kosong!");
    if (email && !isEmail(email)) return throwError(403, "Email tidak valid!");

    const { id } = jwt.verify(refreshToken, secret) as { id: string };

    const user = await prisma.user.findFirst({ where: { id } });
    if (!user) return throwError(500, "User not found! Server error!");

    let password;

    if (oldPassword && newPassword) {
      const checkPassword = compareSync(oldPassword, user.password);
      if (!checkPassword) return throwError(403, "Old password is wrong!");
      password = await hash(newPassword, 10);
    }

    const payload = {
      id: user.id,
      username: user.username,
      name,
      email,
    };

    await prisma.user.update({
      where: { id },
      data: { name: name, email, password },
    });

    const accessToken = generateAccessToken(res, payload);
    generateRefreshToken(res, user.id);

    return res.json({ message: "Berhasil mengupdate data!", accessToken });
  } catch (error) {
    next(error);
  }
};

export const OTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.oTP.deleteMany({
      where: { expiresAt: { lte: new Date(Date.now()) } },
    });

    const otp = generateOTP();
    const { email } = req.body;
    if (!email || !isEmail(email)) return throwError(403, "Email tidak valid!");
    const trimmedEmail = email.trim();

    const userOTP = await prisma.oTP.findFirst({
      where: { email: trimmedEmail },
    });

    if (userOTP)
      return throwError(403, "Kamu sudah mengirimkan OTP sebelumnya!");

    await sendEmail(trimmedEmail, otp).catch(console.error);
    await prisma.oTP.create({
      data: {
        email: trimmedEmail,
        expiresAt: new Date(Date.now() + 1000 * 60 * 5),
        otp,
      },
    });

    return res.json({ message: "OTP code sent successfully!" });
  } catch (error) {
    next(error);
  }
};
