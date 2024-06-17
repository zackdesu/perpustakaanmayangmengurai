import { Button } from "./ui/button";
import { FiMenu } from "react-icons/fi";
import { TbBooks } from "react-icons/tb";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { Link } from "react-router-dom";
const Navbar = () => {
  const [open, setOpen] = useState<boolean>(false);

  const location = useLocation().pathname;
  return (
    <nav className="w-full px-10 py-5 border-b flex justify-between items-center fixed z-50 bg-white">
      <div className="flex items-center">
        <TbBooks size={20} className="md:mr-3 max-lg:w-8 max-lg:h-8" />
        <h6 className="hidden lg:block">Perpustakaan Mayang Mengurai</h6>
      </div>
      <ul
        className={`flex justify-between max-sm:absolute max-sm:flex-col max-sm:bg-white max-sm:p-2 max-sm:border max-sm:rounded top-[90%] right-10 ${
          open ? "max-sm:flex" : "max-sm:hidden"
        }`}
      >
        <li
          onClick={() => setOpen(false)}
          className={location === "/" ? "sm:font-bold" : ""}
        >
          <Link to={"/"}>Beranda</Link>
        </li>
        <li
          onClick={() => setOpen(false)}
          className={`${
            location === "/informasi" ? "sm:font-bold" : ""
          } max-sm:mt-5 sm:ml-6 lg:ml-10`}
        >
          <Link to={"/informasi"}>Informasi</Link>
        </li>
        <li
          onClick={() => setOpen(false)}
          className={`${
            location === "/pustakawan" ? "sm:font-bold" : ""
          } max-sm:mt-5 sm:ml-6 lg:ml-10`}
        >
          <Link to={"/pustakawan"}>Pustakawan</Link>
        </li>
        <li
          onClick={() => setOpen(false)}
          className={`${
            location === "/areaanggota" ? "sm:font-bold" : ""
          } max-sm:mt-5 sm:ml-6 lg:ml-10`}
        >
          <Link to={"/areaanggota"}>Area Anggota</Link>
        </li>
      </ul>
      <Button className="sm:hidden" onClick={() => setOpen(!open)}>
        {open ? <IoMdClose size={20} /> : <FiMenu size={20} />}
      </Button>
    </nav>
  );
};

export default Navbar;
