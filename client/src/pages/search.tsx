import BookList from "@/components/bookList";
import SearchBar from "@/components/searchbar";
import { useSearchParams } from "react-router-dom";

const Search = () => {
  const [searchParams] = useSearchParams({ q: "" });
  const searchInput = searchParams.get("q");
  const bookDatas = [
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
  ];
  return (
    <div>
      <SearchBar value={searchInput ? searchInput : undefined} />
      <p className="mt-5 mb-2">Hasil dari pencarian {searchInput}</p>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] md:grid-cols-4 lg:grid-cols-6 xl:lg:grid-cols-7 2xl:grid-cols-8 gap-2">
        {bookDatas
          .filter((e) =>
            e.name
              .toLowerCase()
              .includes(searchInput ? searchInput.toLowerCase() : "")
          )
          .map((e, i) => (
            <BookList
              list
              image={e.image}
              name={e.name}
              className="mb-2 self-center"
              key={i}
            />
          ))}
      </div>
    </div>
  );
};

export default Search;
