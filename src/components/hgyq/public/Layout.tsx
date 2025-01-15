import {Outlet} from "react-router-dom";
import TopBar from "@/components/drone/public/TopBar.tsx";

const Layout = () => {

  return (
    <div className="h-full bg-login relative bg-full-size">
      <div className={"absolute top-0 w-full"}>
        <TopBar/>
      </div>
      <Outlet/>
    </div>
  );
};

export default Layout;

