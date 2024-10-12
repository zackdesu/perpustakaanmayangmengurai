import express, { Application, NextFunction, Request, Response } from "express";
import { acc } from "./route/account";
import { book } from "./route/book";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import errorHandler from "./middleware/errorHandler";
import limiter from "./utils/limiter";
import HttpError from "./utils/HttpError";

class App {
  public app: Application;
  private origin: string;

  constructor() {
    this.app = express();
    this.origin = process.env.ORIGIN || "";
    if (!this.origin) throw new Error("ORIGIN not found!");

    this.setMiddleWare();
    this.setRoutes();
    this.setErrorCatcher();
  }

  private setMiddleWare() {
    this.app.use(cookieParser(process.env.SECRET));
    this.app.use(helmet());
    this.app.use(limiter());
    this.app.use(
      cors({
        origin: this.origin,
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
      })
    );
    this.app.use(express.json());
  }

  private setRoutes() {
    this.app.use("/auth", acc);
    this.app.use("/book", book);
  }

  private setErrorCatcher() {
    this.app.use("*", (_req: Request, _res: Response, next: NextFunction) => {
      next(new HttpError(405, "Method not allowed!"));
    });
    this.app.use(errorHandler);
  }
}

export default new App().app;
