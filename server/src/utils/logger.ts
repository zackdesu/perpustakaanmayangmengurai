import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const isDev = process.env.NODE_ENV === "development";

const logger = winston.createLogger({
  level: isDev ? "debug" : "info",
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.json()),
    }),
    new winston.transports.File({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),
        winston.format.json()
      ),
      filename: "./logs/error.log",
      level: "error",
      handleExceptions: true,
      handleRejections: true,
    }),
    isDev
      ? new winston.transports.File({
          filename: "./logs/info.log",
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            winston.format.json()
          ),
        })
      : new DailyRotateFile({
          filename: "./logs/info-%DATE%.log",
          maxSize: "1m",
          maxFiles: "20d",
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            winston.format.json()
          ),
        }),
  ],
});

export default logger;
