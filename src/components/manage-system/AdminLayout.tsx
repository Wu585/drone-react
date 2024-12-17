import Header from "@/components/manage-system/Header.tsx";
import {Helmet} from "react-helmet";
import SideBar from "@/components/manage-system/SideBar.tsx";
import {Outlet} from "react-router-dom";
import {cn} from "@/lib/utils.ts";

const AdminLayout = () => {
  return (
    <div style={{
      background: "linear-gradient(180deg, #F8FDFF 0%, #DBECF4 100%)"
    }} className={"text-black h-full"}>
      <Helmet>
        <title>奉浦街道数字家园运维管理系统</title>
      </Helmet>
      <Header/>
      <SideBar/>
      <main
        style={{
          width: 'calc(100% - 18rem)',
          height: 'calc(100% - 4rem)'
        }}
        className={cn(
          "fixed top-14 ml-72"
        )}
      >
        <Outlet/>
      </main>
    </div>
  );
};

export default AdminLayout;

