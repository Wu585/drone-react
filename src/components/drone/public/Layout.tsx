import TopBar from "@/components/drone/public/TopBar.tsx";
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import {cn} from "@/lib/utils.ts";
import {
  BookText,
  Cog,
  Film,
  Image,
  LayoutList,
  MapPin,
  Proportions,
  Send,
  Share,
  SquareActivity,
  Waypoints
} from "lucide-react";
import {useState} from "react";
import {Button} from "@/components/ui/button.tsx";
import {CommonButton} from "@/components/drone/public/CommonButton.tsx";

const menuList = [
  {
    name: "tsa",
    icon: <Send size={24}/>,
    href: "/tsa",
    permission: "Collection_DeviceDetail",
    menuName: "机场"
  },
  {
    name: "flight-area",
    icon: <SquareActivity size={24}/>,
    href: "/flight-area",
    activeHref: "flight-area",
    // permission: "Collection_AnnotationView",
    menuName: "自定义飞行区"
  },
  {
    name: "elements",
    icon: <MapPin size={24}/>,
    href: "/elements",
    activeHref: "elements",
    permission: "Collection_AnnotationView",
    menuName: "地图标注"
  },
  {
    name: "map-photo",
    icon: <Image size={24}/>,
    href: "/map-photo",
    activeHref: "map-photo",
    permission: "Collection_MediaVisual",
    menuName: "媒体/工单照片"
  },
  {
    name: "wayline",
    icon: <Waypoints size={24}/>,
    href: "/wayline",
    activeHref: "wayline",
    permission: "Collection_WaylineView",
    menuName: "航线管理"
  },
  {
    name: "task",
    icon: <LayoutList size={24}/>,
    href: "/task-list",
    activeHref: "task",
    permission: "Collection_PlanView",
    menuName: "任务管理"
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
    permission: "Collection_MediaView",
    menuName: "媒体库"
  },
  {
    name: "work-order",
    icon: <BookText size={24}/>,
    href: "/work-order",
    activeHref: "work-order",
    permission: "Collection_TicketView",
    menuName: "工单管理"
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
    permission: "Collection_DeviceDetail",
    menuName: "设备管理"
  },
  {
    name: "algorithm-config",
    icon: <Cog size={24}/>,
    href: "/algorithm-config",
    permission: "Collection_DeviceDetail",
    menuName: "算法管理"
  }
];

const Layout = () => {
  const navigate = useNavigate();
  const {pathname} = useLocation();
  console.log("pathname");
  console.log(pathname);

  const [expanded, setExpanded] = useState(true);

  return (
    <div className="h-full w-full bg-drone-system flex flex-col bg-full-size overflow-hidden">
      <header>
        <TopBar/>
      </header>
      <div className="flex-1 p-[22px] flex overflow-hidden">
        {!pathname.includes("organ") && !pathname.includes("depart") && !pathname.includes("create-wayline") && !pathname.includes("multi-live") &&
          <aside className={cn(
            "border-[1px] border-[#43ABFF] border-r-0 rounded-l-lg relative transition-all duration-300 ease-in-out",
            expanded ? "w-[165px] bg-gradient-to-l from-[#2C4372] to-[#35537F]" : "w-[54px] bg-gradient-to-l from-[#2C4372] to-[#35537F]" // Adjust these widths as needed
          )}>
            <div className="h-full rounded-l-lg overflow-hidden">
              {menuList.map((item, index) =>
                <div key={item.name} className={cn("flex items-center justify-center",
                  pathname.includes(item.name) ? "bg-gradient-to-l from-[#3085E5] to-[#5FA1EB]" : "",
                  index === 0 ? "rounded-tl-lg" : "rounded-none")}>
                  <CommonButton permissionKey={item.permission} variant={"link"}
                                    className={"bg-transparent py-[32px] cursor-pointer text-white rounded-none " +
                                      "hover:no-underline w-full text-left flex justify-start text-base "+
                                      "transition-all duration-200 ease-in-out "+
                                      "whitespace-nowrap"
                                    }
                                    onClick={() => navigate(item.href)}
                  >
                    <span>{item.icon}</span>
                    <span className={cn(
                      "transition-all duration-300 ease-in-out inline-block",
                      expanded ? "opacity-100 w-auto ml-2" : "opacity-0 w-0"
                    )}>
                      {item.menuName}
                    </span>
                  </CommonButton>
                </div>
              )}
            </div>
            <Button
              className={cn(
                "absolute left-2 bottom-6 cursor-pointer p-2 rounded-full bg-[#375f9f] hover:bg-[#43ABFF]",
                "transition-all duration-300 ease-in-out",
              )}
              onClick={() => setExpanded(!expanded)}
            >
              <Share
                className={cn(
                  "transition-transform duration-300 ease-in-out",
                  expanded ? "-rotate-90" : "rotate-90"
                )}
                size={20}
              />
            </Button>
          </aside>}
        <div
          className="flex-1 transition-all duration-300 ease-in-out">
          <Outlet/>
        </div>
      </div>
    </div>
  );
};

export default Layout;

