import SearchBar from "@/components/searchbar";

const Main = () => {
  return (
    <div className="w-full">
      <img
        src="/library.jpg"
        className="aspect-[3/1] md:aspect-[6/1] w-full object-cover"
      />
      <SearchBar className="-top-6" />
    </div>
  );
};

export default Main;
