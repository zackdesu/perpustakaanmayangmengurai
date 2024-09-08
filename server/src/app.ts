import express from "express";
import { router as acc } from "./route/account";
import cookieParser from "cookie-parser";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

const app = express();
const origin = process.env.ORIGIN;

if (!origin) throw new Error("ORIGIN not found!");

app.use(cookieParser(process.env.SECRET));

app.use(helmet());

app.use(
  rateLimit({
    windowMs: 1000 * 60 * 15,
    limit: 100,
    message: "Kamu melakukan request terlalu banyak! Silahkan coba lagi nanti.",
  })
);

app.use(
  cors({
    origin,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

app.use("/auth", acc);

export default app;
