import Keyboard from "@/components/drone/public/Keyboard.tsx";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp, Cog,
  Drone,
  RedoDot,
} from "lucide-react";
import {cn, uuidv4} from "@/lib/utils.ts";
import {useFlightControl} from "@/hooks/drone/useFlightControl.ts";
import {useMqtt} from "@/hooks/drone/use-mqtt.ts";
import {useManualControl} from "@/hooks/drone/useManualControl.ts";
import {DeviceCmdItem, noDebugCmdList} from "@/types/device-cmd.ts";
import {useDockControl} from "@/hooks/drone/useDockControl.ts";
import {toast} from "@/components/ui/use-toast.ts";
import {useSceneStore} from "@/store/useSceneStore.ts";
import {usePermission} from "@/hooks/drone";
import {Button} from "@/components/ui/button.tsx";
import titleIcon from "@/assets/images/drone/cockpit/title-icon.png";
import {getCustomSource} from "@/hooks/public/custom-source.ts";
import {CommonTooltip} from "@/components/drone/public/CommonTooltip.tsx";
import {IconButton} from "@/components/drone/public/IconButton.tsx";
import CustomPopover from "@/components/public/CustomPopover.tsx";
import {Label} from "@/components/ui/label.tsx";
import {CommonInput} from "@/components/drone/public/CommonInput.tsx";
import {ELocalStorageKey} from "@/types/enum.ts";
import {useAjax} from "@/lib/http.ts";
import {useEffect} from "react";
import {Updater, useImmer} from "use-immer";
import {CommonButton} from "@/components/drone/public/CommonButton.tsx";
import dayjs from "dayjs";

const MNG_API_PREFIX = "/manage/api/v1";

interface Props {
  sn?: string;
  flyParams: {
    commander_flight_height: string
    target_height: string
    rth_altitude: string
    height_limit: string
    distance_limit_status: {
      state: boolean
      distance_limit: string
    }
  };
  updateFlyParams?: Updater<{ commander_flight_height: string; target_height: string; }>;
}

const CockpitFlyControl = ({sn, flyParams, updateFlyParams}: Props) => {
  const workspaceId = localStorage.getItem(ELocalStorageKey.WorkspaceId)!;
  const {put} = useAjax();
  const {
    isRemoteControl,
    exitFlightControl,
    enterFlightControl,
    deviceTopicInfo,
    outRemoteControl
  } = useFlightControl(sn);
  const {sendDockControlCmd} = useDockControl();
  const osdVisible = useSceneStore(state => state.osdVisible);
  useMqtt(deviceTopicInfo);

  const {
    handleEmergencyStop,
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
        sn: osdVisible.gateway_sn || sn || "",
        cmd: cmdItem.cmdKey,
        action: cmdItem.action
      }, false);
      toast({
        description: "指令下发成功！"
      });
      // isRemoteControl && await exitFlightControl();
      getCustomSource("drone-wayline")?.entities.removeAll();
      outRemoteControl();
    } catch (err) {
      toast({
        description: "指令下发失败！",
        variant: "destructive"
      });
    }
  };

  const {hasPermission} = usePermission();
  const hasFlyControlPermission = hasPermission("Collection_DeviceControlBasic");

  const [_flyParams, _updateFlyParams] = useImmer({
    commander_flight_height: localStorage.getItem(ELocalStorageKey.CommanderFlightHeight) ? +localStorage.getItem(ELocalStorageKey.CommanderFlightHeight)! : "120",
    target_height: "120"
  });

  const {publishMqtt, subscribeMqtt} = useMqtt({
    sn: "",
    pubTopic: "",
    subTopic: ""
  });

  useEffect(() => {
    subscribeMqtt(`thing/product/${sn}/property/set_reply`, (message) => {
      const payloadStr = new TextDecoder("utf-8").decode(message?.payload);
      const payloadObj = JSON.parse(payloadStr);
      if (payloadObj.data.commander_flight_height?.result === 0) {
        updateFlyParams?.(() => _flyParams);
        localStorage.setItem(ELocalStorageKey.CommanderFlightHeight, _flyParams.commander_flight_height.toString());
        toast({
          description: "设置飞行参数成功！"
        });
      } else if (payloadObj.data.commander_flight_height && payloadObj.data.commander_flight_height?.result !== 0) {
        toast({
          description: "飞行参数设置失败！",
          variant: "destructive"
        });
      }
    });
  }, [subscribeMqtt, sn, _flyParams, updateFlyParams]);

  const onSetCommander_flight_height = async () => {
    /*try {
      await put(`${MNG_API_PREFIX}/devices/${workspaceId}/devices/${sn}/property`, {
        commander_flight_height: parseFloat(flyParams.commander_flight_height)
      });
      toast({
        description: "飞行参数设置成功！"
      });
    } catch (err) {
      toast({
        description: "飞行参数设置失败！",
        variant: "destructive"
      });
    }
    */
    publishMqtt(`thing/product/${sn}/property/set`, {
      "bid": uuidv4(),
      "data": {
        "commander_flight_height": +_flyParams.commander_flight_height
      },
      "tid": uuidv4(),
      "timestamp": dayjs().valueOf()
    });
  };

  return (
    <div className={""}>
      <div className={"flex justify-between pr-6 pt-2"}>
        <div className={"flex space-x-[16px] items-center whitespace-nowrap text-lg"}>
          <img src={titleIcon} alt="" className={"w-4"}/>
          <span>飞行控制</span>
          <CommonTooltip
            trigger={
              <CustomPopover
                align={"end"}
                trigger={
                  <IconButton>
                    <Cog size={16}/>
                  </IconButton>}
                content={<div className={"space-y-2"}>
                  <div className={"grid grid-cols-8 items-center"}>
                    <Label className={"col-span-3"}>飞行作业高：</Label>
                    <div className={"col-span-5 flex space-x-1"}>
                      <CommonInput
                        step="0.1"
                        type={"number"}
                        value={_flyParams?.commander_flight_height || ""}
                        onChange={event => _updateFlyParams?.(draft => {
                          draft.commander_flight_height = event.target.value;
                        })}/>
                      <span>m</span>
                    </div>
                  </div>
                  <div className={"grid grid-cols-8 items-center"}>
                    <Label className={"col-span-3"}>目标点高度：</Label>
                    <div className={"col-span-5 flex space-x-1"}>
                      <CommonInput
                        type={"number"}
                        step="0.1"
                        value={_flyParams?.target_height || ""}
                        onChange={event => _updateFlyParams?.(draft => {
                          draft.target_height = event.target.value;
                        })}/>
                      <span>m</span>
                    </div>
                  </div>
                  <div className={"flex"}>
                    <CommonButton className={"ml-auto"} onClick={onSetCommander_flight_height}>确认</CommonButton>
                  </div>
                </div>}
              />}>
            <span className={"text-base"}>飞行设置</span>
          </CommonTooltip>

        </div>
        {hasFlyControlPermission && <CommonTooltip
          trigger={<span
            onClick={onClickFightControl}
            className={cn("w-[32px] content-center border-[1px] border-[#43ABFF] cursor-pointer",
              isRemoteControl ? "bg-[#43ABFF]" : "")}>
                        {/*<img src={remoteControlPng} className={"w-[24px]"} alt=""/>*/}
            <Drone className={"w-[24px]"}/>
        </span>}>
          <span className={"text-base"}>{isRemoteControl ? "退出飞行控制" : "进入飞行控制"}</span>
        </CommonTooltip>}
      </div>

      <div className={"grid grid-cols-4 px-[12px] pt-[12px] gap-[32px]"}>
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
      <div className={"flex h-[100px] space-x-4 py-2 px-6"}>
        <div className={"w-1/2 flex flex-col space-y-[4px]"}>
          {noDebugCmdList.map(cmdItem =>
            <Button style={{
              backgroundSize: "100% 100%"
            }} className={"bg-cockpit-button text-lg"} disabled={!hasFlyControlPermission} type={"button"}
                    onClick={() => sendControlCmd(cmdItem)}
                    key={cmdItem.cmdKey}>
              {cmdItem.operateText}
            </Button>)}
        </div>
        <Button
          style={{
            backgroundSize: "100% 100%"
          }}
          disabled={!hasFlyControlPermission}
          className={"bg-break w-1/2 h-full text-lg"}
          onClick={handleEmergencyStop}>
          急停 Space
        </Button>
      </div>
    </div>
  );
};

export default CockpitFlyControl;

