import bookDatas from "./data";

const getBooks = (): Promise<BookDatas[]> =>
  new Promise((res) => setTimeout(() => res(bookDatas), 2000));

export default getBooks;
