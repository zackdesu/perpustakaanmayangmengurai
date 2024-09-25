import { z } from "zod";
import userSchema from "./userSchema";

const updateUserSchema = userSchema
  .pick({ username: true, name: true, email: true, otp: true })
  .extend({
    id: z.string(),
    oldPassword: z.coerce
      .string()
      .min(6, "Password harus lebih dari 6 karakter!"),
    newPassword: z.coerce
      .string()
      .min(6, "Password harus lebih dari 6 karakter!"),
  })
  .partial();

export default updateUserSchema;
