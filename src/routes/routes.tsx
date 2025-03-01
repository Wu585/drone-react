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
import FlightArea from "@/pages/FlightArea.tsx";
import OrganDetail from "@/pages/OrganDetail.tsx";
import DepartPage from "@/pages/DepartPage.tsx";
import Screen from "@/pages/Screen.tsx";
import BookOrderPage from "@/pages/BookOrderPage.tsx";
import TestStep from "@/pages/TestStep.tsx";

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
    path: "/screen",
    element: (
      <Screen/>
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
        path: "test",
        element: <TestStep/>
      },
      {
        path: "depart",
        element: <DepartPage/>
      },
      {
        path: "organs",
        element: <OrganDetail/>
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
        path: "flight-area",
        element: <FlightArea/>
      },
      {
        path: "media",
        element: <Media/>
      },
      {
        path: "work-order",
        element: <BookOrderPage/>
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
