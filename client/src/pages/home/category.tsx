import categoryData from "@/categoryData";
import CardCategory from "@/components/cardCategory";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const Category = () => {
  return (
    <section>
      <h3>Kategori buku</h3>
      <p className="text-zinc-500">Pilih kategori buku kesukaanmu</p>
      <ScrollArea className="mt-5 h-full pb-3">
        <section className="flex h-full">
          {categoryData.map((e, i) => (
            <CardCategory
              icons={e.icons}
              desc={e.desc}
              className="mx-2 md:mx-5"
              key={i}
              link={`/types/${e.desc.split(" ").join("-")}`}
            />
          ))}
        </section>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
};

export default Category;
