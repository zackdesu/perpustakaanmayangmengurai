import { z } from "zod";
import bookSchema from "./bookSchema";

const borrowSchema = bookSchema
  .pick({ isbn: true })
  .extend({
    id: z.coerce.number(),
    bookId: z.coerce.string().min(1, "ID buku masih kosong!"),
    lamaHari: z.coerce.number().min(1, "Batas pengembalian wajib ditetapkan!"),
    bookCode: z.coerce.string().min(1, "Kode Buku masih kosong!"),
    accId: z.coerce.string().min(1, "ID peminjam wajib ada!"),
    type: z.enum(["DENDA", "BUKU"], {
      errorMap: () => ({ message: "Tipe tidak valid!" }),
    }),
  })
  .partial();

export default borrowSchema;
