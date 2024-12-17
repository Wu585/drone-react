import {Header} from "./Header.tsx";
import Scene from "./Scene.tsx";
import {Outlet, useLocation} from "react-router-dom";
// import {cn} from "@/lib/utils.ts";
// import {useSceneStore} from "@/store/useSceneStore.ts";
// import ToolBar from "@/components/toolbar/ToolBar.tsx";
import {useEffect} from "react";
import {Helmet} from "react-helmet";
import {useUserProfile} from "@/hooks/manage-system/api.ts";

export const Layout = () => {
  // const {isFullScreen} = useSceneStore();
  // const navigate = useNavigate();
  const location = useLocation();

  useUserProfile();

  useEffect(() => {
    console.log("location");
    console.log(location);
  }, [location]);

  return <div className={"h-full"}>
    <Helmet>
      <title>奉浦街道数字家园</title>
    </Helmet>
    <header className={"w-full absolute top-[-10px] z-20"}>
      <Header/>
    </header>
    {/*<div className={"absolute z-20 right-[550px] bottom-[32px]"}>
      <ToolBar/>
    </div>*/}
    <Scene/>
    <Outlet/>
    {/*{location.pathname !== "/" && <>
      <div style={{
        backgroundSize: "100% 100%"
      }} className={cn("bg-side-container bg-no-repeat w-[560px] h-full absolute top-0 left-0 z-5 my-[80px]",
        isFullScreen ? "w-[560px]" : "w-0")}/>
      <div style={{
        backgroundSize: "100% 100%"
      }} className={cn("bg-side-container bg-no-repeat w-[560px] h-full absolute top-0 right-0 z-5 my-[80px]",
        isFullScreen ? "w-[560px]" : "w-0")}/>
    </>}*/}
  </div>;
};
