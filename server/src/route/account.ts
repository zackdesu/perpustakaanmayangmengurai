import { Router } from "express";
import {
  OTP,
  create,
  login,
  logout,
  read,
  refresh,
  update,
} from "../controller/account";
import errorHandler from "../middleware/errorHandler";

const router = Router();

router.get("/details", read);
router.post("/register", create);
router.post("/otp", OTP);
router.post("/login", login);
router.post("/refresh", refresh);
router.patch("/update", update);
router.delete("/logout", logout);
router.use(errorHandler);

export { router };
