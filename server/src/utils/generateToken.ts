import { Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "./db";

const accessTokenExpires = "5m";
const refreshTokenExpires = "30d";

export const generateAccessToken = (payload: Payload) => {
  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
  if (!accessTokenSecret)
    throw { statusCode: 500, message: "Access Token Secret not found!" };

  const accessToken = jwt.sign(payload, accessTokenSecret, {
    expiresIn: accessTokenExpires,
  });

  return accessToken;
};

export const generateRefreshToken = async (res: Response, id: string) => {
  const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
  if (!refreshTokenSecret)
    throw { statusCode: 500, message: "Refresh Token Secret not found!" };
  const refreshToken = jwt.sign({ id }, refreshTokenSecret, {
    expiresIn: refreshTokenExpires,
  });

  res.cookie("refreshToken", refreshToken, {
    maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV !== "development",
    path: "/auth/refresh",
  });

  const findToken = await prisma.token.findFirst({ where: { userId: id } });
  if (findToken) await prisma.token.delete({ where: { userId: id } });

  await prisma.token.create({
    data: { refreshToken, user: { connect: { id } } },
  });
};
