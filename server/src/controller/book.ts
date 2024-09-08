import { Request, Response, NextFunction } from "express";
import prisma from "../utils/db";
import { throwError } from "../utils/throwError";
import { isISBN } from "validator";
import getISBN from "../utils/getISBN";

interface IRequest extends Request {
  body: Book;
  cookies: {
    accessToken: string;
    refreshToken: string;
  };
}

export const createBook = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const acceptedType = [
      "Literatur",
      "Komputer & Program",
      "Psikologi & Filosofi",
      "Karya Seni & Hiburan",
      "Bahasa",
      "Sejarah",
      "Matematika & Sains",
    ];
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...data } = req.body;

    const isbn = data.isbn;

    const findISBN = await prisma.book.findFirst({
      where: { isbn },
    });

    if (findISBN) return throwError(403, "Buku sudah ada di dalam database!");

    if (!data.judul && isbn && isISBN(isbn)) {
      const data = await getISBN(isbn);
      if (!data || !data.judul) return throwError(404, "Book not found!");
      return res.status(200).json(data);
    }

    if (!data.type || !acceptedType.includes(data.type))
      return throwError(403, "Tipe tidak diterima!");
    if (!data.judul) return throwError(403, "Nama buku belum ditentukan!");
    if (!data.pengarang)
      return throwError(403, "Nama pengarang belum ditentukan!");

    const create = await prisma.book.create({
      data: {
        ...data,
        judul: data.judul,
        type: data.type,
        pengarang: data.pengarang,
        tag: data.tag?.join(","),
      },
    });
    return res
      .status(200)
      .json({ message: "Berhasil menambahkan buku", data: create });
  } catch (error) {
    next(error);
  }
};

export const readBook = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const book = await prisma.book.findFirst({ where: { id } });

    if (!book) return throwError(404, "Buku tidak ditemukan!");

    return res.status(200).json(book);
  } catch (error) {
    next(error);
  }
};

export const updateBook = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, judul, pengarang, ...data } = req.body;
    if (!id) return throwError(500, "Book ID not found!");
    const acceptedType = [
      "Literatur",
      "Komputer & Program",
      "Psikologi & Filosofi",
      "Karya Seni & Hiburan",
      "Bahasa",
      "Sejarah",
      "Matematika & Sains",
    ];
    if (!data.type || !acceptedType.includes(data.type))
      return throwError(403, "Tipe tidak diterima!");
    if (!judul) return throwError(403, "Nama buku belum ditentukan!");
    if (!pengarang) return throwError(403, "Nama pengarang belum ditentukan!");

    const book = await prisma.book.update({
      where: { id },
      data: { ...data, judul, pengarang, tag: data.tag?.join(",") },
    });
    return res.status(200).json(book);
  } catch (error) {
    next(error);
  }
};

export const findByTag = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tag } = req.query;
    if (typeof tag !== "string") return throwError(500, "Tag harus string!");
    const book = await prisma.book.findMany({
      where: { OR: [{ judul: { contains: tag }, tag: { contains: tag } }] },
    });

    return res.json(book);
  } catch (error) {
    next(error);
  }
};
