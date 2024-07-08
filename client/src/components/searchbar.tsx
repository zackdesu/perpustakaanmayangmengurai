import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormEvent, useRef } from "react";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const SearchBar = ({
  className,
  value,
}: {
  className?: string;
  value?: string;
}) => {
  const navigate = useNavigate();
  const searchInput = useRef<HTMLInputElement>(null);
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchInput.current || !searchInput.current.value) return;
    navigate("/search?q=" + searchInput.current.value);
  };
  return (
    <form onSubmit={handleSubmit} className={"flex relative " + className}>
      <Input
        type="search"
        placeholder="Cari nama buku"
        className="mr-2 focus-visible:ring-offset-0 focus-visible:ring-0"
        ref={searchInput}
        defaultValue={value}
      />
      <Button type="submit" className="absolute right-0" aria-label="search">
        <FaSearch />
      </Button>
    </form>
  );
};

export default SearchBar;
