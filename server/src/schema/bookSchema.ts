import { z } from "zod";
import isISBN from "../utils/isbnValidator";

const bookSchema = z.object({
  id: z.coerce.string().optional(),
  judul: z.coerce.string().min(1, "Nama buku wajib ada!"),
  pengarang: z.coerce.string().min(1, "Nama pengarang wajib ada!"),
  penerbit: z.coerce.string().optional(),
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
  tahun: z.coerce
    .string()
    .min(1, "Tahun tidak valid!")
    .max(4, "Tahun tidak valid!")
    .optional(),
  website: z.coerce.string().url("URL tidak valid!").optional(),
  email: z.coerce.string().email().optional(),
  image: z.coerce.string().optional(),
  stock: z.coerce.number(),
  tag: z.coerce.string().optional(),
  isbn: z.coerce.string().refine((val) => isISBN(val), {
    message: "ISBN tidak valid!",
  }),
});

export default bookSchema;
