import { Book } from "@prisma/client";
import HttpError from "./HttpError";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObject = { [key: string]: any };

const lowercaseKeys = (obj: AnyObject, deep = false) =>
  Object.keys(obj).reduce((acc, key) => {
    acc[key.toLowerCase()] =
      deep && typeof obj[key] === "object" ? lowercaseKeys(obj[key]) : obj[key];
    return acc;
  }, {} as AnyObject);

const getISBN = async (ISBN: string) => {
  const url = process.env.BOOK_ISBN_API;
  if (!url) throw new HttpError(500, "BOOK_ISBN_API not found!");
  const res = await fetch(url + ISBN);
  const dataJSON: { rows: [GetISBN] | null } = await res.json();
  if (!dataJSON.rows) throw new HttpError(404, "Buku tidak ditemukan!");

  const { judul, isbn, pengarang, penerbit, tahun, email, website } =
    lowercaseKeys(dataJSON.rows[0]) as Book;

  if (!judul) throw new HttpError(404, "Judul tidak ditemukan!");
  if (!pengarang) throw new HttpError(404, "Pengarang tidak ditemukan!");
  if (!isbn) throw new HttpError(500, "ISBN tidak ditemukan!");

  const pengarangAsli = pengarang.split(";")[0].split(".")[0];

  return {
    judul,
    isbn: isbn.split(" ")[0],
    pengarang: pengarangAsli.startsWith("penulis")
      ? pengarangAsli.split(",")[1].trim()
      : pengarangAsli.trim(),
    penerbit,
    tahun,
    email,
    website,
  } as GetISBN;
};

export default getISBN;
