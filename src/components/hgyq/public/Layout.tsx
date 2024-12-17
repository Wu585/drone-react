import Header from "@/components/hgyq/public/Header.tsx";
import {Outlet} from "react-router-dom";

const Layout = () => {

  return (
    <div className="h-full bg-home relative bg-full-size">
      <div className={"absolute top-0 w-full"}>
        <Header/>
      </div>
      <Outlet/>
    </div>
  );
};

export default Layout;

