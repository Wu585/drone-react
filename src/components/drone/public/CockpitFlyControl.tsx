import CockpitTitle from "@/components/drone/public/CockpitTitle.tsx";
import Keyboard from "@/components/drone/public/Keyboard.tsx";
import {ArrowDown, ArrowUp, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, RedoDot} from "lucide-react";
import CockpitButton from "@/components/drone/public/CockpitButton.tsx";
import {cn} from "@/lib/utils.ts";
import remoteControlPng from "@/assets/images/drone/remote-control.png";
import {useFlightControl} from "@/hooks/drone/useFlightControl.ts";
import {useMqtt} from "@/hooks/drone/use-mqtt.ts";
import {useManualControl} from "@/hooks/drone/useManualControl.ts";
import {DeviceCmdItem, noDebugCmdList} from "@/types/device-cmd.ts";
import {useDockControl} from "@/hooks/drone/useDockControl.ts";
import {toast} from "@/components/ui/use-toast.ts";
import {useSceneStore} from "@/store/useSceneStore.ts";

const CockpitFlyControl = () => {
  const {
    isRemoteControl,
    exitFlightControl,
    enterFlightControl,
    deviceTopicInfo,
    outRemoteControl
  } = useFlightControl();
  const {sendDockControlCmd} = useDockControl();
  const osdVisible = useSceneStore(state => state.osdVisible);
  useMqtt(deviceTopicInfo);

  const {
    handleKeyup,
    handleEmergencyStop,
    resetControlState,
  } = useManualControl(deviceTopicInfo, isRemoteControl);

  const onClickFightControl = async () => {
    if (isRemoteControl) {
      await exitFlightControl();
      return;
    }
    await enterFlightControl();
  };

  const sendControlCmd = async (cmdItem: DeviceCmdItem) => {
    try {
      await sendDockControlCmd({
        sn: osdVisible.gateway_sn || "",
        cmd: cmdItem.cmdKey,
        action: cmdItem.action
      }, false);
      toast({
        description: "返航成功！"
      });
      isRemoteControl && await exitFlightControl();
      outRemoteControl();
    } catch (err) {
      toast({
        description: `${err}`,
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <div className={"flex justify-between pr-14"}>
        <CockpitTitle title={"飞行控制"}/>
        <span
          onClick={onClickFightControl}
          className={cn("w-[22px] h-[22px] content-center border-[1px] border-[#43ABFF] cursor-pointer",
            isRemoteControl ? "bg-[#43ABFF]" : "")}>
                        <img src={remoteControlPng} alt=""/>
        </span>
      </div>

      <div className={"grid grid-cols-4 px-[48px] pt-[24px] gap-[32px]"}>
        <div className={"col-span-3 grid grid-cols-3 gap-y-4"}>
          <div className={"content-center flex flex-col space-y-2"}>
            <RedoDot className={"transform scale-x-[-1]"}/>
            <Keyboard keyboard={"Q"}/>

          </div>
          <div className={"content-center flex flex-col space-y-2"}>
            <ChevronUp/>
            <Keyboard keyboard={"W"}/>
          </div>
          <div className={"content-center flex flex-col space-y-2"}>
            <RedoDot/>
            <Keyboard keyboard={"E"}/>
          </div>
          <div className={"content-center flex flex-col space-y-2"}>
            <Keyboard keyboard={"A"}/>
            <ChevronLeft/>
          </div>
          <div className={"content-center flex flex-col space-y-2"}>
            <Keyboard keyboard={"S"}/>
            <ChevronDown/>
          </div>
          <div className={"content-center flex flex-col space-y-2"}>
            <Keyboard keyboard={"D"}/>
            <ChevronRight/>
          </div>
        </div>
        <div className={"space-y-4"}>
          <div className={"content-center flex flex-col space-y-2"}>
            <ArrowUp/>
            <Keyboard keyboard={"↑"}/>
          </div>
          <div className={"content-center flex flex-col space-y-2"}>
            <Keyboard keyboard={"↓"}/>
            <ArrowDown/>
          </div>
        </div>
      </div>
      <div className={"px-[48px] pt-[24px] grid grid-cols-2 gap-x-[32px] gap-y-2"}>
        {noDebugCmdList.map(cmdItem =>
          <CockpitButton type={"button"} onClick={() => sendControlCmd(cmdItem)} key={cmdItem.cmdKey}>
            {cmdItem.operateText}
          </CockpitButton>)}
        <div className={"bg-break bg-full-size w-[117px] h-[36px] content-center cursor-pointer"} onClick={handleEmergencyStop}>
          急停
        </div>
      </div>

    </>
  );
};

export default CockpitFlyControl;

