import { Request, Response, NextFunction } from "express";
import { compareSync, hash } from "bcryptjs";
import { isEmpty, isEmail } from "validator";
import prisma from "../utils/db";
import jwt from "jsonwebtoken";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken";
import { throwError } from "../utils/throwError";
import sendEmail from "../utils/sendEmail";
import generateOTP from "../utils/generateOTP";

interface IRequest extends Request {
  body: User;
  cookies: {
    accessToken: string;
    refreshToken: string;
  };
}

export const create = async (
  req: IRequest,
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

export const read = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token =
      req.headers.authorization && req.headers.authorization.split(" ")[1];

    const secret = process.env.ACCESS_TOKEN_SECRET;

    if (!token) return throwError(404, "Access Token in cookie not found!");

    if (!secret) return throwError(500, "Access Token Secret not found!");

    const user = jwt.verify(token, secret);

    return res.status(200).json(user);
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
    const token =
      req.headers.authorization && req.headers.authorization.split(" ")[1];
    if (!token) return throwError(404, "Access Token in cookie not found!");

    const secret = process.env.ACCESS_TOKEN_SECRET;
    if (!secret) return throwError(500, "Access Token Secret not found!");

    const { name, email, oldPassword, newPassword } = req.body;

    if (!name) return throwError(403, "Nama tidak boleh kosong!");
    if (email && !isEmail(email)) return throwError(403, "Email tidak valid!");

    const { id } = jwt.verify(token, secret) as { id: string };

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

    const user = await prisma.user.findFirst({ where: { username } });

    if (!user) return throwError(404, "Pengguna tidak ditemukan!");

    const comparePassword = compareSync(password, user.password);

    if (!comparePassword) return throwError(403, "Password salah!");

    const payload = {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
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

    const user = await prisma.user.findFirst({ where: { id } });

    if (!user) return throwError(500, "User not found in find user!");

    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

    if (!accessTokenSecret)
      return throwError(500, "Access Token Secret not found!");

    const payload = {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
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
