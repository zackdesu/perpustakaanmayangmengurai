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
import { authenticate } from "../middleware/authHandler";

const router = Router();

router.post("/register", create);
router.post("/otp", OTP);
router.post("/login", login);
router.get("/refresh", refresh);
router.delete("/logout", logout);

router.get("/details", authenticate, read);
router.patch("/update", authenticate, update);

export { router as acc };
