import rateLimit from "express-rate-limit";
import logger from "./logger";

const limiter = (
  limit: number = 100,
  message: string = "Kamu melakukan request terlalu banyak! Silahkan coba lagi nanti."
) =>
  rateLimit({
    windowMs: 1000 * 60 * 15,
    limit,
    handler: (req, res) => {
      res.status(429).json({
        message,
      });
      logger.error("Rate limit exceeded:", req.ip);
    },
  });

export default limiter;
