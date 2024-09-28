import Router from "express";
import { readUser, updateUser } from "../controller/user";
import { authenticate } from "../middleware/authHandler";
import setCache from "../utils/cache";

const router = Router();
router.use(authenticate);
router.get("/info", setCache(60 * 1), readUser);
router.put("/update", updateUser);

export { router as user };
