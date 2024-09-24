import Router from "express";
import {
  createBook,
  findByTag,
  kehilanganBuku,
  listPeminjam,
  peminjaman,
  pengembalianBuku,
  readBook,
  updateBook,
  deleteBook,
  readAllBook,
  lunas,
} from "../controller/book";
import { authenticate } from "../middleware/authHandler";

const publicRouter = Router();
const privateRouter = Router();

publicRouter.post("/create", createBook);
publicRouter.get("/read", readAllBook);
publicRouter.get("/read/:id", readBook);
publicRouter.post("/", findByTag);

privateRouter.use(authenticate);
privateRouter.patch("/update/:id", updateBook);
privateRouter.get("/list", listPeminjam);
privateRouter.post("/borrow", peminjaman);
privateRouter.patch("/return", pengembalianBuku);
privateRouter.patch("/lost", kehilanganBuku);
privateRouter.delete("/delete", deleteBook);
privateRouter.patch("/fine", lunas);

const combinatedRouter = Router();
combinatedRouter.use("/", publicRouter);
combinatedRouter.use("/", privateRouter);

export { combinatedRouter as book };
