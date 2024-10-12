import request from "supertest";
import app from "../src/app";
import prisma from "../src/utils/db";
import { cache } from "../src/utils/cache";
import jwt from "jsonwebtoken";

jest.spyOn(cache, "get");
jest.spyOn(cache, "keys");
jest.spyOn(cache, "flushAll");

const sampleBook = {
  judul: "Atomic habits : perubahan kecil yang memberikan hasil luar biasa",
  pengarang: "James Clear",
  penerbit: "PT. Gramedia Pustaka Utama",
  tahun: "2019",
  website: "http://www.gramediapustakautama.id/",
  email: "suprianto@gramediapustakautama.id",
  image: "./atomichabits.jpg",
  stock: 6,
  tag: "atomic,habits",
  type: "FILOSOFI",
  isbn: "9786230045561",
};

describe("non-authenticate route", () => {
  it("should read null book data", async () => {
    prisma.book.findMany = jest.fn().mockResolvedValue([]);
    const response = await request(app).get("/book/read");

    expect(response.statusCode).toBe(200);
    cache.flushAll();
  });

  it("should read book data", async () => {
    prisma.book.findMany = jest.fn().mockResolvedValue([
      {
        bookId: 1,
        judul: "Gagal Menjadi Manusia",
        pengarang: "Dazai Osamu",
        penerbit: "CV. Haru",
        tahun: "2020",
        website: "http://www.penerbitharu.com/",
        email: "penerbitharu@gmail.com",
        image: "./gagalmenjadimanusia.jpg",
        stock: 10,
        tag: "gagal,menjadi,manusia,dazai,osamu",
        type: "Literatur",
        isbn: "9786237351306",
      },
    ]);

    const response = await request(app).get("/book/read");

    expect(response.statusCode).toBe(200);
    const keys = ["bookId", "image", "judul", "stock"];

    keys.forEach((key) => {
      expect(response.body[0]).toHaveProperty(key);
    });
  });

  prisma.book.findFirst = jest.fn().mockResolvedValue({
    bookId: 1,
    judul: "Gagal Menjadi Manusia",
    image: "./gagalmenjadimanusia.jpg",
    stock: 10,
  });

  it("should not read if tag id & query is inputted", async () => {
    const response = await request(app).get(
      "/book/read?bookId=1&isbn=9786237351306"
    );

    expect(response.statusCode).toBe(400);
  });

  it("should read by tag id", async () => {
    const response = await request(app).get("/book/read?bookId=1");

    expect(response.statusCode).toBe(200);
    const keys = ["bookId", "image", "judul", "stock"];
    keys.forEach((key) => {
      expect(response.body).toHaveProperty(key);
    });
  });

  it("should read by tag isbn", async () => {
    const response = await request(app).get("/book/read?isbn=9786237351306");

    expect(response.statusCode).toBe(200);
    const keys = ["bookId", "image", "judul", "stock"];
    keys.forEach((key) => {
      expect(response.body).toHaveProperty(key);
    });
  });

  it("should check all cache", () => {
    const cacheReadAll = !!cache.get("/book/read");
    const cacheError = !!cache.get("/book/read?bookId=1&isbn=9786237351306");
    const cacheBookId = !!cache.get("/book/read?bookId=1");
    const cacheISBN = !!cache.get("/book/read?isbn=9786237351306");

    expect(cacheReadAll).toBe(true);
    expect(cacheError).toBe(true);
    expect(cacheBookId).toBe(true);
    expect(cacheISBN).toBe(true);
  });

  afterAll(() => {
    cache.flushAll();
    jest.clearAllMocks();
  });
});

describe("admin route", () => {
  beforeAll(() => (jwt.verify = jest.fn().mockReturnValue({ role: "MEMBER" })));
  afterAll(() => jest.resetAllMocks());

  const testRoute =
    (method: "post" | "get" | "put" | "delete" | "patch", route: string) =>
    async () => {
      // prettier-ignore
      const response = await request(app)[method]("/book" + route)
        .set("Authorization", "Bearer abcdefg");
      expect(response.statusCode).toBe(403);
    };

  it("should reject create route", testRoute("post", "/create"));
  it("should reject update route", testRoute("patch", "/update"));
  it("should reject delete/:id route", testRoute("delete", "/delete/:id"));
  it("should reject list route", testRoute("get", "/list"));
  it("should reject borrow route", testRoute("post", "/borrow"));
  it("should reject return route", testRoute("patch", "/return"));
  it("should reject lost route", testRoute("patch", "/lost"));
  it("should reject fine route", testRoute("patch", "/fine"));
});

describe("create book", () => {
  beforeAll(() => (jwt.verify = jest.fn().mockReturnValue({ role: "ADMIN" })));
  afterAll(() => jest.resetAllMocks());

  it("should not create duplicate book by title", async () => {
    prisma.book.findFirst = jest
      .fn()
      .mockResolvedValueOnce({ judul: sampleBook.judul });

    const response = await request(app)
      .post("/book/create")
      .send(sampleBook)
      .set("Authorization", "Bearer abcdefg");

    expect(response.statusCode).toBe(409);
  });

  it("should not create duplicate book by isbn", async () => {
    prisma.book.findFirst = jest
      .fn()
      .mockResolvedValueOnce({ isbn: sampleBook.isbn });

    const response = await request(app)
      .post("/book/create")
      .send(sampleBook)
      .set("Authorization", "Bearer abcdefg");

    expect(response.statusCode).toBe(409);
  });

  it("should create book", async () => {
    prisma.book.findFirst = jest.fn().mockResolvedValueOnce(null);
    prisma.book.create = jest.fn().mockResolvedValueOnce(sampleBook);

    const response = await request(app)
      .post("/book/create")
      .send(sampleBook)
      .set("Authorization", "Bearer abcdefg");

    expect(response.statusCode).toBe(200);
  });
});

describe("update book", () => {
  beforeAll(() => (jwt.verify = jest.fn().mockReturnValue({ role: "ADMIN" })));
  afterAll(() => jest.resetAllMocks());

  it("should not update book because bookId not inputted", async () => {
    const response = await request(app)
      .patch("/book/update")
      .set("Authorization", "Bearer abcdefg");

    expect(response.statusCode).toBe(400);
  });

  it("should not update book because book not found", async () => {
    prisma.book.findFirst = jest.fn().mockResolvedValueOnce(null);

    const response = await request(app)
      .patch("/book/update")
      .send({ bookId: 2 })
      .set("Authorization", "Bearer abcdefg");

    expect(response.statusCode).toBe(404);
  });

  it("should not update book because book not found", async () => {
    prisma.book.findFirst = jest.fn().mockResolvedValueOnce(null);

    const response = await request(app)
      .patch("/book/update")
      .send({ bookId: 2 })
      .set("Authorization", "Bearer abcdefg");

    expect(response.statusCode).toBe(404);
  });

  it("should not update book because title is exist in database", async () => {
    prisma.book.findFirst = jest
      .fn()
      .mockResolvedValueOnce({ bookId: 1 })
      .mockResolvedValueOnce({ judul: sampleBook.judul });

    const response = await request(app)
      .patch("/book/update")
      .send({ bookId: 1, judul: sampleBook.judul })
      .set("Authorization", "Bearer abcdefg");

    expect(response.statusCode).toBe(403);
  });

  it("should update book", async () => {
    prisma.book.findFirst = jest
      .fn()
      .mockResolvedValueOnce({ bookId: 1 })
      .mockResolvedValueOnce(null);

    prisma.book.update = jest.fn().mockResolvedValueOnce({});

    const response = await request(app)
      .patch("/book/update")
      .send({ bookId: 1, judul: sampleBook.judul })
      .set("Authorization", "Bearer abcdefg");

    expect(response.statusCode).toBe(201);
  });
});

describe("delete book", () => {
  beforeAll(() => (jwt.verify = jest.fn().mockReturnValue({ role: "ADMIN" })));
  afterAll(() => jest.resetAllMocks());

  it("should not delete book because book not found in database", async () => {
    prisma.book.findFirst = jest.fn().mockResolvedValueOnce(null);
    const response = await request(app)
      .delete("/book/delete/1")
      .set("Authorization", "Bearer abcdefg");

    expect(response.statusCode).toBe(404);
  });

  it("should delete book", async () => {
    prisma.book.findFirst = jest.fn().mockResolvedValueOnce({ bookId: 1 });
    prisma.book.delete = jest.fn().mockResolvedValueOnce({});
    const response = await request(app)
      .delete("/book/delete/1")
      .set("Authorization", "Bearer abcdefg");

    expect(response.statusCode).toBe(200);
  });
});

describe("borrower lists", () => {
  beforeAll(() => (jwt.verify = jest.fn().mockReturnValue({ role: "ADMIN" })));
  afterAll(() => jest.resetAllMocks());

  it("should throw err if data not exist", async () => {
    prisma.loan.findMany = jest.fn().mockResolvedValueOnce(null);

    const response = await request(app)
      .get("/book/list")
      .set("Authorization", "Bearer abcdefg");

    expect(response.statusCode).toBe(404);
    cache.flushAll();
  });

  it("should return data if data exist", async () => {
    prisma.loan.findMany = jest.fn().mockResolvedValueOnce({});

    const response = await request(app)
      .get("/book/list")
      .set("Authorization", "Bearer abcdefg");

    expect(response.statusCode).toBe(200);
    cache.flushAll();
  });

  it("should return error if data not exist when searched with name", async () => {
    prisma.loan.findMany = jest.fn().mockResolvedValueOnce(null);

    const response = await request(app)
      .get("/book/list?name=wongso")
      .set("Authorization", "Bearer abcdefg");

    expect(response.statusCode).toBe(404);
    cache.flushAll();
  });

  it("should return data if data exist when searched with name", async () => {
    prisma.loan.findMany = jest.fn().mockResolvedValueOnce({});

    const response = await request(app)
      .get("/book/list?name=wongso")
      .set("Authorization", "Bearer abcdefg");

    expect(response.statusCode).toBe(200);
    cache.flushAll();
  });
});

describe("borrowing book", () => {
  beforeAll(() => (jwt.verify = jest.fn().mockReturnValue({ role: "ADMIN" })));
  afterAll(() => jest.resetAllMocks());

  const invalidTypes = [
    {
      field: "lamaHari",
      value: "abc",
    },
    {
      field: "bookId",
      value: "",
    },
    {
      field: "username",
      value: "",
    },
    {
      field: "bookCode",
      value: "",
    },
  ];
  invalidTypes.forEach(({ field, value }) => {
    it(`should throw error if ${field} with value: ${value} invalid`, async () => {
      const response = await request(app)
        .post("/book/borrow")
        .send({
          username: field === "username" ? value : "username",
          lamaHari: field === "lamaHari" ? value : "lamaHari",
          bookId: field === "bookId" ? value : "bookId",
          bookCode: field === "bookCode" ? value : "bookCode",
        })
        .set("Authorization", "Bearer abcdefg");

      expect(response.statusCode).toBe(400);
    });
  });

  const data = {
    lamaHari: "3",
    bookId: 1,
    username: "testacc",
    bookCode: "123456",
  };

  it("should throw error if bookId not found", async () => {
    prisma.book.findFirst = jest.fn().mockResolvedValueOnce(null);

    const response = await request(app)
      .post("/book/borrow")
      .send(data)
      .set("Authorization", "Bearer abcdefg");

    expect(response.statusCode).toBe(404);
  });

  it("should throw error if stock is unavailable", async () => {
    prisma.book.findFirst = jest.fn().mockResolvedValueOnce({ stock: 0 });

    const response = await request(app)
      .post("/book/borrow")
      .send(data)
      .set("Authorization", "Bearer abcdefg");

    expect(response.statusCode).toBe(404);
  });

  it("should throw error if username is unavailable", async () => {
    prisma.book.findFirst = jest.fn().mockResolvedValueOnce({ stock: 1 });
    prisma.acc.findFirst = jest.fn().mockResolvedValueOnce(null);

    const response = await request(app)
      .post("/book/borrow")
      .send(data)
      .set("Authorization", "Bearer abcdefg");

    expect(response.statusCode).toBe(404);
  });

  it("should throw error if username borrowing a same book", async () => {
    prisma.book.findFirst = jest.fn().mockResolvedValueOnce({ stock: 1 });
    prisma.acc.findFirst = jest.fn().mockResolvedValueOnce({});
    prisma.loan.findFirst = jest
      .fn()
      .mockResolvedValueOnce({ acc: { name: "test acc" } });

    const response = await request(app)
      .post("/book/borrow")
      .send(data)
      .set("Authorization", "Bearer abcdefg");

    expect(response.statusCode).toBe(403);
  });

  it("should throw error if user not return lost book", async () => {
    prisma.book.findFirst = jest.fn().mockResolvedValueOnce({ stock: 1 });
    prisma.acc.findFirst = jest.fn().mockResolvedValueOnce({});
    prisma.loan.findFirst = jest
      .fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        status: "HILANG",
        book: { bookId: 123, judul: "abc" },
        acc: { name: "abc" },
      });

    const response = await request(app)
      .post("/book/borrow")
      .send(data)
      .set("Authorization", "Bearer abcdefg");

    expect(response.statusCode).toBe(403);
  });

  it("should throw error if user not pay fine", async () => {
    prisma.book.findFirst = jest.fn().mockResolvedValueOnce({ stock: 1 });
    prisma.acc.findFirst = jest.fn().mockResolvedValueOnce({});
    prisma.loan.findFirst = jest
      .fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        denda: 1,
        book: { bookId: 123, judul: "abc" },
        acc: { name: "abc" },
      });

    const response = await request(app)
      .post("/book/borrow")
      .send(data)
      .set("Authorization", "Bearer abcdefg");

    expect(response.statusCode).toBe(403);
  });

  it("should borrow book", async () => {
    prisma.book.findFirst = jest.fn().mockResolvedValueOnce({ stock: 1 });
    prisma.acc.findFirst = jest.fn().mockResolvedValueOnce({});
    prisma.loan.findFirst = jest
      .fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        denda: 0,
        book: { bookId: 123, judul: "abc" },
        acc: { name: "abc" },
      });
    prisma.acc.findUnique = jest.fn().mockResolvedValueOnce({ bookId: 123 });
    prisma.book.update = jest.fn().mockResolvedValueOnce({});
    prisma.loan.create = jest.fn().mockResolvedValueOnce({});

    const response = await request(app)
      .post("/book/borrow")
      .send(data)
      .set("Authorization", "Bearer abcdefg");

    expect(response.statusCode).toBe(200);
  });
});

describe("returning book", () => {
  beforeAll(() => (jwt.verify = jest.fn().mockReturnValue({ role: "ADMIN" })));
  afterAll(() => jest.resetAllMocks());

  const invalidInput = [
    {
      field: "bookCode",
      value: "",
    },
    {
      field: "username",
      value: "",
    },
  ];

  invalidInput.forEach(({ field, value }) => {
    it(`should throw error if ${field} is not valid`, async () => {
      const response = await request(app)
        .patch("/book/return")
        .send({
          bookCode: field === "bookCode" ? value : "123456",
          username: field === "username" ? value : "testacc",
        })
        .set("Authorization", "Bearer abcdefg");

      expect(response.statusCode).toBe(400);
    });
  });

  it("should throw error if borrowed book is not found", async () => {
    prisma.loan.findFirst = jest.fn().mockResolvedValueOnce(null);

    const response = await request(app)
      .patch("/book/return")
      .set("Authorization", "Bearer abcdefg")
      .send({ bookCode: "123456", username: "testacc" });

    expect(response.statusCode).toBe(404);
  });

  it("should throw error if borrowed book is not found", async () => {
    prisma.loan.findFirst = jest.fn().mockResolvedValueOnce(null);

    const response = await request(app)
      .patch("/book/return")
      .set("Authorization", "Bearer abcdefg")
      .send({ bookCode: "123456", username: "testacc" });

    expect(response.statusCode).toBe(404);
  });

  it("should return fine if borrowed book if book not returned in time", async () => {
    prisma.loan.findFirst = jest.fn().mockResolvedValueOnce({
      batasPengembalian: new Date(Date.now() - 1000 * 60 * 60),
    });

    prisma.book.update = jest.fn().mockResolvedValueOnce({});

    prisma.loan.update = jest.fn().mockResolvedValueOnce({});

    const response = await request(app)
      .patch("/book/return")
      .set("Authorization", "Bearer abcdefg")
      .send({ bookCode: "123456", username: "testacc" });

    expect(response.statusCode).toBe(200);
    expect(response.body.denda).toBeGreaterThan(0);
  });

  it("should return ok", async () => {
    prisma.loan.findFirst = jest.fn().mockResolvedValueOnce({
      batasPengembalian: new Date(Date.now() + 1000 * 60 * 60),
    });

    prisma.book.update = jest.fn().mockResolvedValueOnce({});

    prisma.loan.update = jest.fn().mockResolvedValueOnce({});

    const response = await request(app)
      .patch("/book/return")
      .set("Authorization", "Bearer abcdefg")
      .send({ bookCode: "123456", username: "testacc" });

    expect(response.statusCode).toBe(200);
    expect(response.body.denda).toBe(0);
  });
});

describe("report lost book", () => {
  beforeAll(() => (jwt.verify = jest.fn().mockReturnValue({ role: "ADMIN" })));
  afterAll(() => jest.resetAllMocks());

  it("should not find loaned book", async () => {
    prisma.loan.findFirst = jest.fn().mockResolvedValueOnce(null);

    const response = await request(app)
      .patch("/book/lost")
      .set("Authorization", "Bearer abcdefg")
      .send({ bookCode: "123456", username: "testacc" });

    expect(response.statusCode).toBe(404);
  });

  it("should report lost book", async () => {
    prisma.loan.findFirst = jest.fn().mockResolvedValueOnce({ bookId: 1 });

    const response = await request(app)
      .patch("/book/lost")
      .set("Authorization", "Bearer abcdefg")
      .send({ bookCode: "123456", username: "testacc" });

    expect(response.statusCode).toBe(200);
  });
});

describe("it should pay fine", () => {
  beforeAll(() => (jwt.verify = jest.fn().mockReturnValue({ role: "ADMIN" })));
  afterAll(() => jest.resetAllMocks());

  it("should throw error because loan not found", async () => {
    prisma.loan.findFirst = jest.fn().mockResolvedValueOnce(null);
    const response = await request(app)
      .patch("/book/lost")
      .set("Authorization", "Bearer abcdefg")
      .send({ username: "testacc" });

    expect(response.statusCode).toBe(404);
  });

  it("should return lost book", async () => {
    prisma.loan.findFirst = jest
      .fn()
      .mockResolvedValueOnce({ denda: 0, status: "HILANG" });
    prisma.loan.update = jest.fn().mockResolvedValueOnce({});
    const response = await request(app)
      .patch("/book/lost")
      .set("Authorization", "Bearer abcdefg")
      .send({ username: "testacc" });

    expect(response.statusCode).toBe(200);
  });

  it("should pay late fine", async () => {
    prisma.loan.findFirst = jest
      .fn()
      .mockResolvedValueOnce({ denda: 2000, status: "DIKEMBALIKAN" });
    prisma.loan.update = jest.fn().mockResolvedValueOnce({});
    const response = await request(app)
      .patch("/book/lost")
      .set("Authorization", "Bearer abcdefg")
      .send({ username: "testacc" });

    expect(response.statusCode).toBe(200);
  });
});
