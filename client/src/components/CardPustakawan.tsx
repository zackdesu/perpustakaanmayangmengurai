import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "./ui/card";
import { MdEmail } from "react-icons/md";

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
  return (
    <Card
      className={"aspect-[9/10] grid grid-rows-[1fr_min-content] " + className}
    >
      <div className="aspect-square rounded grid bg-neutral-100">
        <img
          src="/assets/smkn1dumai.png"
          className="w-9/12 place-self-center"
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
            <a target="_blank" href={`mailto:${email}`}>
              <MdEmail
                size={24}
                className="hover:text-blue-400 mr-1 cursor-pointer"
              />
            </a>
          )}

          {facebook && (
            <a target="_blank" href={`https://facebook.com/${facebook}`}>
              <FaFacebook
                className="hover:text-blue-700 mx-1 cursor-pointer"
                size={24}
              />
            </a>
          )}
          {instagram && (
            <a target="_blank" href={`https://instagram.com/${instagram}`}>
              <FaInstagram
                className="hover:text-pink-600 mx-1 cursor-pointer"
                size={24}
              />
            </a>
          )}

          {phonenumber && (
            <a target="_blank" href={`https://wa.me/${phonenumber}`}>
              <FaWhatsapp
                size={24}
                className="hover:text-green-500 rounded mx-1 cursor-pointer"
              />
            </a>
          )}
        </CardFooter>
      </div>
    </Card>
  );
};

export default CardPustakawan;
