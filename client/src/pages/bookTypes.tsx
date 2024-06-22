import getBooks from "@/__fakeapi__/api";
import categoryData from "@/categoryData";
import BookList from "@/components/bookList";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { IoWarningOutline } from "react-icons/io5";
import { useParams } from "react-router-dom";

const BookTypes = () => {
  const { bookTypes } = useParams();
  const category = categoryData.find(
    (e) => e.desc.split(" ").join("-") === bookTypes
  );
  if (!category || !bookTypes) return;
  const title = bookTypes.split("-").join(" ") || "";

  const [bookData, setBookData] = useState<BookDatas[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    void (async () => {
      const data = await getBooks();
      setBookData(data);
      setLoading(false);
    })();
  }, []);
  const filteredBooks = bookData.filter((e) => e.type === title);
  return (
    <section>
      <h2 className="font-semibold">{title}</h2>
      <hr className="mx-3 mt-8 mb-4" />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] md:grid-cols-4 lg:grid-cols-6 xl:lg:grid-cols-7 2xl:grid-cols-8 gap-2">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Skeleton className="aspect-[9/15] max-w-[300px]" key={i} />
          ))
        ) : filteredBooks.length === 0 ? (
          <div className="col-span-full flex items-center mx-auto">
            <IoWarningOutline className="mr-3 text-red-500" />
            Buku belum dimasukkan, harap menunggu!
          </div>
        ) : (
          filteredBooks.map((e, i) => (
            <BookList
              list
              key={i}
              image={e.image}
              name={e.name}
              link={`/book/${e.id}`}
              className="mb-2 self-center"
            />
          ))
        )}
      </div>
    </section>
  );
};

export default BookTypes;
