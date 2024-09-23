import { z } from "zod";

const updateUserSchema = z.object({
  username: z.coerce
    .string()
    .trim()
    .min(3, "Username harus lebih dari 3 huruf!")
    .max(20, "Username tidak boleh lebih dari 20 huruf!"),
  name: z.coerce.string().min(2, "Nama harus lebih dari 2 huruf!"),
  email: z.coerce.string().email("Email tidak valid!"),
  oldPassword: z.coerce
    .string()
    .min(6, "Password harus lebih dari 6 karakter!"),
  newPassword: z.coerce
    .string()
    .min(6, "Password harus lebih dari 6 karakter!"),
});

export default updateUserSchema;
