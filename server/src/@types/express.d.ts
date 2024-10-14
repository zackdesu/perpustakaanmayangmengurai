import { Request } from "express";

interface IRequest<T = Acc> extends Request {
  body: T;
  cookies: {
    accessToken: string;
    refreshToken: string;
  };
  payload?: Payload;
}
