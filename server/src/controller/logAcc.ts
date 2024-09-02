import { compareSync } from "bcryptjs";
import { NextFunction } from "express";
import prisma from "../utils/db";
import jwt from "jsonwebtoken";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken";
import { Request, Response } from "../@types/reqnres";
import { throwError } from "../utils/throwError";

const login = async (req: Request, res: Response, next: NextFunction) => {
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

const refresh = async (req: Request, res: Response, next: NextFunction) => {
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

    return res.json({ accessToken });
  } catch (error) {
    next(error);
  }
};

const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.cookies;
    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");
    const findToken = await prisma.token.findFirst({ where: { refreshToken } });
    if (findToken) await prisma.token.delete({ where: findToken });
    return res.json({ message: "Berhasil logout!" });
  } catch (error) {
    next(error);
  }
};

export { login, refresh, logout };
