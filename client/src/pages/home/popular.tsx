import getBooks from "@/__fakeapi__/api";
import BookList from "@/components/bookList";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

const Popular = () => {
  const [bookData, setBookData] = useState<BookDatas[] | never>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const data = await getBooks();
      setBookData(data);
      setLoading(false);
    })();
  }, []);

  return (
    <section>
      <h3 className="mt-10">Buku populer</h3>
      <p className="text-zinc-500">Buku yang paling sering dibaca</p>
      <ScrollArea className="mt-5 h-full pb-3">
        <section className="flex h-full">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="w-[96px] h-[158px] md:w-[146px] md:h-[234px] mx-2 mb-5"
                />
              ))
            : bookData.map((e, i) => (
                <BookList
                  image={e.image}
                  name={e.name}
                  className="mx-2"
                  key={i}
                  link={`/book/${e.id}`}
                />
              ))}
        </section>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
};

export default Popular;
