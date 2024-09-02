import express from "express";
import { acc } from "./route";
import cookieParser from "cookie-parser";

const app = express();
app.use(cookieParser(process.env.SECRET));

app.use(express.json());
app.use(acc);
export default app;
