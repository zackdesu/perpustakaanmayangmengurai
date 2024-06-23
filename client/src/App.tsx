import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";
import { Suspense, lazy } from "react";
import Home from "./pages/home";
import { Loader2 } from "lucide-react";
import Search from "./pages/search";
import BookInformation from "./pages/bookInformation";
import BookTypes from "./pages/bookTypes";
const Layout = lazy(() => import("./pages/layout"));
const Pustakawan = lazy(() => import("./pages/pustakawan"));
const Areaanggota = lazy(() => import("./pages/areaanggota"));
const Informasi = lazy(() => import("./pages/informasi"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      {
        path: "pustakawan",
        element: (
          <Suspense
            fallback={<Loader2 className="h-4 w-4 mx-auto animate-spin" />}
          >
            <Pustakawan />
          </Suspense>
        ),
      },
      {
        path: "areaanggota",
        element: (
          <Suspense
            fallback={<Loader2 className="h-4 w-4 mx-auto animate-spin" />}
          >
            <Areaanggota />
          </Suspense>
        ),
      },
      {
        path: "informasi",
        element: (
          <Suspense
            fallback={<Loader2 className="h-4 w-4 mx-auto animate-spin" />}
          >
            <Informasi />
          </Suspense>
        ),
      },

      {
        path: "search",
        element: <Search />,
      },
      {
        path: "book",
        element: <Navigate to="/" replace />,
      },

      {
        path: "book/:bookId",
        element: <BookInformation />,
      },
      {
        path: "types/:bookTypes",
        element: <BookTypes />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
