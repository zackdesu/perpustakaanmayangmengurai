import { z } from "zod";
import bookSchema from "./bookSchema";
import userSchema from "./userSchema";

const borrowSchema = bookSchema
  .pick({ isbn: true })
  .merge(userSchema.pick({ username: true }))
  .extend({
    bookId: z.coerce.number().min(1, "ID buku masih kosong!"),
    lamaHari: z.coerce.number().min(1, "Batas pengembalian wajib ditetapkan!"),
    bookCode: z.coerce.string().min(1, "Kode Buku masih kosong!"),
  })
  .partial();

export default borrowSchema;
