import TopBar from "@/components/drone/public/TopBar.tsx";
import {Info, Landmark, Server, Users} from "lucide-react";
import {Link, useLocation} from "react-router-dom";
import {cn} from "@/lib/utils.ts";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion.tsx";
import {useConnectWebSocket} from "@/lib/websocket/useConnectWebSocket.ts";
import {useOnlineDocks} from "@/hooks/drone";
import {useEffect} from "react";
import GMap from "@/components/drone/public/GMap.tsx";
import DronePanel from "@/components/drone/public/DronePanel.tsx";
import {useVisible} from "@/hooks/public/utils.ts";
import {useSceneStore} from "@/store/useSceneStore.ts";

const menuList = [
  {
    name: "dock",
    icon: <Users fill="#fff" size={20}/>,
    href: "/tsa"
  },
  {
    name: "test",
    icon: <Landmark fill="#fff" size={20}/>,
    href: "/test"
  }
];

const Tsa = () => {
  const {pathname} = useLocation();
  const {dronePanelVisible, setDronePanelVisible} = useSceneStore();

  useConnectWebSocket((payload) => {
    // console.log("payload");
    // console.log(payload);
  });

  const {onlineDocks} = useOnlineDocks();

  useEffect(() => {
    console.log("onlineDocks");
    console.log(onlineDocks);
  }, [onlineDocks]);

  return (
    <div className={"w-full h-full bg-drone-system flex flex-col bg-full-size"}>
      <header>
        <TopBar/>
      </header>
      <div className={"flex-1 p-[22px] space-x-[20px] flex"}>
        <aside className={"w-[458px] flex border-[1px] border-[#43ABFF] rounded-lg"}>
          <div className={"w-[50px] bg-[#0059BF]/[.5]"}>
            {menuList.map((item, index) =>
              <Link
                key={item.href}
                className={cn("content-center py-[16px] cursor-pointer",
                  pathname === item.href ? "bg-[#43ABFF]" : "",
                  index === 0 ? "rounded-tl-lg" : "")}
                to={item.href}>
                {item.icon}
              </Link>)}
          </div>
          <div
            className={"flex-1 bg-gradient-to-r from-[#074578]/[.5] to-[#0B142E]/[.9] rounded-tr-lg rounded-br-lg"}>
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1" className={"border-b-[1px] border-b-[#265C9A]"}>
                <AccordionTrigger className={"px-[12px]"}>
                  <div className={"flex content-center space-x-4"}>
                    <span>机场</span>
                    <Info size={14}/>
                  </div>
                </AccordionTrigger>
                <AccordionContent className={"p-[12px]"}>
                  {onlineDocks.map(dock =>
                    <div key={dock.sn} className={"h-[172px] bg-dock-panel bg-full-size flex flex-col"}>
                      <div className={"flex h-full"}>
                        <div className={"flex-1"}>
                          <div className={"pl-[24px] pt-[16px]"}>
                            {dock.gateway.callsign} - {dock.callsign ?? "暂无机器"}
                          </div>
                          <div className={"pl-[24px] pt-[16px] space-y-4"}>
                            <div className={"flex mr-[80px] "}>
                              <span className={"pl-4 w-1/2 bg-[#2E3751]/[.88] text-[#40F2FF]"}>设备空闲中</span>
                              <span className={"w-1/2 bg-[#52607D]"}>N/A</span>
                            </div>
                            <div className={"flex mr-[80px] "}>
                              <span className={"pl-4 w-1/2 bg-[#2E3751]/[.88] text-[#40F2FF]"}>舱内关机</span>
                              <span className={"w-1/2 bg-[#52607D]"}>N/A</span>
                            </div>
                          </div>
                        </div>
                        <div className={"px-[28px] content-center"}>
                          <Server className={"cursor-pointer"} onClick={() => setDronePanelVisible(true)}/>
                        </div>
                      </div>
                      <div className={"h-[38px] mb-[18px] ml-[12px] flex items-center font-medium"}>
                      <span className={"p-2 bg-[#43ABFF]"}>
                        待执行
                      </span>
                      </div>
                    </div>)}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </aside>
        <div className={"flex-1 border-[2px] rounded-lg border-[#43ABFF] relative"}>
          <GMap/>
          <div className={"absolute left-2 top-2"}>
            {dronePanelVisible && <DronePanel/>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tsa;

