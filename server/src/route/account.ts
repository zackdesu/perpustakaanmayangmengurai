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

const router = Router();

router.post("/register", create);
router.post("/otp", OTP);
router.post("/login", login);
router.get("/refresh", refresh);
router.delete("/logout", logout);

router.get("/info", setCache(60 * 1), readUser);
router.get("/details", authenticate, read);
router.patch("/update", authenticate, update);

export { router as acc };
