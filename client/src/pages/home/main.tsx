import SearchBar from "@/components/searchbar";

const Main = () => {
  return (
    <div className="w-full">
      <img
        src="/assets/library (1200x200).jpg"
        className="aspect-[3/1] md:hidden w-full object-cover"
      />
      <img
        src="/assets/library (2400x400).jpg"
        className="max-md:hidden aspect-[6/1] w-full object-cover"
      />
      <SearchBar className="-top-6" />
    </div>
  );
};

export default Main;
