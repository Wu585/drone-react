import {useAjax} from "@/lib/http.ts";
import {ELocalStorageKey} from "@/types/enum.ts";
import {Forward, Settings, X} from "lucide-react";
import yjqfPng from "@/assets/images/drone/yjqf.png";
import {useSceneStore} from "@/store/useSceneStore.ts";
import TakeOffFormPanel from "@/components/drone/public/TakeOffFormPanel.tsx";
import {useVisible} from "@/hooks/public/utils.ts";
import remoteControlPng from "@/assets/images/drone/remote-control.png";
import compassPng from "@/assets/images/drone/compass.png";
import {cn} from "@/lib/utils.ts";
import KeyboardControl from "@/components/drone/public/KeyboardControl.tsx";
import {useNavigate} from "react-router-dom";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {toast} from "@/components/ui/use-toast.ts";
import {useConnectMqtt} from "@/hooks/drone/useConnectMqtt.ts";
import {useState} from "react";
import {useMqtt} from "@/hooks/drone/use-mqtt.ts";
import {KeyCode, useManualControl} from "@/hooks/drone/useManualControl.ts";

// DRC 链路
const DRC_API_PREFIX = "/control/api/v1";

const DronePanel = () => {
  const {setDronePanelVisible, clientId, osdVisible} = useSceneStore();
  const {visible, hide, show} = useVisible();
  const navigate = useNavigate();

  const {post} = useAjax();
  const workspaceId: string = localStorage.getItem(ELocalStorageKey.WorkspaceId) || "";

  const {visible: isRemoteControl, show: enterRemoteControl, hide: outRemoteControl} = useVisible();

  /*useEffect(() => {
    post(`${DRC_API_PREFIX}/workspaces/${workspaceId}/drc/connect`, {}).then((result: any) => {
      if (result.data.code === 0) {
        const {address, client_id, username, password} = result.data.data;
        setClientId(client_id);
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
  }, []);*/

  useConnectMqtt();

  const [deviceTopicInfo, setDeviceTopicInfo] = useState({
    sn: osdVisible.gateway_sn || "",
    pubTopic: "",
    subTopic: ""
  });

  useMqtt(deviceTopicInfo);

  // 退出飞行控制
  const exitFlightControl = async () => {
    try {
      const res = await post<Resource<any>>(`${DRC_API_PREFIX}/workspaces/${workspaceId}/drc/exit`, {
        client_id: clientId,
        dock_sn: osdVisible.gateway_sn || ""
      });
      if (res.data.code === 0) {
        outRemoteControl();
        setDeviceTopicInfo({
          ...deviceTopicInfo,
          subTopic: "",
          pubTopic: ""
        });
        toast({
          description: "Exit flight control"
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  // 进入飞行控制
  const enterFlightControl = async () => {
    try {
      const res = await post<Resource<any>>(`${DRC_API_PREFIX}/workspaces/${workspaceId}/drc/enter`, {
        client_id: clientId,
        dock_sn: osdVisible.gateway_sn || ""
      });
      console.log("res");
      console.log(res);
      if (res.data.code === 0) {
        enterRemoteControl();
        const data = res.data.data;
        if (data.sub && data.sub.length > 0) {
          setDeviceTopicInfo({
            ...deviceTopicInfo,
            subTopic: data.sub[0]
          });
        }
        if (data.sub && data.pub.length > 0) {
          setDeviceTopicInfo({
            ...deviceTopicInfo,
            subTopic: data.pub[0]
          });
        }
        toast({
          description: "Get flight control successfully"
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onClickFightControl = async () => {
    if (isRemoteControl) {
      await exitFlightControl();
      return;
    }
    await enterFlightControl();
  };

  const {
    handleKeyup,
    // handleEmergencyStop,
    resetControlState,
  } = useManualControl(deviceTopicInfo, isRemoteControl);

  const onMouseDown = (type: KeyCode) => {
    handleKeyup(type);
  };

  const onMouseUp = () => {
    resetControlState();
  };

  const onClickCockpit = () => {
    navigate("/cockpit");
  };

  return (
    <div className={"flex relative"}>
      <div className={"w-[412px] bg-control-panel bg-full-size relative"}>
        <X onClick={() => setDronePanelVisible(false)} className={"absolute right-2 top-2 cursor-pointer"}/>
        <div className={"h-[46px] flex items-center pl-6"}>
          DJI Dock
        </div>
        <div className={"h-[100px] flex text-[12px] border-b-[1px] border-[#104992]/[.85] mr-[4px]"}>
          <div className={"h-full w-[65px] bg-[#2A8DFE]/[.5] content-center"}>Dock</div>
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
          <div className={"h-full w-[65px] bg-[#2A8DFE]/[.5] content-center"}>M30</div>
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
              <div className={"col-span-2 content-center"}>
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger>
                      <span
                        onClick={onClickFightControl}
                        className={cn("w-[22px] h-[22px] content-center border-[1px] border-[#43ABFF] cursor-pointer",
                          isRemoteControl ? "bg-[#43ABFF]" : "")}>
                        <img src={remoteControlPng} alt=""/>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isRemoteControl ? "离开远程控制" : "进入远程控制"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
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
            {isRemoteControl ? <KeyboardControl onMouseUp={onMouseUp} onMouseDown={onMouseDown}/> :
              <img src={yjqfPng} alt="" className={"cursor-pointer"} onClick={show}/>}
          </div>
          <div className={"border-r-[1px] border-r-[#104992]/[.85] h-full content-center"}>
            <img src={compassPng} alt=""/>
          </div>
          <div className={"flex flex-col text-[12px] text-[#D0D0D0] justify-center px-4"}>
            <span>指点飞行</span>
            <span>--</span>
            <span>返航</span>
            <span>--</span>
            <div className={"flex items-center space-x-4 bg-[#104992]/[.85] px-2 py-[2px] cursor-pointer"}
                 onClick={onClickCockpit}>
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

