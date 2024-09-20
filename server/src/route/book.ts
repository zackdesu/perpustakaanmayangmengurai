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
} from "../controller/book";
import { authenticate } from "../middleware/authHandler";

const router = Router();

router.post("/create", createBook);
router.get("/read", readAllBook);
router.get("/read/:id", readBook);
router.post("", findByTag);

router.use(authenticate);
router.patch("/update/:id", updateBook);
router.get("/list", listPeminjam);
router.post("/borrow", peminjaman);
router.patch("/return", pengembalianBuku);
router.patch("/lost", kehilanganBuku);
router.delete("/delete", deleteBook);

export { router as book };
