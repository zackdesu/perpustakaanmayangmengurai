import Router from "express";
import { readUser, updateUser } from "../controller/user";
import { authenticate } from "../middleware/authHandler";

const router = Router();
router.use(authenticate);
router.get("/info", readUser);
router.put("/update", updateUser);

export { router as user };
