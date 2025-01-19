import {Navigate, RouteObject} from "react-router-dom";
import {lazy, Suspense} from "react";
import Layout from "@/components/drone/public/Layout.tsx";
import Tsa from "@/pages/Tsa.tsx";
import TaskList from "@/pages/TaskList.tsx";
import Cockpit from "@/pages/Cockpit.tsx";
import WayLine from "@/pages/WayLine.tsx";
import TaskCreate from "@/pages/TaskCreate.tsx";
import DeviceManage from "@/pages/DeviceManage.tsx";
import Media from "@/pages/Media.tsx";
import Members from "@/pages/Members.tsx";

const Login = lazy(() => import("@/pages/hgyq/Login.tsx"));

export const routes: RouteObject[] = [
  {
    path: "/login",
    element: (
      <Suspense>
        <Login/>
      </Suspense>
    ),
  },
  {
    path: "/cockpit",
    element: (
      <Cockpit/>
    ),
  },
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
        element: <Navigate to="/tsa" replace/>
      },
      {
        path: "tsa",
        element: <Tsa/>
      },
      {
        path: "task-list",
        element: <TaskList/>
      },
      {
        path: "task-create",
        element: <TaskCreate/>
      },
      {
        path: "media",
        element: <Media/>
      },
      {
        path: "members",
        element: <Members/>
      },
      {
        path: "device-manage",
        element: <DeviceManage/>
      },
      {
        path: "wayline",
        element: <WayLine/>
      },
    ]
  },
];
