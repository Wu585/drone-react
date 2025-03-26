import TopBar from "@/components/drone/public/TopBar.tsx";
import {Link, Outlet, useLocation} from "react-router-dom";
import {cn} from "@/lib/utils.ts";
import {BookText, Film, Grid, LayoutList, MapPin, Proportions, Send, Users, Waypoints} from "lucide-react";

const menuList = [
  {
    name: "tsa",
    icon: <Send size={20}/>,
    href: "/tsa"
  },
  {
    name: "elements",
    icon: <MapPin size={20}/>,
    href: "/elements",
    activeHref: "elements"
  },
  {
    name: "wayline",
    icon: <Waypoints size={20}/>,
    href: "/wayline",
    activeHref: "wayline"
  },
  {
    name: "task",
    icon: <LayoutList size={20}/>,
    href: "/task-list",
    activeHref: "task"
  },
  {
    name: "flight-area",
    icon: <Grid size={20}/>,
    href: "/flight-area",
    activeHref: "flight-area"
  },
  {
    name: "media",
    icon: <Film size={20}/>,
    href: "/media",
    activeHref: "media"
  },
  {
    name: "work-order",
    icon: <BookText size={20}/>,
    href: "/work-order",
    activeHref: "work-order"
  },
  // {
  //   name: "members",
  //   icon: <Users size={20}/>,
  //   href: "/members",
  //   activeHref: "members"
  // },
  {
    name: "device-manage",
    icon: <Proportions size={20}/>,
    href: "/device-manage"
  }
];

const Layout = () => {
  const {pathname} = useLocation();
  console.log("pathname");
  console.log(pathname);

  return (
    <div className="h-full w-full bg-drone-system flex flex-col bg-full-size overflow-hidden">
      <header>
        <TopBar/>
      </header>
      <div className="flex-1 p-[22px] flex overflow-hidden">
        {!pathname.includes("organ") && !pathname.includes("depart") && !pathname.includes("create-wayline") &&
          <aside className="w-[50px] border-[1px] border-[#43ABFF] rounded-l-lg border-r-0">
            <div className="w-[50px] bg-[#0059BF]/[.5] h-full">
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
          </aside>}
        <div className="flex-1 min-w-0">
          <Outlet/>
        </div>
      </div>
    </div>
  );
};

export default Layout;

