import { Card, CardHeader, CardDescription } from "./ui/card";

const CardCategory = ({
  icons,
  desc,
  className,
}: {
  icons: string;
  desc: string;
  className?: string;
}) => {
  return (
    <Card className={"group cursor-pointer w-[96px] md:w-[148px] " + className}>
      <CardHeader className="flex flex-col items-center">
        <img
          src={`/${icons}`}
          className="mb-3 saturate-[.7] group-hover:saturate-100 lg:min-w-[75px]"
        />
        <CardDescription className="text-center group-hover:text-zinc-800">
          <p className="max-sm:truncate max-sm:w-20">{desc}</p>
        </CardDescription>
      </CardHeader>
    </Card>
  );
};

export default CardCategory;
