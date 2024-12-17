import Header from "@/components/shared-dock/Header.tsx";
import {Outlet} from "react-router-dom";
import {Helmet} from "react-helmet";

const SharedDockLayout = () => {
  return (
    <div className={"bg-shared-dock-page h-full border-2"}>
      <Helmet>
        <title>奉浦街道数字家园共享对接系统</title>
      </Helmet>
      <Header/>
      <Outlet/>
    </div>
  );
};

export default SharedDockLayout;

