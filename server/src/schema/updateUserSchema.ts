import { z } from "zod";

const updateUserSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username harus lebih dari 3 huruf!")
    .max(20, "Username tidak boleh lebih dari 20 huruf!"),
  name: z.string().min(2, "Nama harus lebih dari 2 huruf!"),
  email: z.string().email("Email tidak valid!"),
  oldPassword: z.string().min(6, "Password harus lebih dari 6 karakter!"),
  newPassword: z.string().min(6, "Password harus lebih dari 6 karakter!"),
});

export default updateUserSchema;
