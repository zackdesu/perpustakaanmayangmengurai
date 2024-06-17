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
      <section className="flex flex-wrap justify-center mx-auto">
        {loading
          ? Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="w-[233px] h-[379px] mx-2 mb-5" />
            ))
          : contacts.map((e, index) => (
              <CardPustakawan
                key={index}
                className="mx-2 mb-5"
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
