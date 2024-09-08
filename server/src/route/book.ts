import Router from "express";
import {
  createBook,
  findByTag,
  readBook,
  updateBook,
} from "../controller/book";

const router = Router();

router.post("/create", createBook);
router.post("/read/:id", readBook);
router.post("/update/:id", updateBook);
router.post("", findByTag);

export { router };
