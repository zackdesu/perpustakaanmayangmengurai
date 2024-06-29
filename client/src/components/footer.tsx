import { TbBooks } from "react-icons/tb";
import { FaInstagram } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="w-full bg-green-900 text-white p-5">
      <div className="flex items-center justify-center">
        <TbBooks size={30} className="mr-1 md:mr-3 max-md:w-6 max-md:h-6" />
        <h5 className="max-md:text-sm">Perpustakaan Mayang Mengurai</h5>
      </div>
      <div className="flex justify-center my-5">
        <a
          href="https://instagram.com/perpustakaanmayangmengurai"
          target="_blank"
        >
          <FaInstagram className="ml-2 cursor-pointer" size={25} />
        </a>
      </div>
      <p className="w-full text-center">&copy; Wongso Wijaya, 2024</p>
    </footer>
  );
};

export default Footer;
