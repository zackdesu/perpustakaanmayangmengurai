import { ZodError } from "zod";

class HttpError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string | ZodError) {
    const errorMessage =
      message instanceof ZodError
        ? message.errors.map((err) => err.message).join(", ") // Menggabungkan pesan kesalahan Zod
        : message;

    super(errorMessage);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
}

export default HttpError;
