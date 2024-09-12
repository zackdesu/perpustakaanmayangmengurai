import Router from "express";
import {
  createBook,
  findByTag,
  listPeminjam,
  peminjaman,
  pengembalianBuku,
  readBook,
  updateBook,
} from "../controller/book";
import { authenticate } from "../middleware/authHandler";

const router = Router();

router.post("/create", createBook);
router.post("/read/:id", readBook);
router.post("", findByTag);

router.use(authenticate);
router.post("/update/:id", updateBook);
router.post("/list", listPeminjam);
router.post("/borrow", peminjaman);
router.post("/return", pengembalianBuku);

export { router as book };
