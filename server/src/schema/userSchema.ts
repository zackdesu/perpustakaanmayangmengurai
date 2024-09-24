import { z } from "zod";

const userSchema = z.object({
  username: z.coerce
    .string()
    .trim()
    .min(3, "Username harus lebih dari 3 huruf!")
    .max(20, "Username tidak boleh lebih dari 20 huruf!"),
  name: z.coerce.string().min(2, "Nama harus lebih dari 2 huruf!"),
  email: z.coerce.string().email("Email tidak valid!").optional(),
  password: z.coerce.string().min(6, "Password harus lebih dari 6 karakter!"),
  otp: z.coerce
    .number()
    .min(2000, "Kode OTP tidak valid!")
    .max(8000, "Kode OTP tidak valid!")
    .optional(),
  absentnum: z.coerce
    .number()
    .positive()
    .min(1, "Nomor Absen wajib diisi!")
    .max(40, "Nomor Absen tidak boleh lebih dari 3 angka!"),
  angkatan: z.coerce
    .number()
    .positive()
    .int()
    .min(10, "Angkatan tidak valid (10-12)")
    .max(12, "Angkatan tidak valid (10-12)"),
  jurusan: z.enum(["AKL", "PN", "MPLB", "TKJ", "BSN", "KUL", "ULP"], {
    errorMap: () => ({ message: "Jurusan tidak valid!" }),
  }),
  kelas: z.coerce
    .number()
    .positive()
    .min(1, "Kelas tidak valid")
    .max(3, "Kelas tidak valid!")
    .default(1),
});

export default userSchema;
