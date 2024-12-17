import {Navigate, RouteObject} from "react-router-dom";
import {lazy, Suspense} from "react";
import Layout from "@/components/hgyq/public/Layout.tsx";

const Home = lazy(() => import("@/pages/hgyq/Home.tsx"));
const Login = lazy(() => import("@/pages/hgyq/Login.tsx"));
const ResourceCenter = lazy(() => import("@/pages/hgyq/ResourceCenter.tsx"));

export const routes: RouteObject[] = [
  {
    path: "/",
    element: (
      <Suspense>
        <Layout/>
      </Suspense>
    ),
    children: [
      {
        path: "",
        element: <Navigate to="/home" replace/>
      },
      {
        path: "home",
        element:
          <Home/>
      },
      {
        path: "login",
        element:
          <Login/>
      },
      {
        path: "resource-center",
        element:
          <ResourceCenter/>
      },
    ]
  },
];
