import express from "express";

interface Request extends express.Request {
  body: User & { newPassword?: string; oldPassword?: string; otp?: number };
  cookies: {
    accessToken: string;
    refreshToken: string;
  };
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface Response extends express.Response {}
