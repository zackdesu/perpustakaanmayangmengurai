import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "./ui/card";
import { LucideIcon, Mail } from "lucide-react";
import { IconType } from "react-icons";

type Contact = {
  className: string;
  nama: string;
  title: string;
  email?: string;
  facebook?: string;
  instagram?: string;
  phonenumber?: string;
};

const CardPustakawan = ({
  className,
  nama,
  title,
  email,
  facebook,
  instagram,
  phonenumber,
}: Contact) => {
  const Link = ({
    href,
    Icons,
    className,
    label,
  }: {
    href: string;
    Icons: LucideIcon | IconType;
    className: string;
    label: string;
  }) => (
    <a target="_blank" href={href} aria-label={label}>
      <Icons size={24} className={`${className} mr-1 cursor-pointer`} />
    </a>
  );

  return (
    <Card
      className={"aspect-[9/10] grid grid-rows-[1fr_min-content] " + className}
    >
      <div className="aspect-square rounded grid bg-neutral-100">
        <img
          src="/assets/smkn1dumai.png"
          className="w-9/12 place-self-center"
          alt={nama}
          loading="lazy"
          decoding="async"
        />
      </div>
      <div>
        <CardHeader>
          <CardTitle className="line-clamp-1 leading-normal -mb-2">
            {nama}
          </CardTitle>
          <CardDescription>{title}</CardDescription>
        </CardHeader>
        <CardFooter>
          {email && (
            <Link
              href={`mailto:${email}`}
              Icons={Mail}
              className="hover:text-blue-400"
              label="email"
            />
          )}

          {facebook && (
            <Link
              href={`https://facebook.com/${facebook}`}
              Icons={FaFacebook}
              className="hover:text-blue-700"
              label="facebook"
            />
          )}
          {instagram && (
            <Link
              href={`https://instagram.com/${instagram}`}
              Icons={FaInstagram}
              className="hover:text-pink-600"
              label="instagram"
            />
          )}

          {phonenumber && (
            <Link
              href={`https://wa.me/${phonenumber}`}
              Icons={FaWhatsapp}
              className="hover:text-green-500"
              label="whatsapp"
            />
          )}
        </CardFooter>
      </div>
    </Card>
  );
};

export default CardPustakawan;
