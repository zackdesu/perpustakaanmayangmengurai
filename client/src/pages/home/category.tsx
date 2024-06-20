import CardCategory from "@/components/cardCategory";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const Category = () => {
  const categoryData = [
    {
      icons: "/assets/category/books.png",
      desc: "Literatur",
    },
    {
      icons: "/assets/category/chemical.png",
      desc: "Komputer & Program",
    },
    { icons: "/assets/category/memory.png", desc: "Psikologi & Filosofi" },
    {
      icons: "/assets/category/quill.png",
      desc: "Karya Seni & Hiburan",
    },
    {
      icons: "/assets/category/translation.png",
      desc: "Bahasa",
    },
    { icons: "/assets/category/returntothepast.png", desc: "Sejarah" },
    { icons: "/assets/category/math.png", desc: "Matematika & Sains" },
  ];
  return (
    <section>
      <h3>Kategori buku</h3>
      <p className="text-zinc-500">Pilih kategori buku kesukaanmu</p>
      <ScrollArea className="mt-5 h-full">
        <section className="flex h-full">
          {categoryData.map((e, i) => (
            <CardCategory
              icons={e.icons}
              desc={e.desc}
              className="mx-2 md:mx-5"
              key={i}
            />
          ))}
        </section>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
};

export default Category;
