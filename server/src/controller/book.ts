import { Response, NextFunction } from "express";
import prisma from "../utils/db";
import { throwError } from "../utils/throwError";
import getISBN from "../utils/getISBN";
import { IRequest } from "../@types/express";
import { z } from "zod";
import bookSchema from "../schema/bookSchema";
import borrowSchema from "../schema/borrowSchema";
import { Book as PrismaBook } from "@prisma/client";
import userSchema from "../schema/userSchema";

type Book = z.infer<typeof bookSchema>;
type Peminjaman = z.infer<typeof borrowSchema>;

export const readBook = async (
  req: IRequest<Book>,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = bookSchema
      .pick({ id: true, isbn: true })
      .safeParse(req.query);

    if (!result.success) throw result.error;

    const { id, isbn } = result.data;

    if (id && isbn)
      return throwError(400, "Pilih salah satu query yang ingin digunakan!");

    let book: PrismaBook | PrismaBook[] | GetISBN | null = null;

    if (id) book = await prisma.book.findFirst({ where: { id } });
    else if (isbn)
      book =
        (await prisma.book.findFirst({
          where: { isbn },
          select: {
            judul: true,
            isbn: true,
            pengarang: true,
            penerbit: true,
            tahun: true,
            email: true,
            website: true,
          },
        })) || (await getISBN(isbn));
    else book = await prisma.book.findMany();

    if (!book) return throwError(404, "Buku tidak ditemukan!");
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
    if (typeof tag !== "string") return throwError(500, "Tag harus string!");
    const book = await prisma.book.findMany({
      where: { OR: [{ judul: { contains: tag } }, { tag: { contains: tag } }] },
      select: { id: true, image: true, judul: true, stock: true },
    });

    return res.json(book);
  } catch (error) {
    next(error);
  }
};

export const createBook = async (
  req: IRequest<Book>,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = bookSchema.safeParse(req.body);
    if (!result.success) throw result.error;
    const data = result.data;

    const findISBN = await prisma.book.findFirst({
      where: { isbn: data.isbn },
    });

    if (findISBN) return throwError(409, "Buku sudah ada di dalam database!");

    const create = await prisma.book.create({ data });
    return res
      .status(200)
      .json({ message: "Berhasil menambahkan buku", data: create });
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
    const result = bookSchema.partial().safeParse(req.body);
    if (!result.success) throw result.error;

    const { id, ...data } = result.data;
    if (!id) return throwError(500, "Book ID not found!");

    const book = await prisma.book.update({ where: { id }, data });
    return res
      .status(200)
      .json({ message: "Berhasil mengubah data buku", book });
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
    const result = userSchema
      .pick({ name: true })
      .transform((val) => ({
        name: val.name.toLowerCase(),
      }))
      .safeParse(req.query);

    if (!result.success) throw result.error;

    const { name } = result.data;

    const data = await prisma.loan.findMany({
      where: { status: "DIPINJAM", acc: { name } },
      include: {
        acc: {
          select: {
            name: true,
            user: { select: { angkatan: true, jurusan: true, kelas: true } },
          },
        },
        book: { select: { image: true, judul: true } },
      },
    });

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
    const result = borrowSchema
      .omit({ id: true, isbn: true, type: true })
      .required()
      .safeParse(req.body);

    if (!result.success) throw result.error;

    const { lamaHari, bookId, accId, bookCode } = result.data;

    const cariBuku = await prisma.book.findFirst({
      where: { id: bookId },
    });

    if (!cariBuku) return throwError(404, "Buku tidak ditemukan");
    if (cariBuku.stock === 0) return throwError(404, "Stok buku habis!");
    const cariUser = await prisma.acc.findFirst({
      where: { id: accId },
    });

    if (!cariUser) return throwError(404, "User tidak ditemukan");

    const pinjamanSama = await prisma.loan.findFirst({
      where: {
        accId: accId,
        bookId: bookId,
        status: "DIPINJAM",
      },
      include: { acc: true },
    });

    if (pinjamanSama) {
      return throwError(
        403,
        `${pinjamanSama.acc.name} belum mengembalikan buku yang sama, tidak bisa meminjam lagi!`
      );
    }

    const isBookLost = await prisma.loan.findFirst({
      where: { accId, OR: [{ denda: { gt: 0 } }, { status: "HILANG" }] },
      include: { acc: true, book: true },
    });

    if (isBookLost) {
      if (!isBookLost.book.id)
        return throwError(
          500,
          "ID buku yang hilang tidak ditemukan, apakah bukunya dihapus?"
        );

      if (isBookLost.status === "HILANG")
        return throwError(
          403,
          `${isBookLost.acc.name} belum mengembalikan buku ${isBookLost.book.judul} yang telah hilang sebelumnya!`
        );

      if (isBookLost.denda)
        return throwError(
          403,
          `${isBookLost.acc.name} belum membayar denda sebanyak ${isBookLost.denda}!`
        );
    }
    await prisma.book.update({
      where: { id: cariBuku.id },
      data: { stock: { decrement: 1 } },
    });

    const batasPengembalian = new Date();
    batasPengembalian.setDate(batasPengembalian.getDate() + lamaHari);
    batasPengembalian.setHours(23, 59, 59, 999);

    await prisma.loan.create({
      data: {
        bookCode,
        bookId,
        accId,
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
    const result = borrowSchema
      .pick({ bookCode: true, bookId: true })
      .required()
      .safeParse(req.body);

    if (!result.success) throw result.error;

    const { bookCode, bookId } = result.data;

    const cariBuku = await prisma.book.findFirst({
      where: { id: bookId },
    });

    if (!cariBuku)
      return throwError(500, "Buku dipinjam, tapi tidak ada di database!");

    const bukuPinjaman = await prisma.loan.findFirst({
      where: { bookCode, status: "DIPINJAM" },
      include: { acc: true },
    });

    if (!bukuPinjaman) return throwError(404, "Buku pinjaman tidak ditemukan!");
    const sekarang = new Date();

    let denda = 0;
    const biayaDenda = 1000;

    if (bukuPinjaman.batasPengembalian < sekarang) {
      const hari = Math.ceil(
        (sekarang.getTime() - bukuPinjaman.batasPengembalian.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      denda = hari * biayaDenda;
    }

    await prisma.book.update({
      where: { id: bookId },
      data: { stock: { increment: 1 } },
    });

    await prisma.loan.update({
      where: bukuPinjaman,
      data: {
        status: "DIKEMBALIKAN",
        waktuKembali: new Date(Date.now()),
        denda,
      },
    });

    return res.status(200).json({
      message: denda
        ? `Terlambat selama ${
            denda / biayaDenda
          } hari dan dikenakan denda ${denda}!`
        : `Berhasil mengembalikan buku!`,
    });
  } catch (error) {
    next(error);
  }
};

export const kehilanganBuku = async (
  req: IRequest<Peminjaman>,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = borrowSchema
      .pick({ bookCode: true, bookId: true })
      .required()
      .safeParse(req.body);

    if (!result.success) throw result.error;

    const { bookCode, bookId } = result.data;

    const cariBuku = await prisma.book.findFirst({
      where: { id: bookId },
    });

    if (!cariBuku)
      return throwError(
        500,
        "Buku sudah dipinjam, apakah terhapus? Check Database"
      );

    const bukuPinjaman = await prisma.loan.findFirst({
      where: { bookCode, status: "DIPINJAM" },
    });

    if (!bukuPinjaman)
      return throwError(404, "Buku yang dipinjam tidak ditemukan!");

    await prisma.loan.update({
      where: { id: bukuPinjaman.id },
      data: { status: "HILANG", waktuKembali: new Date(Date.now()) },
    });

    return res.status(200).json({
      message: `Berhasil melaporkan buku yang hilang!`,
    });
  } catch (error) {
    next(error);
  }
};

export const lunas = async (
  req: IRequest<Peminjaman>,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = borrowSchema
      .pick({ bookId: true, id: true, type: true })
      .required()
      .safeParse(req.body);

    if (!result.success) throw result.error;

    const { bookId, id, type } = result.data;

    const book = await prisma.book.findFirst({
      where: { id: bookId },
    });

    if (!book) return throwError(404, "Buku tidak ditemukan di database!");

    if (type === "BUKU")
      await prisma.loan.update({
        where: { id },
        data: { status: "DIKEMBALIKAN" },
      });
    else if (type === "DENDA")
      await prisma.loan.update({
        where: { id },
        data: { denda: 0 },
      });
    else return throwError(403, "Tipe pelunasan tidak valid!");

    return res.status(200).json({
      message: `Berhasil ${
        type === "BUKU" ? "mengembalikan buku!" : "membayar denda!"
      }`,
    });
  } catch (error) {
    next(error);
  }
};
