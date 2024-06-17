import CardCategory from "@/components/cardCategory";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const Category = () => {
  const categoryData = [
    {
      icons: "books.png",
      desc: "Literatur",
    },
    {
      icons: "chemical.png",
      desc: "Komputer & Program",
    },
    { icons: "memory.png", desc: "Psikologi & Filosofi" },
    {
      icons: "quill.png",
      desc: "Karya Seni & Hiburan",
    },
    {
      icons: "translation.png",
      desc: "Bahasa",
    },
    { icons: "returntothepast.png", desc: "Sejarah" },
    { icons: "math.png", desc: "Matematika & Sains" },
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
