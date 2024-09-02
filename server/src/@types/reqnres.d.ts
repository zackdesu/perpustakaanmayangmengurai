import express from "express";

interface Request extends express.Request {
  body: User & { newPassword?: string; oldPassword?: string; otp?: number };
  cookies: {
    accessToken: string;
    refreshToken: string;
  };
}

// @ts-expect-error
interface Response extends express.Response {}
