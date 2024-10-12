import request, { Response } from "supertest";
import app from "../src/app";
import prisma from "../src/utils/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

jest.mock("../src/utils/sendEmail");
jest.mock("../src/utils/logger");
const otp = 2323;
const email = "test@email.com";
const expiresAt = new Date(Date.now() + 1000 * 60 * 5);

describe("Register with invalid values", () => {
  const invalidUsernames = [
    "",
    "u",
    "UserName",
    "user!name",
    "user@name",
    "usernameiniterlalupanjanguntukdivalidasi",
    ".username",
    "username.",
    "user..name",
    "user name",
  ];

  const invalidNames = [
    "a",
    "namainiterlalupanjangsehinggatidakbisadivalidasiolehserver",
  ];

  const invalidEmails = [
    "username.com",
    "username@.com",
    "username@com.",
    "username@",
    "username@domain",
    "user@name@domain.com",
    "username!@domain.com",
    "username#domain.com",
    "user..name@domain.com",
    "user.name@domain..com",
    ".username@domain.com",
    "username.@domain.com",
    "verylongemailusername@averylongdomainthatisunlikelytoexistbutinvalid.com",
    "user name@domain.com",
    "username@do main.com",
  ];

  const invalidAbsentNum = ["0", "41"];

  const invalidPasswords = [
    "12345",
    "abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz",
  ];

  const invalidAngkatans = ["9", "13"];

  const invalidKelas = ["0", "4"];

  const invalidInputs = [
    ...invalidUsernames.map((value) => ({
      field: "username",
      value,
    })),
    ...invalidPasswords.map((value) => ({
      field: "password",
      value,
    })),
    ...invalidNames.map((value) => ({
      field: "name",
      value,
    })),
    ...invalidAbsentNum.map((value) => ({
      field: "absentnum",
      value,
    })),
    ...invalidAngkatans.map((value) => ({
      field: "angkatan",
      value,
    })),
    ...invalidKelas.map((value) => ({
      field: "kelas",
      value,
    })),
    ...invalidEmails.map((value) => ({
      field: "email",
      value,
    })),
  ];
  invalidInputs.forEach(({ field, value }) => {
    it(`should reject register if ${field} with value ${value} is invalid`, async () => {
      const response = await request(app)
        .post("/auth/register")
        .send({
          username: field === "username" ? value : "validUsername",
          password: field === "password" ? value : "validPassword123",
          name: field === "name" ? value : "Valid Name",
          absentnum: field === "absentnum" ? value : "30",
          angkatan: field === "angkatan" ? value : "11",
          jurusan: field === "jurusan" ? value : "KUL",
          kelas: field === "kelas" ? value : "2",
        });

      expect(response.status).toBe(400);
    });
  });
});

describe("Register Account with POST /auth/register and receive OTP with POST /auth/otp", () => {
  bcrypt.hashSync = jest.fn().mockReturnValue("abcdefg");
  it("should accept register if data is valid", async () => {
    const accountData = {
      id: "202471001",
      username: "testacc",
      email: null,
    };

    const userData = {
      accId: accountData.id,
      angkatan: 10,
      kelas: 1,
      jurusan: "KUL",
      absentnum: 1,
    };

    prisma.acc.findFirst = jest.fn().mockResolvedValueOnce(null);
    prisma.acc.create = jest.fn().mockResolvedValueOnce(accountData);
    prisma.user.create = jest.fn().mockResolvedValueOnce({});

    const response = await request(app).post("/auth/register").send({
      username: accountData.username, // min. 3 character length
      password: "testacc", // min. 6 character length
      name: accountData.username, // min. 2 character length
      absentnum: "1", // range 1-40
      angkatan: "10", // range 10-12
      jurusan: userData.jurusan, // only accept ["AKL", "PN", "MPLB", "TKJ", "BSN", "KUL", "ULP"]
      kelas: "1", // max. 3
    });

    // Assertions
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("user", accountData);

    expect(prisma.acc.create).toHaveBeenCalledWith({
      data: {
        id: accountData.id,
        username: accountData.username,
        name: accountData.username,
        password: expect.any(String),
        email: undefined,
      },
    });

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: userData,
    });
  });

  it("should not request otp for the second time after 5 min", async () => {
    prisma.oTP.findFirst = jest.fn().mockResolvedValueOnce(null);
    prisma.oTP.create = jest.fn().mockResolvedValueOnce({
      email,
      expiresAt,
      otp,
    });
    prisma.oTP.deleteMany = jest.fn().mockResolvedValueOnce(null);

    const otpResponse = await request(app)
      .post("/auth/otp")
      .send({ email: "test@email.com" });

    expect(otpResponse.statusCode).toBe(200);

    prisma.oTP.findFirst = jest.fn().mockResolvedValueOnce({
      id: 1,
      email,
      otp,
      expiresAt,
    });

    const secondOtpResponse = await request(app)
      .post("/auth/otp")
      .send({ email: "test@email.com" });

    expect(secondOtpResponse.statusCode).toBe(429);
  });

  it("should not register when email and otp is not valid", async () => {
    prisma.oTP.deleteMany = jest.fn().mockResolvedValueOnce(null);
    prisma.oTP.findFirst = jest.fn().mockResolvedValueOnce(null);
    prisma.oTP.create = jest.fn().mockResolvedValueOnce({
      email,
      expiresAt,
      otp,
    });

    const otpResponse = await request(app)
      .post("/auth/otp")
      .send({ email: "test@email.com" });

    expect(otpResponse.statusCode).toBe(200);
    expect(otpResponse.body).toEqual({
      message: "OTP code sent successfully!",
    });

    prisma.oTP.findFirst = jest.fn().mockResolvedValueOnce({
      id: 1,
      email,
      otp,
      expiresAt,
    });

    prisma.oTP.delete = jest.fn().mockResolvedValueOnce({
      id: 1,
      email,
      otp,
      expiresAt,
    });

    prisma.acc.create = jest.fn().mockResolvedValueOnce({
      id: "202471001",
      username: "testacc",
      email,
    });

    prisma.user.create = jest.fn().mockResolvedValueOnce({});

    const response = await request(app).post("/auth/register").send({
      username: "testacc", // min. 3 character length
      password: "testacc", // min. 6 character length
      name: "testacc", // min. 2 character length
      email,
      otp: "6969",
      absentnum: "1", // range 1-40
      angkatan: "10", // range 10-12
      jurusan: "KUL", // only accept ["AKL", "PN", "MPLB", "TKJ", "BSN", "KUL", "ULP"]
      kelas: "1", // max. 3
    });

    expect(response.status).toBe(400);
  });

  it("should not register when otp is expired", async () => {
    prisma.oTP.findFirst = jest.fn().mockResolvedValueOnce({
      id: 1,
      email,
      otp,
      expiresAt: new Date(Date.now() - 1000 * 60 * 5),
    });

    prisma.oTP.delete = jest.fn().mockResolvedValueOnce({
      id: 1,
      email,
      otp,
      expiresAt: new Date(Date.now() - 1000 * 60 * 5),
    });

    prisma.acc.create = jest.fn().mockResolvedValueOnce({
      id: "202471001",
      username: "testacc",
      email,
    });

    prisma.user.create = jest.fn().mockResolvedValueOnce({});

    const response = await request(app).post("/auth/register").send({
      username: "testacc", // min. 3 character length
      password: "testacc", // min. 6 character length
      name: "testacc", // min. 2 character length
      email,
      otp: "2323",
      absentnum: "1", // range 1-40
      angkatan: "10", // range 10-12
      jurusan: "KUL", // only accept ["AKL", "PN", "MPLB", "TKJ", "BSN", "KUL", "ULP"]
      kelas: "1", // max. 3
    });

    expect(response.status).toBe(403);
  });

  it("should register when email and otp is valid", async () => {
    prisma.oTP.deleteMany = jest.fn().mockResolvedValueOnce(null);
    prisma.oTP.findFirst = jest.fn().mockResolvedValueOnce(null);
    prisma.oTP.create = jest.fn().mockResolvedValueOnce({
      email,
      expiresAt,
      otp,
    });

    const otpResponse = await request(app)
      .post("/auth/otp")
      .send({ email: "test@email.com" });

    expect(otpResponse.statusCode).toBe(200);
    expect(otpResponse.body).toEqual({
      message: "OTP code sent successfully!",
    });

    prisma.oTP.findFirst = jest.fn().mockResolvedValueOnce({
      id: 1,
      email,
      otp,
      expiresAt,
    });

    prisma.oTP.delete = jest.fn().mockResolvedValueOnce({
      id: 1,
      email,
      otp,
      expiresAt,
    });

    prisma.acc.create = jest.fn().mockResolvedValueOnce({
      id: "202471001",
      username: "testacc",
      email,
    });

    prisma.user.create = jest.fn().mockResolvedValueOnce({});

    const response = await request(app).post("/auth/register").send({
      username: "testacc", // min. 3 character length
      password: "testacc", // min. 6 character length
      name: "testacc", // min. 2 character length
      email,
      otp,
      absentnum: "1", // range 1-40
      angkatan: "10", // range 10-12
      jurusan: "KUL", // only accept ["AKL", "PN", "MPLB", "TKJ", "BSN", "KUL", "ULP"]
      kelas: "1", // max. 3
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("user", {
      id: "202471001",
      username: "testacc",
      email,
    });
  });
});

describe("Login account with POST /auth/login and refresh token with GET /auth/refresh", () => {
  bcrypt.compareSync = jest.fn().mockReturnValue(false);

  it("should not login to test account because wrong password", async () => {
    const payload = {
      id: "202471001",
      username: "testacc",
      name: "testacc",
      role: "MEMBER",
      email: null,
    };

    prisma.acc.findFirst = jest.fn().mockResolvedValueOnce({
      ...payload,
    });

    bcrypt.compareSync = jest.fn().mockReturnValue(false);

    const response = await request(app).post("/auth/login").send({
      username: "testacc",
      password: "testac",
    });

    expect(response.statusCode).toBe(401);
  });

  it("should login to test account", async () => {
    const payload = {
      id: "202471001",
      username: "testacc",
      name: "testacc",
      role: "MEMBER",
      email: null,
    };

    prisma.acc.findFirst = jest.fn().mockResolvedValueOnce({
      ...payload,
    });

    prisma.token.findFirst = jest.fn().mockResolvedValueOnce(null);
    prisma.token.create = jest.fn().mockResolvedValueOnce({});
    bcrypt.compareSync = jest.fn().mockReturnValueOnce(true);

    jwt.decode = jest
      .fn()
      .mockResolvedValueOnce("abc")
      .mockResolvedValueOnce("def");

    const response = await request(app).post("/auth/login").send({
      username: "testacc",
      password: "testacc",
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("user", payload);
  });

  it("should failed to login again to test account because refreshToken is available", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({
        username: "testacc",
        password: "testacc",
      })
      .set("Cookie", "refreshToken=abc123");

    expect(response.statusCode).toBe(403);
  });

  it("should gain access token", async () => {
    prisma.token.findFirst = jest.fn().mockResolvedValueOnce({
      refreshToken: "abcdef",
      userId: "202471001",
    });
    const payload = {
      id: "202471001",
      username: "testacc",
      name: "testacc",
      role: "MEMBER",
      email: null,
    };

    jwt.verify = jest.fn().mockReturnValueOnce({ id: payload.id });

    prisma.acc.findFirst = jest.fn().mockResolvedValueOnce({
      ...payload,
    });

    const response = await request(app)
      .get("/auth/refresh")
      .set("Cookie", "abc");

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("accessToken");
  });

  it("should gain acc details", async () => {
    jwt.verify = jest.fn().mockReturnValueOnce({});

    const response = await request(app)
      .get("/auth/details")
      .set("Authorization", `Bearer abcdefg`);

    expect(response.statusCode).toBe(200);
  });

  it("should gain user info", async () => {
    prisma.user.findFirst = jest.fn().mockResolvedValueOnce({
      accId: "202471001",
      angkatan: 10,
      jurusan: "KUL",
      kelas: 1,
      absentnum: 1,
      NISN: null,
      NIPD: null,
      Tempat: null,
      TanggalLahir: null,
      user: {
        id: "202471001",
        username: "testacc",
        name: "testacc",
        role: "MEMBER",
        email: null,
      },
    });

    jwt.verify = jest.fn().mockReturnValueOnce({ id: "202471001" });

    const response = await request(app)
      .get("/auth/info")
      .send({
        username: "zackdesu",
      })
      .set("Authorization", `Bearer abcdefg`);

    expect(response.statusCode).toBe(200);
  });

  it("should not update test account because username exist", async () => {
    const payload = {
      id: "202471001",
      username: "testacc",
      name: "testacc",
      role: "MEMBER",
      email: null,
    };

    prisma.acc.findFirst = jest.fn().mockResolvedValueOnce({
      username: "zackdesu",
    });

    prisma.acc.findFirst = jest.fn().mockResolvedValueOnce({
      ...payload,
    });

    prisma.acc.update = jest.fn().mockResolvedValueOnce({
      ...payload,
    });

    prisma.user.update = jest.fn().mockResolvedValueOnce({});

    prisma.token.findFirst = jest.fn().mockResolvedValueOnce({
      refreshToken: "abc",
      id: "202471001",
    });

    jwt.verify = jest.fn().mockReturnValueOnce({ id: "202471001" });
    jwt.decode = jest.fn().mockReturnValue("abc");

    const response = await request(app)
      .patch("/auth/update")
      .send({
        username: "zackdesu",
      })
      .set("Authorization", `Bearer abcdefg`);

    expect(response.statusCode).toBe(409);
  });

  it("should update test account information w/out email", async () => {
    const payload = {
      id: "202471001",
      username: "testacc",
      name: "testacc",
      role: "MEMBER",
      email: null,
    };

    prisma.acc.findFirst = jest
      .fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        ...payload,
      });
    prisma.acc.update = jest.fn().mockResolvedValueOnce({
      ...payload,
    });

    prisma.user.update = jest.fn().mockResolvedValueOnce({});

    prisma.token.findFirst = jest.fn().mockResolvedValueOnce({
      refreshToken: "abc",
      id: "202471001",
    });

    jwt.verify = jest.fn().mockReturnValueOnce({ id: "202471001" });

    const response = await request(app)
      .patch("/auth/update")
      .send({
        username: "zack",
      })
      .set("Authorization", `Bearer abc`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("accessToken");
  });

  it("should not update test account information w/ email because user not send OTP yet", async () => {
    const payload = {
      id: "202471001",
      username: "testacc",
      name: "testacc",
      role: "MEMBER",
      email: "testacc@email.com",
    };

    prisma.acc.findFirst = jest
      .fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        ...payload,
      });

    prisma.oTP.findFirst = jest.fn().mockResolvedValueOnce(null);

    prisma.oTP.delete = jest.fn().mockResolvedValueOnce({});

    jwt.verify = jest.fn().mockReturnValueOnce({ id: "202471001" });

    const response = await request(app)
      .patch("/auth/update")
      .send({
        email: "test123@email.com",
        otp,
      })
      .set("Authorization", `Bearer abc`);

    expect(response.statusCode).toBe(404);
  });

  it("should update test account information w/ email", async () => {
    prisma.oTP.deleteMany = jest.fn().mockResolvedValueOnce(null);
    prisma.oTP.findFirst = jest.fn().mockResolvedValueOnce(null);
    prisma.oTP.create = jest.fn().mockResolvedValueOnce({
      email,
      expiresAt,
      otp,
    });

    const otpResponse = await request(app)
      .post("/auth/otp")
      .send({ email: "test123@email.com" });

    expect(otpResponse.statusCode).toBe(200);
    expect(otpResponse.body).toEqual({
      message: "OTP code sent successfully!",
    });

    const payload = {
      id: "202471001",
      username: "testacc",
      name: "testacc",
      role: "MEMBER",
      email,
    };

    prisma.acc.findFirst = jest
      .fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        ...payload,
      });

    prisma.acc.update = jest.fn().mockResolvedValueOnce({
      ...payload,
    });

    prisma.user.update = jest.fn().mockResolvedValueOnce({});

    prisma.token.findFirst = jest.fn().mockResolvedValueOnce({
      refreshToken: "abc",
      id: "202471001",
    });

    prisma.oTP.findFirst = jest.fn().mockResolvedValueOnce({
      otp,
      expiresAt,
      email: "test123@email.com",
    });

    prisma.oTP.delete = jest.fn().mockResolvedValueOnce({});

    jwt.verify = jest.fn().mockReturnValueOnce({ id: "202471001" });

    const response = await request(app)
      .patch("/auth/update")
      .send({
        email: "test123@email.com",
        otp,
      })
      .set("Authorization", `Bearer abcdefg`);

    expect(response.statusCode).toBe(200);
  });
});

describe("Rate limiting login", () => {
  it("should limiting login test", async () => {
    let response: Response | undefined;
    for (let i = 0; i <= 11; i++) {
      const payload = {
        id: "202471001",
        username: "testacc",
        name: "testacc",
        role: "MEMBER",
        email: null,
      };

      prisma.acc.findFirst = jest.fn().mockResolvedValueOnce({
        ...payload,
      });

      response = await request(app).post("/auth/login").send({
        username: "testacc",
        password: "testac",
      });
    }

    expect(response?.statusCode).toBe(429);
  });
});
