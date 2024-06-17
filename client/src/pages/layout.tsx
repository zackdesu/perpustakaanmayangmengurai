import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { Outlet, ScrollRestoration } from "react-router-dom";

const Layout = () => {
  return (
    <>
      <Navbar />
      <ScrollRestoration />
      <section className="py-24 mx-10">
        <Outlet />
      </section>
      <Footer />
    </>
  );
};

export default Layout;
