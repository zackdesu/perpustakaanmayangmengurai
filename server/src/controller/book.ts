import { Response, NextFunction } from "express";
import prisma from "../utils/db";
import { throwError } from "../utils/throwError";
import getISBN from "../utils/getISBN";
import { IRequest } from "../@types/express";
import isISBN from "../utils/isbnValidator";
import { z } from "zod";
import bookSchema from "../schema/bookSchema";
import borrowSchema from "../schema/borrowSchema";

type Book = z.infer<typeof bookSchema>;
type Peminjaman = z.infer<typeof borrowSchema>;

export const createBook = async (
  req: IRequest<Book>,
  res: Response,
  next: NextFunction
) => {
  try {
    const parseISBN = bookSchema.pick({ isbn: true }).safeParse(req.body.isbn);

    if (!parseISBN.success) throw parseISBN.error;
    const { isbn } = parseISBN.data;

    const findISBN = await prisma.book.findFirst({
      where: { isbn },
    });

    if (findISBN) return throwError(409, "Buku sudah ada di dalam database!");

    if (!req.body.judul && isbn) {
      if (!isISBN(isbn)) return throwError(400, "ISBN tidak valid!");
      const data = await getISBN(isbn);
      if (!data || !data.judul) return throwError(404, "Book not found!");
      return res.status(200).json(data);
    }
    const result = bookSchema.safeParse(req.body);
    if (!result.success) throw result.error;

    const data = result.data;

    const create = await prisma.book.create({ data });
    return res
      .status(200)
      .json({ message: "Berhasil menambahkan buku", data: create });
  } catch (error) {
    next(error);
  }
};

export const readAllBook = async (
  req: IRequest<Book>,
  res: Response,
  next: NextFunction
) => {
  try {
    const book = await prisma.book.findMany();

    if (!book) return throwError(404, "Buku belum di input!");
    res.set("Cache-Control", "public, max-age=600");
    return res.status(200).json(book);
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

    const result = bookSchema.safeParse(req.body);
    if (!result.success) throw result.error;

    const { id, ...data } = result.data;
    if (!id) return throwError(500, "Book ID not found!");

    const book = await prisma.book.update({ where: { id }, data });
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

    const data = await prisma.loan.findMany({ where: { status: "DIPINJAM" } });

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

    const result = borrowSchema.safeParse(req.body);

    if (!result.success) throw result.error;

    const { lamaHari, bookId, userId, bookCode } = result.data;
    if (!lamaHari)
      return throwError(400, "Batas pengembalian wajib ditetapkan!");
    if (!userId) return throwError(400, "ID peminjam wajib ada!");
    if (!bookId) return throwError(400, "ID buku masih kosong!");
    if (!bookCode) return throwError(400, "Kode Buku masih kosong!");

    const cariBuku = await prisma.book.findFirst({
      where: { id: bookId },
    });

    if (!cariBuku) return throwError(404, "Buku tidak ditemukan");
    if (cariBuku.stock === 0) return throwError(404, "Stok buku habis!");
    const cariUser = await prisma.acc.findFirst({
      where: { id: userId },
    });

    if (!cariUser) return throwError(404, "User tidak ditemukan");

    const pinjamanSama = await prisma.loan.findFirst({
      where: {
        userId: userId,
        bookId: bookId,
        status: "DIPINJAM",
      },
      include: { user: true },
    });

    if (pinjamanSama) {
      return throwError(
        403,
        `${pinjamanSama.user.name} belum mengembalikan buku yang sama, tidak bisa meminjam lagi!`
      );
    }

    const isBookLost = await prisma.loan.findFirst({
      where: { userId, OR: [{ denda: { gt: 0 } }, { status: "HILANG" }] },
      include: { user: true, book: true },
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
          `${isBookLost.user.name} belum mengembalikan buku ${isBookLost.book.judul} yang telah hilang sebelumnya!`
        );

      if (isBookLost.denda)
        return throwError(
          403,
          `${isBookLost.user.name} belum membayar denda sebanyak ${isBookLost.denda}!`
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
    const { bookCode, bookId } = req.body;

    if (!req.payload) return throwError(500, "req.payload undefined!");

    const { role } = req.payload;

    if (role !== "ADMIN")
      return throwError(403, "Pengembalian harus di lakukan oleh admin!");
    if (!bookId) return throwError(400, "ID buku masih kosong!");
    if (!bookCode) return throwError(400, "Kode Buku masih kosong!");

    const cariBuku = await prisma.book.findFirst({
      where: { id: bookId },
    });

    if (!cariBuku)
      return throwError(500, "Buku dipinjam, tapi tidak ada di database!");

    const bukuPinjaman = await prisma.loan.findFirst({
      where: { bookCode, status: "DIPINJAM" },
      include: { user: true },
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

    if (denda)
      return res.status(200).json({
        message: `Terlambat selama ${
          denda / biayaDenda
        } dan dikenakan denda ${denda}!`,
      });

    return res.status(200).json({
      message: `Berhasil mengembalikan buku!`,
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
    const { bookCode, bookId } = req.body;

    if (!req.payload) return throwError(500, "req.payload undefined!");

    const { role } = req.payload;

    if (role !== "ADMIN")
      return throwError(403, "Pengembalian harus di lakukan oleh admin!");

    if (!bookId) return throwError(400, "ID buku masih kosong!");
    if (!bookCode) return throwError(400, "Kode Buku masih kosong!");

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
    const data = req.body;
    if (!req.payload) return throwError(500, "req.payload undefined!");

    const { role } = req.payload;

    if (role !== "ADMIN")
      return throwError(403, "Pelunasan harus di lakukan oleh admin!");

    if (!data.bookId) return throwError(403, "ID Buku tidak di input!");
    if (!data.id) return throwError(403, "ID Peminjaman tidak di input!");
    if (!data.type)
      return throwError(403, "Tipe Pelunasan tidak boleh kosong!");

    const id = parseInt(data.id);

    const book = await prisma.book.findFirst({
      where: { id: data.bookId },
    });

    if (!book) return throwError(404, "Buku tidak ditemukan di database!");

    if (data.type === "BUKU")
      await prisma.loan.update({
        where: { id },
        data: { status: "DIKEMBALIKAN" },
      });
    else if (data.type === "DENDA")
      await prisma.loan.update({
        where: { id },
        data: { denda: 0 },
      });
    else return throwError(403, "Tipe pelunasan tidak valid!");

    return res.status(200).json({
      message: `Berhasil ${
        data.type === "BUKU" ? "mengembalikan buku!" : "membayar denda!"
      }`,
    });
  } catch (error) {
    next(error);
  }
};
