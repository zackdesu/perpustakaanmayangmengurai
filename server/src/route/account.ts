import { Router } from "express";
import {
  OTP,
  create,
  login,
  logout,
  read,
  readUser,
  refresh,
  update,
} from "../controller/account";
import { authenticate } from "../middleware/authHandler";
import setCache from "../utils/cache";
import limiter from "../utils/limiter";

const router = Router();

router.post(
  "/login",
  limiter(10, "Kamu melakukan login terlalu banyak! Silahkan coba lagi nanti."),
  login
);
router.post("/register", create);
router.post("/otp", OTP);
router.get("/refresh", refresh);
router.delete("/logout", logout);

router.get("/info", authenticate, setCache(60 * 1), readUser);
router.get("/details", authenticate, read);
router.patch("/update", authenticate, update);

export { router as acc };
