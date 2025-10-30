import { createBrowserRouter } from "react-router-dom";
import HomePage from "../pages/HomePage";
import MapPage from "../pages/MapPage";
import PanoramaPage from "../pages/PanoramaPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/map",
    element: <MapPage />,
  },
  {
    path: "/panorama",
    element: <PanoramaPage />,
  },
]);
