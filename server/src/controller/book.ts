import { Response, NextFunction } from "express";
import prisma from "../utils/db";
import { throwError } from "../utils/throwError";
import getISBN from "../utils/getISBN";
import { IRequest } from "../@types/express";
import isISBN from "../utils/isbnValidator";
import { z } from "zod";
import bookSchema from "../schema/bookSchema";

type Peminjaman = {
  id?: string;
  lamaHari?: number;
  bookId?: string;
  userId?: string;
  bookCode?: string;
  isbn?: string;
};

type Book = z.infer<typeof bookSchema>;

export const createBook = async (
  req: IRequest<Book>,
  res: Response,
  next: NextFunction
) => {
  try {
    const isbn = req.body.isbn.split("-").join("");

    const findISBN = await prisma.book.findFirst({
      where: { isbn },
    });

    if (findISBN) return throwError(403, "Buku sudah ada di dalam database!");

    if (!req.body.judul && isbn) {
      console.log(isbn);
      if (!isISBN(isbn)) return throwError(404, "ISBN tidak valid!");
      const data = await getISBN(isbn);
      if (!data || !data.judul) return throwError(404, "Book not found!");
      return res.status(200).json(data);
    }
    const result = bookSchema.safeParse(req.body);
    console.log(result.error);
    if (!result.success) throwError(400, "Gagal memvalidasi data buku!");

    const data = result.data as Book;

    const create = await prisma.book.create({
      data: {
        ...data,
        judul: data.judul,
        type: data.type,
        pengarang: data.pengarang,
        tag: data.tag,
        isbn: isbn.replace(
          /(.{1,3})(.{1,3})(.{1,3})(.{1,3})(.{1,1})/,
          "$1-$2-$3-$4-$5"
        ),
      },
    });
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

    if (!result.success) throwError(400, "Gagal memvalidasi data buku!");

    const { id, judul, pengarang, ...data } = result.data as Book;
    if (!id) return throwError(500, "Book ID not found!");
    if (!data.type) return throwError(403, "Tipe tidak diterima!");
    if (!judul) return throwError(403, "Nama buku belum ditentukan!");
    if (!pengarang) return throwError(403, "Nama pengarang belum ditentukan!");

    const book = await prisma.book.update({
      where: { id },
      data,
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

    const { lamaHari, bookId, userId, bookCode } = req.body;
    if (!lamaHari)
      return throwError(403, "Batas pengembalian wajib ditetapkan!");
    if (!userId) return throwError(403, "ID peminjam wajib ada!");
    if (!bookId) return throwError(403, "ID buku masih kosong!");
    if (!bookCode) return throwError(403, "Kode Buku masih kosong!");

    const cariBuku = await prisma.book.findFirst({
      where: { id: bookId },
    });

    if (!cariBuku) return throwError(403, "Buku tidak ditemukan");
    if (cariBuku.stock === 0) return throwError(403, "Stok buku habis!");
    const cariUser = await prisma.acc.findFirst({
      where: { id: userId },
    });

    if (!cariUser) return throwError(403, "User tidak ditemukan");

    const isBookLost = await prisma.loan.findFirst({
      where: { userId },
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
    if (!bookId) return throwError(403, "ID buku masih kosong!");
    if (!bookCode) return throwError(403, "Kode Buku masih kosong!");

    const cariBuku = await prisma.book.findFirst({
      where: { id: bookId },
    });

    if (!cariBuku)
      return throwError(500, "Buku dipinjam, tapi tidak ada di database!");

    const bukuPinjaman = await prisma.loan.findFirst({
      where: { bookCode },
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

    if (!bookId) return throwError(403, "ID buku masih kosong!");
    if (!bookCode) return throwError(403, "Kode Buku masih kosong!");

    const cariBuku = await prisma.book.findFirst({
      where: { id: bookId },
    });

    if (!cariBuku)
      return throwError(
        500,
        "Buku sudah dipinjam, apakah terhapus? Check Database"
      );

    const bukuHilang = await prisma.loan.findFirst({
      where: { bookCode },
    });

    if (!bukuHilang)
      return throwError(500, "Pencarian variabel bukuHilang tidak ditemukan!");

    if (bukuHilang.status == "DIKEMBALIKAN")
      return throwError(
        403,
        "Tidak dapat melaporkan karena buku sudah dikembalikan!"
      );

    await prisma.loan.update({
      where: { id: bukuHilang.id },
      data: { status: "HILANG", waktuKembali: new Date(Date.now()) },
    });

    return res.status(200).json({
      message: `Berhasil melaporkan buku yang hilang!`,
    });
  } catch (error) {
    next(error);
  }
};

// export const lunas = async (
//   req: IRequest<Peminjaman>,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { isbn } = req.body;

//     if (!req.payload) return throwError(500, "req.payload undefined!");

//     const { role } = req.payload;

//     if (role !== "ADMIN")
//       return throwError(403, "Pengembalian harus di lakukan oleh admin!");

//     if (!isbn || isISBN(isbn)) return throwError(403, "ISBN wajib diisi!");

//     const book = await prisma.book.findFirst({
//       where: { isbn },
//     });

//     if (!book) return throwError(404, "Buku tidak ditemukan di database!");
//   } catch (error) {
//     next(error);
//   }
// };
