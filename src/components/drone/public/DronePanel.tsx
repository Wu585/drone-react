import {useAjax} from "@/lib/http.ts";
import {useEffect, useRef} from "react";
import {ELocalStorageKey} from "@/types/enum.ts";
import {UranusMqtt} from "@/mqt";
import {Forward, Settings, X} from "lucide-react";
import yjqfPng from "@/assets/images/drone/yjqf.png";
import {useSceneStore} from "@/store/useSceneStore.ts";
import TakeOffFormPanel from "@/components/drone/public/TakeOffFormPanel.tsx";
import {useVisible} from "@/hooks/public/utils.ts";

// DRC 链路
const DRC_API_PREFIX = "/control/api/v1";

const DronePanel = () => {
  const {setDronePanelVisible} = useSceneStore();
  const {visible, hide, show} = useVisible();

  const {post} = useAjax();
  const workspaceId: string = localStorage.getItem(ELocalStorageKey.WorkspaceId) || "";
  const mqttStateRef = useRef<UranusMqtt | null>(null);

  useEffect(() => {
    post(`${DRC_API_PREFIX}/workspaces/${workspaceId}/drc/connect`, {}).then((result: any) => {
      if (result.data.code === 0) {
        const {address, client_id, username, password} = result.data.data;
        mqttStateRef.current = new UranusMqtt(address, {
          clientId: client_id,
          username,
          password,
        });
        mqttStateRef.current?.initMqtt();
      }
    });

    return () => {
      mqttStateRef.current?.destroyed();
    };
  }, []);

  return (
    <div className={"flex relative"}>
      <div className={"w-[412px] bg-control-panel bg-full-size relative"}>
        {/*<Button onClick={onTakeOff}>Take Off</Button>
      <Button>Q</Button>
      <Button>W</Button>
      <Button>E</Button>
      <Button>A</Button>*/}
        <X onClick={() => setDronePanelVisible(false)} className={"absolute right-2 top-2 cursor-pointer"}/>
        <div className={"h-[46px]"}>

        </div>
        <div className={"h-[100px] flex text-[12px] border-b-[1px] border-[#104992]/[.85] mr-[4px]"}>
          <div className={"h-full w-[65px] bg-[#2A8DFE]/[.5] content-center"}>Dock2</div>
          <div className={"flex-1 p-[12px] space-y-2 bg-[#001E37]/[.9]"}>
            <div className={"grid grid-cols-4"}>
              <span className={"col-span-1 py-[2px] text-[#40F2FF]"}>设备空闲中</span>
              <span className={"col-span-3 py-[2px] bg-[#52607D] pl-4"}>当前正常</span>
            </div>
            <div className={"grid grid-cols-4"}>
              <span>适合飞行</span>
              <span>17.4°C</span>
              <span>205KB/s</span>
              <span>0</span>
            </div>
            <div className={"grid grid-cols-12"}>
            <span
              className={"col-span-10 border-[1px] border-[#43ABFF] rounded-[2px] cursor-pointer content-center py-[2px] bg-[#104992]/[.85]"}>
              机场直播
            </span>
              <span className={"col-span-2 content-center"}>
              <Settings size={17}/>
            </span>
            </div>
          </div>
        </div>
        <div className={"h-[100px] flex text-[12px] border-b-[1px] border-[#104992]/[.85] mr-[4px]"}>
          <div className={"h-full w-[65px] bg-[#2A8DFE]/[.5] content-center"}>M3TD</div>
          <div className={"flex-1 p-[12px] space-y-2 bg-[#001E37]/[.9]"}>
            <div className={"grid grid-cols-4"}>
              <span className={"col-span-1 py-[2px] text-[#40F2FF]"}>舱内关机</span>
              <span className={"col-span-3 py-[2px] bg-[#52607D] pl-4"}>N/A</span>
            </div>
            <div className={"grid grid-cols-12"}>
            <span
              className={"col-span-10 text-[#9F9F9F] cursor-pointer content-center py-[2px]"}>
              当前设备已关机，无法进行直播
            </span>
              <span className={"col-span-2 content-center"}>
              <Forward size={17}/>
            </span>
            </div>
            <div className={"grid grid-cols-12"}>
            <span
              className={"col-span-10 border-[#43ABFF] rounded-[2px] cursor-pointer content-center py-[2px] bg-[#104992]/[.85]"}>
              虚拟座舱
            </span>
              <span className={"col-span-2 content-center"}>
              <Settings size={17}/>
            </span>
            </div>
          </div>
        </div>
        <div className={"h-[100px] mr-[4px] grid grid-cols-4 bg-[#001E37]/[.9] border-b-[1px] border-[#104992]/[.85]"}>
          <span className={"content-center"}>1</span>
          <span className={"content-center"}>1</span>
          <span className={"content-center"}>1</span>
          <span className={"content-center"}>1</span>
          <span className={"content-center"}>1</span>
          <span className={"content-center"}>1</span>
          <span className={"content-center"}>1</span>
          <span className={"content-center"}>1</span>
        </div>
        <div className={"h-[130px] bg-[#001E37]/[.9] mr-[4px] py-2 grid grid-cols-3"}>
          <div className={"border-r-[1px] border-r-[#104992]/[.85] h-full content-center"}>
            <img src={yjqfPng} alt="" className={"cursor-pointer"} onClick={show}/>
          </div>
          <div className={"border-r-[1px] border-r-[#104992]/[.85] h-full"}></div>
          <div className={"flex flex-col text-[12px] text-[#D0D0D0] justify-center px-4"}>
            <span>指点飞行</span>
            <span>--</span>
            <span>返航</span>
            <span>--</span>
            <div className={"flex items-center space-x-4 bg-[#104992]/[.85] px-2 py-[2px] cursor-pointer"}>
              <Settings size={16}/>
              <span>虚拟座舱</span>
            </div>
          </div>
        </div>
      </div>
      <div className={"absolute left-full"}>
        {visible && <TakeOffFormPanel sn={"4SEDL9S00178K9"} onClose={hide}/>}
      </div>
    </div>
  );
};

export default DronePanel;

