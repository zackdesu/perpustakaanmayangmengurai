import { Router } from "express";
import { OTP, create, read, update } from "../controller/account";
import errorHandler from "../middleware/errorHandler";
import { login, logout, refresh } from "../controller/logAcc";

const router = Router();

router.route("/acc").post(create).get(read).put(update).options(OTP);
router.post("/login", login);
router.route("/refresh").get(refresh);
router.delete("/logout", logout);
router.use(errorHandler);

export { router };
