import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Suspense, lazy } from "react";
import Home from "./pages/home";
import Error from "./pages/error";
import { Loader2 } from "lucide-react";
import Search from "./pages/search";
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
    ],
  },
  {
    path: "*",
    element: <Error />,
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
