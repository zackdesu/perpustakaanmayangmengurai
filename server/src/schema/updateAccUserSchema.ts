import { z } from "zod";
import userSchema from "./userSchema";

const updateAccUserSchema = userSchema.omit({ password: true }).extend({
  oldPassword: z.coerce
    .string()
    .min(6, "Password harus lebih dari 6 karakter!"),
  newPassword: z.coerce
    .string()
    .min(6, "Password harus lebih dari 6 karakter!"),
  NISN: z.coerce
    .string()
    .min(10, "NISN harus berupa 10 karakter!")
    .max(10, "NISN harus berupa 10 karakter!")
    .optional(),
  NIPD: z.coerce
    .string()
    .min(5, "NIPD harus berupa 5 karakter!")
    .max(5, "NIPD harus berupa 10 karakter!")
    .optional(),
  tempat: z.coerce.string().optional(),
  tanggalLahir: z.coerce.date({ message: "Tanggal tidak valid!" }).optional(),
});

export default updateAccUserSchema;
