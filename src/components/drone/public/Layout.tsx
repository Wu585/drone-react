import TopBar from "@/components/drone/public/TopBar.tsx";
import {Link, Outlet, useLocation} from "react-router-dom";
import {cn} from "@/lib/utils.ts";
import {LayoutList, Proportions, Users, Waypoints} from "lucide-react";

const menuList = [
  {
    name: "tsa",
    icon: <Users fill="#fff" size={20}/>,
    href: "/tsa"
  },
  {
    name: "wayline",
    icon: <Waypoints fill="#fff" size={20}/>,
    href: "/wayline",
    activeHref: "wayline"
  },
  {
    name: "task",
    icon: <LayoutList fill="#fff" size={20}/>,
    href: "/task-list",
    activeHref: "task"
  },
  {
    name: "device-manage",
    icon: <Proportions size={20}/>,
    href: "/device-manage"
  }
];

const Layout = () => {
  const {pathname} = useLocation();

  return (
    <div className={"w-full h-full bg-drone-system flex flex-col bg-full-size"}>
      <header>
        <TopBar/>
      </header>
      <div className={"flex-1 p-[22px] flex"}>
        <aside className={"w-[50px] flex border-[1px] border-[#43ABFF] rounded-l-lg border-r-0"}>
          <div className={"w-[50px] bg-[#0059BF]/[.5]"}>
            {menuList.map((item, index) =>
              <Link
                key={item.href}
                className={cn("content-center py-[16px] cursor-pointer",
                  pathname.includes(item.name) ? "bg-[#43ABFF]" : "",
                  index === 0 ? "rounded-tl-lg" : "")}
                to={item.href}>
                {item.icon}
              </Link>)}
          </div>
        </aside>
        <div className={"flex-1"}>
          <Outlet/>
        </div>
      </div>
    </div>
  );
};

export default Layout;

