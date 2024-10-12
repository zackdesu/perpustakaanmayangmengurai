import { Response, NextFunction } from "express";
import prisma from "../utils/db";
import HttpError from "../utils/HttpError";
import getISBN from "../utils/getISBN";
import { IRequest } from "../@types/express";
import { z } from "zod";
import bookSchema from "../schema/bookSchema";
import borrowSchema from "../schema/borrowSchema";
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
      .pick({ isbn: true, bookId: true })
      .safeParse(req.query);

    if (!result.success) throw result.error;

    const { bookId, isbn } = result.data;

    if (bookId && isbn)
      throw new HttpError(400, "Pilih salah satu query yang ingin digunakan!");

    let book: unknown;

    if (bookId) book = await prisma.book.findFirst({ where: { bookId } });
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
    else
      book = await prisma.book.findMany({
        select: {
          judul: true,
          isbn: true,
          pengarang: true,
          penerbit: true,
          tahun: true,
          email: true,
          website: true,
        },
      });

    if (!book) throw new HttpError(404, "Buku tidak ditemukan!");
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
    if (typeof tag !== "string") throw new HttpError(500, "Tag harus string!");
    const book = await prisma.book.findMany({
      where: { OR: [{ judul: { contains: tag } }, { tag: { contains: tag } }] },
      select: { bookId: true, image: true, judul: true, stock: true },
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

    const findBook = await prisma.book.findFirst({
      where: { OR: [{ isbn: data.isbn }, { judul: data.judul }] },
    });

    if (findBook) throw new HttpError(409, "Buku sudah ada di dalam database!");

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
    const shouldOmitType = !(req.body as { type?: string }).type;

    const schemaToUse = shouldOmitType
      ? bookSchema.omit({ bookId: true, type: true })
      : bookSchema.omit({ bookId: true });

    const result = schemaToUse
      .partial()
      .merge(bookSchema.pick({ bookId: true }).required())
      .safeParse(req.body);

    if (!result.success) throw result.error;

    const { bookId, ...data } = result.data;

    const findBook = await prisma.book.findFirst({ where: { bookId } });
    if (!findBook) throw new HttpError(404, "Buku tidak ditemukan!");

    const isTitleExist = await prisma.book.findFirst({
      where: { judul: data.judul },
    });

    if (isTitleExist)
      throw new HttpError(403, "Judul sudah tersedia di dalam database!");

    const book = await prisma.book.update({
      where: { bookId: findBook.bookId },
      data,
    });
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
    const result = bookSchema.pick({ bookId: true }).safeParse(req.params);
    if (!result.success) throw new HttpError(403, result.error);
    const { bookId } = result.data;
    const book = await prisma.book.findFirst({ where: { bookId } });

    if (!book) throw new HttpError(404, "Buku tidak ditemukan!");

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

    if (!data) throw new HttpError(404, "Peminjam belum ada!");

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
      .omit({ isbn: true })
      .required()
      .safeParse(req.body);

    if (!result.success) throw result.error;

    const { lamaHari, bookId, username, bookCode } = result.data;

    const cariBuku = await prisma.book.findFirst({
      where: { bookId },
    });

    if (!cariBuku) throw new HttpError(404, "Buku tidak ditemukan");
    if (cariBuku.stock === 0) throw new HttpError(404, "Stok buku habis!");
    const cariUser = await prisma.acc.findFirst({
      where: { username },
    });

    if (!cariUser) throw new HttpError(404, "User tidak ditemukan");

    const pinjamanSama = await prisma.loan.findFirst({
      where: {
        id: bookId,
        status: "DIPINJAM",
        acc: { username },
      },
      include: { acc: true },
    });

    if (pinjamanSama) {
      throw new HttpError(
        403,
        `${pinjamanSama.acc.name} belum mengembalikan buku yang sama, tidak bisa meminjam lagi!`
      );
    }

    const isBookLost = await prisma.loan.findFirst({
      where: {
        acc: { username },
        OR: [{ denda: { gt: 0 } }, { status: "HILANG" }],
      },
      include: { acc: true, book: true },
    });

    if (isBookLost) {
      if (isBookLost.status === "HILANG")
        throw new HttpError(
          403,
          `${isBookLost.acc.name} belum mengembalikan buku ${isBookLost.book.judul} yang telah hilang sebelumnya!`
        );

      if (isBookLost.denda)
        throw new HttpError(
          403,
          `${isBookLost.acc.name} belum membayar denda sebanyak ${isBookLost.denda}!`
        );
    }

    const batasPengembalian = new Date();
    batasPengembalian.setDate(batasPengembalian.getDate() + lamaHari);
    batasPengembalian.setHours(23, 59, 59, 999);

    const findUsernameId = await prisma.acc.findUnique({ where: { username } });

    if (!findUsernameId) throw new HttpError(404, "Username tidak ditemukan!");

    await prisma.book.update({
      where: { bookId: cariBuku.bookId },
      data: { stock: { decrement: 1 } },
    });

    await prisma.loan.create({
      data: {
        bookCode,
        bookId,
        accId: findUsernameId.id,
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
      .pick({ bookCode: true, username: true })
      .required()
      .safeParse(req.body);

    if (!result.success) throw result.error;

    const { bookCode, username } = result.data;

    const bukuPinjaman = await prisma.loan.findFirst({
      where: { bookCode, status: "DIPINJAM", acc: { username } },
      include: { acc: true },
    });

    if (!bukuPinjaman)
      throw new HttpError(404, "Buku pinjaman tidak ditemukan!");

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
      where: { bookId: bukuPinjaman.bookId },
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
      denda,
      durasi: denda / biayaDenda,
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
      .pick({ bookCode: true, username: true })
      .required()
      .safeParse(req.body);

    if (!result.success) throw result.error;

    const { bookCode, username } = result.data;

    const bukuPinjaman = await prisma.loan.findFirst({
      where: { bookCode, status: "DIPINJAM", acc: { username } },
    });

    if (!bukuPinjaman)
      throw new HttpError(404, "Buku yang dipinjam tidak ditemukan!");

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
      .pick({ username: true })
      .required()
      .safeParse(req.body);

    if (!result.success) throw result.error;

    const { username } = result.data;

    const findLoan = await prisma.loan.findFirst({
      where: { acc: { username }, denda: { gt: 0 }, status: "HILANG" },
    });

    if (!findLoan) throw new HttpError(404, "Peminjaman tidak ditemukan!");

    let message: string | undefined;

    if (findLoan.denda > 0) {
      await prisma.loan.update({
        where: { id: findLoan.id },
        data: { denda: 0 },
      });
      message = "Berhasil membayar denda!";
    } else if (findLoan.status === "HILANG") {
      message = "Berhasil mengembalikan buku yang hilang!";

      await prisma.loan.update({
        where: { id: findLoan.id },
        data: { status: "DIKEMBALIKAN" },
      });
    } else throw new HttpError(500, "findLoan error.");

    return res.status(200).json(message);
  } catch (error) {
    next(error);
  }
};
