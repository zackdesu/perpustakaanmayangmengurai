import { Link } from "react-router-dom";
import { Card, CardHeader, CardDescription } from "./ui/card";

const CardCategory = ({
  icons,
  desc,
  className,
  link,
}: {
  icons: string;
  desc: string;
  className?: string;
  link: string;
}) => {
  return (
    <Link
      to={link}
      className={`${className} w-[96px] md:w-[148px] group cursor-pointer`}
    >
      <Card className="h-full">
        <CardHeader className="flex flex-col items-center">
          <img
            src={icons}
            className="mb-3 saturate-[.7] group-hover:saturate-100 lg:min-w-[75px]"
          />
          <CardDescription className="text-center group-hover:text-zinc-800">
            <p className="max-sm:line-clamp-1">{desc}</p>
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
};

export default CardCategory;
