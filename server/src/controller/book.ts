import { Response, NextFunction } from "express";
import prisma from "../utils/db";
import { throwError } from "../utils/throwError";
import { isISBN } from "validator";
import getISBN from "../utils/getISBN";
import { IRequest } from "../@types/express";

type Peminjaman = {
  id?: string;
  batasPengembalian?: Date;
  bookId?: string;
  userId?: string;
  kodeBuku?: string;
};

export const createBook = async (
  req: IRequest<Book>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { ...data } = req.body;
    const isbn = data.isbn
      ?.split("-")
      .join("")
      .replace(/(.{1,3})(.{1,3})(.{1,3})(.{1,3})(.{1,1})/, "$1-$2-$3-$4-$5");

    const findISBN = await prisma.book.findFirst({
      where: { isbn },
    });

    if (findISBN) return throwError(403, "Buku sudah ada di dalam database!");

    if (!data.judul && isbn) {
      if (!isISBN(isbn)) return throwError(404, "ISBN tidak valid!");
      const data = await getISBN(isbn);
      if (!data || !data.judul) return throwError(404, "Book not found!");
      return res.status(200).json(data);
    }

    if (!data.type) return throwError(403, "Tipe tidak diterima!");
    if (!data.judul) return throwError(403, "Nama buku belum ditentukan!");
    if (!data.pengarang)
      return throwError(403, "Nama pengarang belum ditentukan!");

    const create = await prisma.book.create({
      data: {
        ...data,
        judul: data.judul,
        type: data.type,
        pengarang: data.pengarang,
        tag: data.tag,
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
  req: IRequest<Book>,
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
  req: IRequest<Book>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.payload) return throwError(500, "req.payload undefined!");
    const { role } = req.payload;

    if (role !== "ADMIN")
      return throwError(403, "Pembaruan harus di lakukan oleh admin!");

    const { id, judul, pengarang, ...data } = req.body;
    if (!id) return throwError(500, "Book ID not found!");
    if (!data.type) return throwError(403, "Tipe tidak diterima!");
    if (!judul) return throwError(403, "Nama buku belum ditentukan!");
    if (!pengarang) return throwError(403, "Nama pengarang belum ditentukan!");

    const book = await prisma.book.update({
      where: { id },
      data: { judul, pengarang, tag: data.tag, ...data },
    });
    return res.status(200).json(book);
  } catch (error) {
    next(error);
  }
};

export const findByTag = async (
  req: IRequest<Book>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tag } = req.query;
    console.log(tag);
    if (typeof tag !== "string") return throwError(500, "Tag harus string!");
    const book = await prisma.book.findMany({
      where: { OR: [{ judul: { contains: tag } }, { tag: { contains: tag } }] },
    });

    return res.json(book);
  } catch (error) {
    next(error);
  }
};

export const deleteBook = async (
  req: IRequest<Book>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.payload) return throwError(500, "req.payload undefined!");
    const { role } = req.payload;

    if (role !== "ADMIN")
      return throwError(403, "Penghapusan buku harus di lakukan oleh admin!");

    const { id } = req.params;
    const book = await prisma.book.findFirst({ where: { id } });

    if (!book) return throwError(404, "Buku tidak ditemukan!");

    await prisma.book.delete({ where: book });

    return res.status(200).json({
      message: "Buku berhasil di hapus!",
    });
  } catch (error) {
    next(error);
  }
};

export const listPeminjam = async (
  req: IRequest<Book>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.payload) return throwError(500, "req.payload undefined!");
    const { role } = req.payload;

    if (role !== "ADMIN")
      return throwError(403, "List peminjaman hanya bisa di lihat oleh admin!");

    const data = await prisma.loan.findMany({ where: { dikembalikan: false } });

    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const peminjaman = async (
  req: IRequest<Peminjaman>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.payload) return throwError(500, "req.payload undefined!");
    const { role } = req.payload;

    if (role !== "ADMIN")
      return throwError(403, "Peminjaman harus di lakukan oleh admin!");

    const { batasPengembalian, bookId, userId, id } = req.body;
    if (!batasPengembalian)
      return throwError(403, "Batas pengembalian wajib ditetapkan!");
    if (!userId) return throwError(403, "ID peminjam wajib ada!");
    if (!bookId) return throwError(403, "ID buku masih kosong!");
    if (!id) return throwError(403, "Kode Buku masih kosong!");

    const cariBuku = await prisma.book.findFirst({
      where: { id: bookId },
    });

    if (!cariBuku) return throwError(403, "Buku tidak ditemukan");
    if (cariBuku.stock === 0) return throwError(403, "Stok buku habis!");
    const cariUser = await prisma.acc.findFirst({
      where: { id: userId },
    });

    console.log(cariUser);
    if (!cariUser) return throwError(403, "User tidak ditemukan");

    await prisma.book.update({
      where: { id: cariBuku.id },
      data: { stock: { decrement: 1 } },
    });

    await prisma.loan.create({
      data: {
        id,
        bookId,
        userId,
        batasPengembalian,
      },
    });

    return res.status(200).json({
      message:
        "Berhasil meminjamkan buku! Buku sudah bisa diberikan kepada peminjam.",
    });
  } catch (error) {
    next(error);
  }
};

export const pengembalianBuku = async (
  req: IRequest<Peminjaman>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, bookId } = req.body;

    if (!req.payload) return throwError(500, "req.payload undefined!");

    const { role } = req.payload;

    if (role !== "ADMIN")
      return throwError(403, "Pengembalian harus di lakukan oleh admin!");
    if (!bookId) return throwError(403, "ID buku masih kosong!");
    if (!id) return throwError(403, "Kode Buku masih kosong!");

    const cariBuku = await prisma.book.findFirst({
      where: { id: bookId },
    });

    if (!cariBuku)
      return throwError(
        500,
        "Buku sudah dipinjam, apakah terhapus? Check Database"
      );

    await prisma.book.update({
      where: { id: bookId },
      data: { stock: { increment: 1 } },
    });

    await prisma.loan.update({
      where: { id },
      data: { dikembalikan: true, waktuKembali: new Date(Date.now()) },
    });
  } catch (error) {
    next(error);
  }
};
