import { Response, NextFunction } from "express";
import { compareSync, hash } from "bcryptjs";
import prisma from "../utils/db";
import jwt from "jsonwebtoken";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken";
import { throwError } from "../utils/throwError";
import sendEmail from "../utils/sendEmail";
import generateOTP from "../utils/generateOTP";
import { IRequest } from "../@types/express";
import generateUserId from "../utils/userIdGenerator";
import userSchema from "../schema/userSchema";
import { z } from "zod";
import updateUserSchema from "../schema/updateUserSchema";

export const create = async (
  req: IRequest<ReqAcc>,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = userSchema.safeParse(req.body);

    console.log(result.error);

    if (!result.success) throwError(400, "Gagal memvalidasi data akun!");

    const {
      username,
      password,
      absentnum,
      angkatan,
      jurusan,
      name,
      email,
      otp,
      kelas,
    } = result.data as z.infer<typeof userSchema>;

    if (email) {
      if (!otp)
        return throwError(403, "Masukkan kode OTP yang valid dari email!");
      const findOTP = await prisma.oTP.findFirst({ where: { email } });
      if (!findOTP)
        return throwError(403, "Kamu belum mengirim OTP ke emailmu!");
      if (otp != findOTP.otp) return throwError(403, "Kode OTP salah!");
      await prisma.oTP.delete({ where: { id: findOTP.id } });
    }

    const hashedPassword = await hash(password, 10);
    const usernameExists = await prisma.acc.findFirst({ where: { username } });

    if (usernameExists)
      return throwError(
        403,
        "Username sudah digunakan, ganti username anda dengan yang lain."
      );

    const id = generateUserId(jurusan as Jurusan, kelas, absentnum);

    if (id.length !== 9) return throwError(500, "Panjang ID bukan 9!");
    const idExists = await prisma.acc.findFirst({ where: { username } });
    if (idExists)
      return throwError(403, "Silahkan periksa kembali nomor absenmu.");

    const createAcc = await prisma.acc.create({
      data: {
        id,
        username,
        name,
        password: hashedPassword,
        email: email ? email.trim() : null,
      },
    });

    await prisma.user.create({
      data: {
        accId: createAcc.id,
        angkatan,
        kelas,
        jurusan,
        absentnum,
      },
    });

    return res.status(201).json({
      message: "Akun berhasil dibuat!",
      user: {
        id: createAcc.id,
        username: createAcc.username,
        email: createAcc.email,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const read = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.payload) return throwError(500, "req.payload undefined!");
    return res.status(200).json({ user: req.payload });
  } catch (error) {
    next(error);
  }
};

export const update = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.payload) return throwError(500, "req.payload undefined!");

    const result = updateUserSchema.safeParse(req.body);

    if (!result.success) throwError(400, "Gagal memvalidasi data akun!");

    const { username, name, email, oldPassword, newPassword } =
      result.data as z.infer<typeof updateUserSchema>;

    const { id } = req.payload;

    const user = await prisma.acc.findFirst({ where: { id } });
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
      role: user.role,
    };

    await prisma.acc.update({
      where: { id },
      data: { username, name, email, password },
    });

    const accessToken = generateAccessToken(res, payload);
    generateRefreshToken(res, user.id);

    return res
      .status(200)
      .json({ message: "Berhasil mengupdate data!", accessToken });
  } catch (error) {
    next(error);
  }
};

export const OTP = async (req: IRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.oTP.deleteMany({
      where: { expiresAt: { lte: new Date(Date.now()) } },
    });

    const emailSchema = z.string().trim().email("Email tidak valid!");
    const result = emailSchema.safeParse(req.body);

    if (!result.success) throwError(400, "Gagal memvalidasi data akun!");

    const otp = generateOTP();
    const email = result.data as z.infer<typeof emailSchema>;

    const userOTP = await prisma.oTP.findFirst({
      where: { email },
    });

    if (userOTP)
      return throwError(403, "Kamu sudah mengirimkan OTP sebelumnya!");

    await sendEmail(email, otp, "Verifikasi emailmu sekarang!");
    await prisma.oTP.create({
      data: {
        email,
        expiresAt: new Date(Date.now() + 1000 * 60 * 5),
        otp,
      },
    });

    return res.status(200).json({ message: "OTP code sent successfully!" });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) return throwError(403, "User have logged in.");

    const { username, password } = req.body;
    if (!username || !password)
      return throwError(403, "Username atau password belum di isi!");

    const user = await prisma.acc.findFirst({ where: { username } });

    if (!user) return throwError(404, "Pengguna tidak ditemukan!");

    const comparePassword = compareSync(password, user.password);

    if (!comparePassword) return throwError(403, "Password salah!");

    const payload = {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(res, payload);
    await generateRefreshToken(res, user.id);

    return res.status(200).json({
      message: `Selamat datang, ${user.name}!`,
      user: payload,
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken } = req.cookies;
    const findToken = await prisma.token.findFirst({
      where: { refreshToken },
    });

    if (!findToken) return throwError(403, "Refresh Token Invalid!");

    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

    if (!refreshTokenSecret)
      return throwError(500, "Refresh Token Secret not found!");

    const { id } = jwt.verify(refreshToken, refreshTokenSecret) as {
      id: string;
    };

    const user = await prisma.acc.findFirst({ where: { id } });

    if (!user) return throwError(500, "User not found in find user!");

    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

    if (!accessTokenSecret)
      return throwError(500, "Access Token Secret not found!");

    const payload = {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(res, payload);

    return res.status(200).json({ accessToken });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken } = req.cookies;
    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");
    const findToken = await prisma.token.findFirst({ where: { refreshToken } });
    if (findToken) await prisma.token.delete({ where: findToken });
    return res.status(200).json({ message: "Berhasil logout!" });
  } catch (error) {
    next(error);
  }
};
