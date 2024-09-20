import { z } from "zod";
import isISBN from "../utils/isbnValidator";

const bookSchema = z.object({
  id: z.string().optional(),
  judul: z.string().min(1, "Nama buku wajib ada!"),
  pengarang: z.string().min(1, "Nama pengarang wajib ada!"),
  penerbit: z.string().optional(),
  type: z.enum(
    [
      "LITERATUR",
      "KOMPUTER",
      "PSIKOLOGI",
      "FILOSOFI",
      "SENI",
      "BAHASA",
      "SEJARAH",
      "MATEMATIKA",
      "SAINS",
    ],
    {
      errorMap: () => ({ message: "Tipe buku tidak valid!" }),
    }
  ),
  tahun: z
    .string()
    .min(1, "Tahun tidak valid!")
    .max(4, "Tahun tidak valid!")
    .optional(),
  website: z.string().url("URL tidak valid!").optional(),
  email: z.string().email().optional(),
  image: z.string().optional(),
  stock: z.coerce.number(),
  tag: z.string().optional(),
  isbn: z.string().refine((val) => isISBN(val), {
    message: "ISBN tidak valid!",
  }),
});

export default bookSchema;
