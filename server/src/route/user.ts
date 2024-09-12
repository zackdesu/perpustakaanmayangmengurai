import Router from "express";
import { readUser, updateUser } from "../controller/user";
import { authenticate } from "../middleware/authHandler";

const router = Router();

router.get("/info", authenticate, readUser);
router.put("/update", authenticate, updateUser);

export { router as user };
