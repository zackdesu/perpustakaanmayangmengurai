import SearchBar from "@/components/searchbar";

const Main = () => {
  return (
    <div className="w-full">
      <link rel="preconnect" href="/assets/library (1200x200).webp" />
      <link rel="preconnect" href="/assets/library (2400x400).jpg" />

      <picture>
        <source type="image/webp" srcSet="/assets/library (1200x200).webp" />
        <img
          src="/assets/library (2400x400).jpg"
          className="aspect-[3/1] md:aspect-[6/1] w-full object-cover"
          alt="Perpustakaan Mayang Mengurai"
          decoding="async"
          fetchPriority="low"
          loading="lazy"
          width={1200}
          height={200}
        />
      </picture>
      <SearchBar className="-top-6" />
    </div>
  );
};

export default Main;
