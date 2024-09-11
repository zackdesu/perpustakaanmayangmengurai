import { Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "./db";

const accessTokenExpires = 1000 * 60 * 5; // 5 m
const refreshTokenExpires = 1000 * 60 * 60 * 24 * 30; // 30 days

export const generateAccessToken = (res: Response, payload: Payload) => {
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
    maxAge: refreshTokenExpires,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV !== "development",
    path: "/",
  });

  const findToken = await prisma.token.findFirst({ where: { userId: id } });
  if (findToken) await prisma.token.delete({ where: { userId: id } });

  await prisma.token.create({
    data: { refreshToken, user: { connect: { id } } },
  });
};
