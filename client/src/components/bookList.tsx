import { Link } from "react-router-dom";
import { Card, CardDescription } from "./ui/card";

const BookList = ({
  image,
  name,
  className,
  list,
  link,
}: {
  image: string;
  name: string;
  className?: string;
  list?: boolean;
  link: string;
}) => {
  return (
    <Link to={link}>
      <Card
        className={`group cursor-pointer ${
          !list ? "w-[96px] md:w-[148px]" : "aspect-[9/15] max-w-[300px]"
        } ${className}`}
      >
        <div
          className={`flex flex-col items-center p-1 ${list && "aspect-[2/3]"}`}
        >
          <img
            src={image}
            className={`mb-3 saturate-[.7] group-hover:saturate-100 ${
              !list ? "max-h-[120px] md:max-h-[190px]" : "h-full"
            } rounded`}
          />
          <CardDescription className="text-center group-hover:text-zinc-800 line-clamp-1 px-1">
            {name}
          </CardDescription>
        </div>
      </Card>
    </Link>
  );
};

export default BookList;
