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
router.post("/refresh", refresh);
router.delete("/logout", logout);

router.use(authenticate);
router.get("/details", read);
router.patch("/update", update);

export { router as acc };
