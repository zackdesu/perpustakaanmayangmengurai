import { ScrollArea } from "@/components/ui/scroll-area";
import { Navigate, useParams } from "react-router-dom";
import getBooks from "@/__fakeapi__/api";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const BookInformation = () => {
  const { bookId } = useParams();
  const [bookData, setBookData] = useState<BookDatas[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    void (async () => {
      const data = await getBooks();
      setBookData(data);
      setLoading(false);
    })();
  }, []);
  const book = bookData.find((e) => e.id === parseInt(bookId || "0"));
  return (
    <div className="grid md:grid-cols-[1fr,_2fr] gap-8">
      {loading ? (
        <>
          <Skeleton className="p-8 md:p-16 bg-gray-100 rounded-sm justify-self-center md:justify-self-end w-[290px] h-[384px] md:h-64 md:w-48" />
          <div>
            <Skeleton className="font-bold h-11 w-1/2 mb-2" />
            <Skeleton className="h-5 w-1/4 mb-2" />
            <Skeleton className="max-md:hidden border bg-gray-50 rounded px-2 h-32 w-full my-2" />
            <Skeleton className="md:hidden my-2 h-20 w-full" />
            <Skeleton className="h-6 w-1/4 mb-2" />
            <Skeleton className="h-6 w-48 mb-2 mt-20" />
            <div className="grid grid-cols-2">
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-6 w-48 mb-2" />
            </div>
          </div>
        </>
      ) : !book ? (
        <Navigate to="/search" replace />
      ) : (
        <>
          <div className="p-8 bg-gray-100 rounded-sm justify-self-center md:justify-self-end">
            <img
              src={book.image}
              className="rounded-sm border-white border max-md:max-h-[320px]"
              alt={book.name}
              decoding="async"
              fetchPriority="high"
              width={"220px"}
              height={"320px"}
              sizes="(min-width: 768px) 480px, 87.5vw"
            />
          </div>
          <div>
            <h2 className="font-bold">{book.name}</h2>─&nbsp;
            <a
              href={`https://www.google.com/search?q=${book.author
                .split(" ")
                .join("+")}%2C+penulis+buku+${book.name.split(" ").join("+")}`}
              target="_blank"
              className="text-blue-500 underline"
            >
              {book.author}
            </a>
            <ScrollArea
              className={`${
                book.desc ? "border bg-gray-50 rounded px-2" : "text-gray-500"
              } my-2 max-md:hidden`}
            >
              <p className="md:max-h-[290px]">
                {book.desc || "Deskripsi tidak tersedia"}
              </p>
            </ScrollArea>
            <p className="md:hidden my-2">
              {book.desc || "Deskripsi tidak tersedia"}
            </p>
            <p>
              Ketersediaan Buku:{" "}
              <span
                className={
                  book.stock < 6
                    ? "text-red-500"
                    : book.stock < 11
                    ? "text-yellow-500"
                    : "text-green-500"
                }
              >
                {book.stock}
              </span>
            </p>
            <h5 className="mt-10">Informasi Detail</h5>
            <div className="grid grid-cols-2">
              <p>Tipe</p>
              <p>: {book.type || "-"}</p>
              <p>Tahun Terbit</p>
              <p>: {book.year || "-"}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BookInformation;
