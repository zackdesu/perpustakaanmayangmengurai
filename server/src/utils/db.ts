import { PrismaClient } from "@prisma/client";
import logger from "./logger";

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: [
      {
        emit: "event",
        level: "query",
      },
      {
        emit: "event",
        level: "error",
      },
      {
        emit: "event",
        level: "info",
      },
      {
        emit: "event",
        level: "warn",
      },
    ],
  });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

prisma.$on("error", (e) => logger.error(e));
prisma.$on("warn", (e) => logger.warn(e));
prisma.$on("info", (e) => logger.info(e));
prisma.$on("query", (e) => logger.info(e));

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
