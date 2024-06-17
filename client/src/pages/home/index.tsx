import Active from "./active";
import Category from "./category";
import Location from "./location";
import Main from "./main";
import Popular from "./popular";

const Home = () => {
  return (
    <>
      <Main />
      <Category />
      <Popular />
      <Active />
      <Location />
    </>
  );
};

export default Home;
