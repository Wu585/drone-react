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
import Elements from "@/pages/Elements.tsx";
import MapPhoto from "@/pages/MapPhoto.tsx";
import TaskCreateApply from "@/pages/TaskCreateApply.tsx";
import VideoShareRtc from "@/pages/VideoShareRtc.tsx";
import AlgorithmConfig from "@/pages/AlgorithmConfig.tsx";
import CreateWayLine0517 from "@/pages/CreateWayLine0517.tsx";
import VideoShareRtc2 from "@/pages/VideoShareRtc2.tsx";
import _Cockpit from "@/pages/_Cockpit.tsx";

const Login = lazy(() => import("@/pages/hgyq/Login.tsx"));

export const routes: RouteObject[] = [
  {
    path: "/video-share",
    element: <VideoShareRtc/>
  },
  {
    path: "/video-share2",
    element: <VideoShareRtc2/>
  },
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
      <_Cockpit/>
    ),
  },
  {
    path: "/cockpit-new",
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
    path: "create-wayline",
    element: <CreateWayLine0517/>
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
        path: "task-create-apply",
        element: <TaskCreateApply/>
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
        path: "algorithm-config",
        element: <AlgorithmConfig/>
      },
      {
        path: "wayline",
        element: <WayLine/>
      },
      {
        path: "elements",
        element: <Elements/>
      },
      {
        path: "map-photo",
        element: <MapPhoto/>
      },
    ]
  },
];
