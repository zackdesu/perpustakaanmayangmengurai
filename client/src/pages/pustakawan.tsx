import CardPustakawan from "@/components/CardPustakawan";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

type Contact = {
  nama: string;
  title: string;
  email: string;
};

const Pustakawan = () => {
  const [contacts, setContacts] = useState<Contact[] | never>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setContacts([
        {
          nama: "Wongso Wijaya",
          title: "Pustakawan",
          email: "zarchxxx@gmail.com",
        },
        {
          nama: "Wongso Wijaya",
          title: "Pustakawan",
          email: "zarchxxx@gmail.com",
        },
        {
          nama: "Wongso Wijaya",
          title: "Pustakawan",
          email: "zarchxxx@gmail.com",
        },
        {
          nama: "Wongso Wijaya",
          title: "Pustakawan",
          email: "zarchxxx@gmail.com",
        },
        {
          nama: "Wongso Wijaya",
          title: "Pustakawan",
          email: "zarchxxx@gmail.com",
        },
      ]);
      setLoading(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <h2 className="font-semibold">Profil Pustakawan</h2>
      <hr className="mx-3 my-8" />
      <section className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] min-[388px]:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 min-[1375px]:grid-cols-5 gap-8">
        {loading
          ? Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="aspect-[9/10]" />
            ))
          : contacts.map((e, index) => (
              <CardPustakawan
                key={index}
                className=""
                nama={e.nama}
                title={e.title}
                email={e.email}
              />
            ))}
      </section>
    </>
  );
};

export default Pustakawan;
