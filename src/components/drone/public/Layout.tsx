import TopBar from "@/components/drone/public/TopBar.tsx";
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import {cn} from "@/lib/utils.ts";
import {BookText, Cog, Film, Image, LayoutList, MapPin, Proportions, Send, Waypoints} from "lucide-react";
import PermissionButton from "@/components/drone/public/PermissionButton.tsx";

const menuList = [
  {
    name: "tsa",
    icon: <Send size={24}/>,
    href: "/tsa",
    permission: "Collection_DeviceDetail"
  },
  {
    name: "elements",
    icon: <MapPin size={24}/>,
    href: "/elements",
    activeHref: "elements",
    permission: "Collection_AnnotationView"
  },
  {
    name: "map-photo",
    icon: <Image size={24}/>,
    href: "/map-photo",
    activeHref: "map-photo",
    permission: "Collection_MediaVisual"
  },
  {
    name: "wayline",
    icon: <Waypoints size={24}/>,
    href: "/wayline",
    activeHref: "wayline",
    permission: "Collection_WaylineView"
  },
  {
    name: "task",
    icon: <LayoutList size={24}/>,
    href: "/task-list",
    activeHref: "task",
    permission: "Collection_PlanView"
  },
  /*{
    name: "flight-area",
    icon: <Grid size={20}/>,
    href: "/flight-area",
    activeHref: "flight-area"
  },*/
  {
    name: "media",
    icon: <Film size={24}/>,
    href: "/media",
    activeHref: "media",
    permission: "Collection_MediaView"
  },
  {
    name: "work-order",
    icon: <BookText size={24}/>,
    href: "/work-order",
    activeHref: "work-order",
    permission: "Collection_TicketView"
  },
  // {
  //   name: "members",
  //   icon: <Users size={20}/>,
  //   href: "/members",
  //   activeHref: "members"
  // },
  {
    name: "device-manage",
    icon: <Proportions size={24}/>,
    href: "/device-manage",
    permission: "Collection_DeviceDetail"
  },
  {
    name: "algorithm-config",
    icon: <Cog size={24}/>,
    href: "/algorithm-config",
    permission: "Collection_DeviceDetail"
  }
];

const Layout = () => {
  const navigate = useNavigate();
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
          <aside className="w-[50px] border-[1px] border-[#43ABFF] border-r-0 rounded-l-lg">
            <div className="w-[50px] bg-[#375f9f]/[.68] h-full rounded-l-lg">
              {menuList.map((item, index) =>
                <PermissionButton key={item.name} permissionKey={item.permission} variant={"link"}
                                  className={cn("content-center py-[32px] cursor-pointer text-white w-[50px] rounded-none",
                                    pathname.includes(item.name) ? "bg-[#43ABFF]" : "",
                                    index === 0 ? "rounded-tl-lg" : "rounded-none")}
                                  onClick={() => navigate(item.href)}
                >
                  {item.icon}
                </PermissionButton>
              )}
            </div>
          </aside>}
        <div className="flex-1 bg-gradient-to-r from-[#074578]/[.4] to-[#0B142E]/[.7]">
          <Outlet/>
        </div>
      </div>
    </div>
  );
};

export default Layout;

