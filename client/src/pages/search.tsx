import BookList from "@/components/bookList";
import SearchBar from "@/components/searchbar";
import { useSearchParams } from "react-router-dom";
import getBooks from "@/__fakeapi__/api";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
const Search = () => {
  const [searchParams] = useSearchParams({ q: "" });
  const searchInput = searchParams.get("q");
  const [bookData, setBookData] = useState<BookDatas[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!searchInput || bookData.length > 0) return;
    setLoading(true);
    void (async () => {
      const data = await getBooks();
      console.log(data);
      setBookData(data);
      setLoading(false);
    })();
  }, [searchInput]);
  return (
    <div>
      <SearchBar value={searchInput ? searchInput : undefined} />
      <p className="mt-5 mb-2">Hasil dari pencarian {searchInput}</p>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] md:grid-cols-4 lg:grid-cols-6 xl:lg:grid-cols-7 2xl:grid-cols-8 gap-2">
        {loading ? (
          <Loader2 className="h-4 mx-auto self-center col-span-full animate-spin" />
        ) : (
          bookData
            .filter((e) =>
              e.tag.some((i) =>
                i.includes(searchInput ? searchInput.toLowerCase() : "")
              )
            )
            .map((e, i) => (
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
    </div>
  );
};

export default Search;
