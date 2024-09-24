import { z } from "zod";
import bookSchema from "./bookSchema";

const borrowSchema = bookSchema
  .pick({ isbn: true, id: true })
  .extend({
    lamaHari: z.coerce.number(),
    bookCode: z.coerce.string(),
    bookId: z.coerce.string(),
    userId: z.coerce.string(),
    type: z.enum(["DENDA", "BUKU"], {
      errorMap: () => ({ message: "Tipe tidak valid!" }),
    }),
  })
  .partial();

export default borrowSchema;
