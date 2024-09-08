import { throwError } from "./throwError";

const getISBN = async (isbn: string) => {
  const url = process.env.BOOK_ISBN_API;
  if (!url) return throwError(500, "BOOK_ISBN_API not found!");
  const res = await fetch(url + isbn);
  const { Judul, ISBN, Pengarang, Penerbit, Tahun, Email, Website }: GetISBN =
    await res.status(200).json();
  return {
    judul: Judul,
    isbn: ISBN?.trim(),
    pengarang: Pengarang,
    penerbit: Penerbit,
    tahun: Tahun,
    email: Email,
    website: Website,
  } as Book;
};

export default getISBN;
