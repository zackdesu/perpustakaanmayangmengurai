import BookList from "@/components/bookList";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

type BookDatas = {
  image: string;
  name: string;
};

const Popular = () => {
  const [bookDatas, setBookDatas] = useState<BookDatas[] | never>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bookData = [
      {
        image: "bumi.jpg",
        name: "Bumi",
      },
      {
        image: "bulan.jpg",
        name: "Bulan",
      },
      { image: "bintang.jpg", name: "Bintang" },
      { image: "Gagal-Menjadi-Manusia.jpg", name: "Gagal Menjadi Manusia" },
      {
        image: "bumi.jpg",
        name: "Bumi",
      },
      {
        image: "bulan.jpg",
        name: "Bulan",
      },
      { image: "bintang.jpg", name: "Bintang" },
      { image: "Gagal-Menjadi-Manusia.jpg", name: "Gagal Menjadi Manusia" },
      {
        image: "bumi.jpg",
        name: "Bumi",
      },
      {
        image: "bulan.jpg",
        name: "Bulan",
      },
      { image: "bintang.jpg", name: "Bintang" },
    ];

    const timer = setTimeout(() => {
      setBookDatas(bookData);
      setLoading(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section>
      <h3 className="mt-10">Buku populer</h3>
      <p className="text-zinc-500">Buku yang paling sering dibaca</p>
      <ScrollArea className="mt-5 h-full">
        <section className="flex h-full">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="w-[96px] h-[158px] md:w-[146px] md:h-[234px] mx-2 mb-5"
                />
              ))
            : bookDatas.map((e, i) => (
                <BookList
                  image={e.image}
                  name={e.name}
                  className="mx-2"
                  key={i}
                />
              ))}
        </section>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
};

export default Popular;
