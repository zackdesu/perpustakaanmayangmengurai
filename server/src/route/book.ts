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
  lunas,
} from "../controller/book";
import { authenticate } from "../middleware/authHandler";
import isAdmin from "../middleware/isAdmin";

const publicRouter = Router();
const privateRouter = Router();

publicRouter.get("/read", readBook);
publicRouter.post("/", findByTag);

privateRouter.use(authenticate, isAdmin);
publicRouter.post("/create", createBook);
privateRouter.patch("/update", updateBook);
privateRouter.delete("/delete/:id", deleteBook);

privateRouter.get("/list", listPeminjam);
privateRouter.post("/borrow", peminjaman);
privateRouter.patch("/return", pengembalianBuku);
privateRouter.patch("/lost", kehilanganBuku);
privateRouter.patch("/fine", lunas);

const combinatedRouter = Router();
combinatedRouter.use("/", publicRouter);
combinatedRouter.use("/", privateRouter);

export { combinatedRouter as book };
