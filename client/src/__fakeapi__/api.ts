import bookDatas from "./data";

const getBooks = (): Promise<BookDatas[]> =>
  new Promise((res) => setTimeout(() => res(bookDatas), 100));

export default getBooks;
