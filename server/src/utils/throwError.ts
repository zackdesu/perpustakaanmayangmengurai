export const throwError = (statusCode: number, message: string) => {
  throw { statusCode, message };
};
