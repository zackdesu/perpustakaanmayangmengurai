import NodeCache from "node-cache";
import { IRequest } from "../@types/express";
import { NextFunction, Response } from "express";
import logger from "./logger";

export const cache = new NodeCache();

type CachedResponse =
  | {
      data: unknown;
      isError: boolean;
      status?: number;
    }
  | undefined;

const setCache =
  (duration: number) =>
  (req: IRequest<unknown>, res: Response, next: NextFunction) => {
    if (req.method !== "GET") {
      console.error("Can't cache non-GET methods!");
      return next();
    }

    const key = req.originalUrl;
    const cachedResponse: CachedResponse = cache.get(key);

    if (cachedResponse) {
      logger.debug("Cache HIT from " + key);
      logger.debug(cachedResponse);
      return res
        .status(
          cachedResponse.isError
            ? cachedResponse.status
              ? cachedResponse.status
              : 500
            : 200
        )
        .json(cachedResponse.data);
    }

    const originalJSON = res.json.bind(res);
    logger.debug("Cache MISS from " + key);
    res.json = (body) => {
      originalJSON(body);
      if (res.statusCode.toString().startsWith("2"))
        cache.set(key, { data: body, isError: false }, duration);
      else
        cache.set(
          key,
          { data: body, isError: true, status: res.statusCode },
          duration
        );
      return res;
    };
    next();
  };

export default setCache;
