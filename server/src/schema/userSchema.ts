import { z } from "zod";

const userSchema = z
  .object({
    username: z.coerce
      .string()
      .trim()
      .regex(
        /^[a-z0-9_.]+$/,
        "Hanya boleh terdiri dari huruf kecil, angka, titik, dan underscore!"
      )
      .regex(
        /^(?!\.)[a-z0-9_.]+(?<!\.)$/,
        "Tidak boleh ada titik di awal atau akhir!"
      )
      .regex(
        /^(?!.*\.\.)[a-z0-9_.]+$/,
        "Tidak boleh ada dua titik berturut-turut!"
      )
      .min(3, "Username harus lebih dari 3 huruf!")
      .max(20, "Username tidak boleh lebih dari 20 huruf!"),
    name: z.coerce
      .string()
      .min(2, "Nama minimal 2 huruf!")
      .max(50, "Nama terlalu panjang!"),
    email: z.coerce.string().email("Email tidak valid!").optional(),
    password: z.coerce
      .string()
      .min(6, "Password minimal 6 karakter!")
      .max(64, "Panjang password maksimal 64 karakter!"),
    otp: z.coerce
      .number()
      .min(2000, "Kode OTP tidak valid!")
      .max(8000, "Kode OTP tidak valid!")
      .optional(),
    absentnum: z.coerce
      .number()
      .positive()
      .min(1, "Nomor Absen wajib diisi!")
      .max(40, "Nomor Absen tidak boleh lebih dari 40!"),
    angkatan: z.coerce
      .number()
      .positive()
      .int()
      .min(10, "Angkatan tidak boleh kurang dari 10")
      .max(12, "Angkatan tidak boleh lebih dari 12"),
    jurusan: z.enum(["AKL", "PN", "MPLB", "TKJ", "BSN", "KUL", "ULP"], {
      errorMap: () => ({ message: "Jurusan tidak valid!" }),
    }),
    kelas: z.coerce
      .number()
      .positive()
      .min(1, "Kelas tidak valid!")
      .max(3, "Kelas tidak valid!")
      .default(1),
  })
  .strip();

export default userSchema;
