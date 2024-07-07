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
      className={`${className} w-[120px] md:w-[148px] group cursor-pointer`}
    >
      <Card className="h-full">
        <CardHeader className="flex flex-col items-center">
          <img
            src={icons}
            className="mb-3 saturate-[.7] group-hover:saturate-100 lg:min-w-[75px]"
            alt={desc}
            title={desc}
            decoding="async"
            fetchPriority="high"
          />
          <CardDescription className="text-center group-hover:text-zinc-800 max-sm:line-clamp-1">
            {desc}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
};

export default CardCategory;
