import {useAjax} from "@/lib/http.ts";
import {
  LandPlot,
  Rocket,
  Satellite,
  Settings,
  ThermometerSun,
  X,
  Forward, CircleStop, BatteryFull, Wind, CloudHail, Send, ClipboardList
} from "lucide-react";
import {useSceneStore} from "@/store/useSceneStore.ts";
import TakeOffFormPanel from "@/components/drone/public/TakeOffFormPanel.tsx";
import {useVisible} from "@/hooks/public/utils.ts";
import {cn} from "@/lib/utils.ts";
import KeyboardControl from "@/components/drone/public/KeyboardControl.tsx";
import {useNavigate} from "react-router-dom";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {toast} from "@/components/ui/use-toast.ts";
import {memo, useEffect, useMemo, useRef, useState} from "react";
import {useMqtt} from "@/hooks/drone/use-mqtt.ts";
import {KeyCode, useManualControl} from "@/hooks/drone/useManualControl.ts";
import {useRealTimeDeviceInfo} from "@/hooks/drone/device.ts";
import {EDockModeCode, EDockModeCodeMap, EModeCode, EModeCodeMap, RainfallMap} from "@/types/device.ts";
import {Button} from "@/components/ui/button.tsx";
import {useDockControl} from "@/hooks/drone/useDockControl.ts";
import {DeviceCmd} from "@/types/device-cmd.ts";
import {useFlightControl} from "@/hooks/drone/useFlightControl.ts";
import DebugPanel from "@/components/drone/public/DebugPanel.tsx";
import {copyToClipboard} from "@/hooks/drone/media";
import PermissionButton from "@/components/drone/public/PermissionButton.tsx";
import {useDeviceLive} from "@/hooks/drone/useDeviceLive.ts";
import dockDemoPng from "@/assets/images/drone/dock-demo.png";
import droneDemoPng from "@/assets/images/drone/drone-demo.png";
import {usePermission, useWaylinJobs} from "@/hooks/drone";
import {TaskStatus, TaskType} from "@/types/task.ts";
import {ELocalStorageKey} from "@/types/enum.ts";
import dayjs from "dayjs";
import {getCustomSource} from "@/hooks/public/custom-source.ts";
import {CommonButton} from "@/components/drone/public/CommonButton.tsx";

// DRC 链路
const DRC_API_PREFIX = "/control/api/v1";

const DronePanel = () => {
  const osdVisible = useSceneStore(state => state.osdVisible);
  const setOsdVisible = useSceneStore(state => state.setOsdVisible);
  const {visible, hide, show} = useVisible();
  const {visible: debugPanelvisible, hide: hideDebugPanel, show: showDebugPanel} = useVisible();
  const navigate = useNavigate();
  const deviceInfo = useRealTimeDeviceInfo(osdVisible.gateway_sn, osdVisible.sn);
  // console.log("deviceInfo");
  // console.log(deviceInfo);
  const [takeOffType, setTakeOffType] = useState<"take-off" | "fly-to">("take-off");
  const {sendDockControlCmd} = useDockControl();
  const {visible: dockVideoVisible, show: showDockVideo, hide: hideDockVideo} = useVisible();
  const {visible: droneVideoVisible, show: showDroneVideo, hide: hideDroneVideo} = useVisible();

  useEffect(() => {
    hideDockVideo();
    hideDroneVideo();
  }, [osdVisible]);

  const str = "--";

  const {delete: deleteClient} = useAjax();

  const {
    isRemoteControl,
    deviceTopicInfo,
  } = useFlightControl();

  useMqtt(deviceTopicInfo);

  const {
    resetControlState,
    handleKeyEvent
  } = useManualControl(deviceTopicInfo, isRemoteControl);

  const onMouseDown = (type: KeyCode) => {
    handleKeyEvent(type, true, true);
  };

  const onMouseUp = () => {
    resetControlState();
  };

  const onClickCockpit = () => {
    navigate(`/cockpit-new?sn=${osdVisible.sn}&gateway_sn=${osdVisible.gateway_sn}`);
  };

  const onClickReturnButton = async () => {
    getCustomSource("drone-wayline")?.entities.removeAll();
    viewer.entities.removeById("fly-point");
    try {
      if (deviceInfo?.device?.mode_code === EModeCode.Return_To_Home) {
        await sendDockControlCmd({
          sn: osdVisible.gateway_sn || "",
          cmd: DeviceCmd.ReturnHomeCancel,
        });
      } else {
        await sendDockControlCmd({
          sn: osdVisible.gateway_sn || "",
          cmd: DeviceCmd.ReturnHome,
        });
      }
      toast({
        description: "指令下发成功！"
      });
    } catch (err) {
      toast({
        description: "指令下发失败！",
        variant: "destructive"
      });
    }
  };

  const dockVideoRef = useRef<HTMLVideoElement>(null);
  const {
    startLive: startDockLive,
    stopLive: stopDockLive
  } = useDeviceLive(dockVideoRef.current, osdVisible.gateway_sn, osdVisible.gateway_sn);
  const droneVideoRef = useRef<HTMLVideoElement>(null);
  const {
    startLive: startDroneLive,
    stopLive: stopDroneLive
  } = useDeviceLive(droneVideoRef.current, osdVisible.gateway_sn, osdVisible.sn);

  const deviceStatus = useMemo(() => {
    return !deviceInfo.device ? EModeCodeMap[EModeCode.Disconnected] : EModeCodeMap[deviceInfo.device?.mode_code];
  }, [deviceInfo]);

  const onPintoDock = () => {
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(deviceInfo.dock.basic_osd.longitude, deviceInfo.dock.basic_osd.latitude, 100),
      duration: 1
    });
  };

  const onPointDrone = () => {
    if (!deviceInfo.device) return;
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(deviceInfo.device.longitude, deviceInfo.device.latitude, 200),
      duration: 1
    });
  };

  const onShareDockLink = async () => {
    const base = import.meta.env.MODE === "development" ? "localhost:5173/#/" : "http://36.152.38.220:8920/#/";
    const url = `${base}video-share?dockSn=${osdVisible.gateway_sn}`;
    await copyToClipboard(url);
    toast({
      description: "直播链接已复制到粘贴板！"
    });
  };

  const onShareDroneLink = async () => {
    const base = import.meta.env.MODE === "development" ? "localhost:5173/#/" : "http://36.152.38.220:8920/#/";
    const url = `${base}video-share?dockSn=${osdVisible.gateway_sn}&droneSn=${osdVisible.sn}`;
    await copyToClipboard(url);
    toast({
      description: "直播链接已复制到粘贴板！"
    });
  };

  useEffect(() => {
    return () => {
      setOsdVisible({...osdVisible, visible: false});
    };
  }, []);

  const {hasPermission} = usePermission();
  const hasFlyControlPermission = hasPermission("Collection_DeviceControlBasic");
  const hasVirtualCockpitPermission = hasPermission("Button_EnterVirtualCockpit");

  const capacity_percent = deviceInfo && deviceInfo.device &&
    deviceInfo.device.battery.capacity_percent || deviceInfo.dock.work_osd?.drone_battery_maintenance_info?.batteries[0]?.capacity_percent;

  // 是否适宜飞行
  const canFly = useMemo(() => {
    if (!deviceInfo || !deviceInfo.dock || !deviceInfo.dock.basic_osd) {
      return "--";
    }
    return deviceInfo.dock.basic_osd.wind_speed < 8 && deviceInfo.dock.basic_osd.rainfall < 1;
  }, [deviceInfo]);

  const workspaceId = localStorage.getItem(ELocalStorageKey.WorkspaceId)!;
  const departId = localStorage.getItem("departId")!;

  const {data: taskList} = useWaylinJobs(workspaceId, {
    page: 1,
    page_size: 10,
    start_time: "",
    end_time: "",
    task_type: undefined as TaskType | undefined,
    dock_sn: osdVisible.gateway_sn,
    keyword: "",
    status: undefined as TaskStatus | undefined,
    organs: departId ? [+departId] : undefined
  });

  const taskStaus = useMemo(() => {
    if (!taskList) return "暂无任务";
    if (taskList.list?.[0]?.status === TaskStatus.Wait) return "待执行";
    if (taskList.list?.[0]?.status === TaskStatus.Carrying) return "执行中";

    return "暂无任务";
  }, [taskList]);

  const taskTime = useMemo(() => {
    if (!taskList) return null;
    if (taskList.list?.[0]?.status === TaskStatus.Wait) {
      const task = taskList.list?.[0];
      if (task.begin_time) {
        return dayjs(task.begin_time).format("MM-DD HH:mm");
      }
    }
  }, [taskList]);

  return (
    <div className={"flex relative"}>
      <div className={"w-[422px] bg-control-panel bg-full-size relative"}>
        <X onClick={() => setOsdVisible({...osdVisible, visible: !osdVisible.visible})}
           className={"absolute right-2 top-2 cursor-pointer"}/>
        <div
          style={{
            backgroundSize: "100% 100%"
          }}
          className={"h-[39px] flex items-center pl-6 text-lg bg-control-header space-x-12"}>
          <div className={"text-[12px] flex flex-col items-center justify-center leading-4"}>
            <div className={"flex items-center space-x-[2px]"}>
              <ClipboardList size={12}/>
              <span>{taskStaus}</span>
            </div>
            <span>{taskTime}</span>
          </div>
          <span className={"text-[16px] pt-2"}>
           {osdVisible.gateway_callsign} - {osdVisible.callsign ?? "暂无机器"}
          </span>
        </div>
        <div className={"flex text-[12px] border-b-[1px] border-[#0C2D57]/[.85] mr-[4px]"}>
          <div
            className={"w-[65px] bg-gradient-to-r from-[#274177]/[.5] to-[#3661BA]/[.4] content-center cursor-pointer"}
            onClick={onPintoDock}>
            <img src={dockDemoPng} alt=""/>
          </div>
          <div className={"flex-1 p-[12px] space-y-2 "}>
            <div className={"grid grid-cols-4"}>
              <span className={"col-span-1 py-[2px] text-[#40F2FF] text-base"}>设备状态</span>
              <div
                className={cn("col-span-3 py-[2px] bg-[#52607D] pl-4 font-bold flex items-center text-base",
                  deviceInfo?.dock?.basic_osd?.mode_code === EDockModeCode.Disconnected ? "text-red-500" : "text-[#00ee8b]")}>
                {EDockModeCodeMap[deviceInfo?.dock?.basic_osd?.mode_code]}
              </div>
            </div>
            <div className={"grid grid-cols-4 whitespace-nowrap text-sm space-x-2"}>
              {/*<TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger>
                    <div className={"flex items-center grid-cols-2 gap-x-[2px]"}>
                      <span><Rocket size={10}/></span>
                      <span>{deviceInfo.dock?.basic_osd?.drone_in_dock ? "是" : "否"}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>无人机入舱</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>*/}
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger>
                    <div className={"flex items-center grid-cols-2 gap-x-[2px]"}>
                      <Send size={14}/>
                      <span>{canFly ? "适宜飞行" : "不适宜飞行"}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>是否适宜飞行</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger>
                    <div className={"flex items-center  grid-cols-2 gap-x-[6px]"}>
                      <ThermometerSun size={14}/>
                      <span>{deviceInfo.dock?.basic_osd?.environment_temperature}°C</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>环境温度</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger>
                    <div className={"flex items-center grid-cols-2 gap-x-[6px]"}>
                      <Wind size={14}/>
                      <span>{deviceInfo.dock?.basic_osd?.wind_speed} m/s</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>风速</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger>
                    <div className={"flex items-center  grid-cols-2 gap-x-[6px]"}>
                      <CloudHail size={14}/>
                      <span>{deviceInfo.dock?.basic_osd ? RainfallMap[deviceInfo.dock?.basic_osd?.rainfall] : "--"}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>降雨</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/*<TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger>
                    <div className={"flex items-center  grid-cols-2 gap-x-[2px]"}>
                      <span><Thermometer size={10}/></span>
                      <span>{deviceInfo.dock?.basic_osd?.temperature} °C</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>机场温度</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>*/}
              {/*<TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger>
                    <div className={"flex items-center grid-cols-2 gap-x-[2px]"}>
                      <span><Earth size={10}/></span>
                      <span>{deviceInfo.dock?.basic_osd?.network_state?.rate.toFixed(0)} kb/s</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>网络状态</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>*/}
            </div>
            <div className={"grid grid-cols-12"}>
              <PermissionButton
                permissionKey={"Collection_LiveStream"}
                onClick={() => {
                  if (dockVideoVisible) {
                    hideDockVideo();
                  } else {
                    showDockVideo();
                    startDockLive();
                  }
                }}
                className={cn("col-span-8 relative h-[24px] rounded-[2px] px-20 cursor-pointer content-center py-[2px] bg-[#2C4274]/[.85] text-base",
                  dockVideoVisible ? "border-[#4391FF] border-[1px]" : "")}>
                <div className={"w-[7px] h-[14px] absolute left-[4px] bg-[#4393FF] rounded-[1px]"}></div>
                <span>机场直播</span>
              </PermissionButton>
              <div className={"col-span-4  flex justify-start items-center px-4"}>
                {dockVideoVisible && (
                  <div className={"flex space-x-4 mr-4"}>
                    <Button
                      className={"px-0 bg-transparent h-[24px]"}
                      onClick={() => {
                        hideDockVideo();
                        stopDockLive();
                      }}>
                      <CircleStop
                        size={17}
                      />
                    </Button>
                    <PermissionButton className={"bg-transparent h-[24px] px-0"} permissionKey={"Button_LiveShare"}
                                      onClick={onShareDockLink}>
                      <Forward size={17} onClick={onShareDockLink}/>
                    </PermissionButton>
                  </div>
                )}
                <PermissionButton className={"h-[24px] bg-transparent px-0"} permissionKey={"Collection_DeviceDebug"}
                                  onClick={() => {
                                    hide();
                                    showDebugPanel();
                                  }}>
                  <Settings size={17}/>
                </PermissionButton>
              </div>
            </div>
            <video
              ref={dockVideoRef}
              controls
              autoPlay
              className={cn(
                dockVideoVisible ? "h-48" : "h-0",
              )}
            />
          </div>
        </div>
        <div className={"flex text-[12px] border-b-[1px] border-[#0C2D57]/[.85] mr-[4px]"}>
          <div
            className={"flex flex-col w-[65px] bg-gradient-to-r from-[#274177]/[.5] to-[#3661BA]/[.4] content-center text-center cursor-pointer"}
            onClick={onPointDrone}>
            <img src={droneDemoPng} alt=""/>
            {/*{osdVisible.model}*/}
          </div>
          <div className={"flex-1 p-[12px] space-y-2 "}>
            <div className={"grid grid-cols-4"}>
              <span className={"col-span-1 py-[2px] text-[#40F2FF] text-base"}>设备状态</span>
              <div
                className={cn("col-span-3 py-[2px] bg-[#52607D] pl-4 font-bold flex items-center text-base",
                  !deviceInfo.device || deviceInfo.device?.mode_code === EModeCode.Disconnected ? "text-red-500" : "text-[#00ee8b]")}>
                {deviceStatus}
              </div>
            </div>
            <div className={"grid grid-cols-12"}>
              {deviceStatus === EModeCodeMap[EModeCode.Disconnected] ? (
                <span className={"col-span-12 text-[#9F9F9F] cursor-pointer content-center py-[2px]"}>
                  当前设备已关机，无法进行直播
                </span>
              ) : (
                <>
                  <span
                    // onClick={() => droneVideoVisible ? onStopDroneLiveStream() : onStartDroneLiveStream()}
                    onClick={() => {
                      if (droneVideoVisible) {
                        hideDroneVideo();
                      } else {
                        showDroneVideo();
                        startDroneLive(false);
                      }
                    }}
                    className={cn("relative col-span-8 border-[#43ABFF] rounded-[2px] cursor-pointer content-center bg-[#2C4274]/[.85] text-base",
                      droneVideoVisible ? "border-[#4391FF] border-[1px]" : "")}>
                    <div className={"w-[7px] h-[14px] absolute left-[4px] bg-[#4393FF] rounded-[1px]"}></div>
                    <span>飞行器直播</span>
                  </span>
                  <div className={"col-span-4 flex justify-start items-center px-4"}>
                    {droneVideoVisible && (
                      <div className={"flex space-x-4"}>
                        <CircleStop
                          size={17}
                          className="cursor-pointer"
                          onClick={() => {
                            hideDroneVideo();
                            stopDroneLive(false);
                          }}
                        />
                        <Forward size={17} className="cursor-pointer" onClick={onShareDroneLink}/>
                      </div>
                    )}
                    {/*{hasFlyControlPermission && <TooltipProvider delayDuration={100}>
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
                    </TooltipProvider>}*/}
                  </div>
                </>
              )}
            </div>
            <video
              ref={droneVideoRef}
              controls
              autoPlay
              className={cn(
                deviceStatus !== EModeCode[EModeCode.Disconnected] && droneVideoVisible ? "h-48 aspect-video object-fill" : "h-0"
              )}
            />
          </div>
        </div>
        <div
          className={"mr-[4px] grid grid-cols-4 border-b-[1px] border-[#0C2D57]/[.85] text-[12px] pl-4 py-2 gap-y-2"}>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger>
                <div className={"flex items-center space-x-2"}>
                  <span><Rocket size={14}/></span>
                  <span>{deviceInfo.dock?.basic_osd?.drone_in_dock ? "是" : "否"}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>无人机入舱</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger>
                <div className={"flex items-center space-x-2"}>
                  <BatteryFull size={18}/>
                  <span>{capacity_percent ? capacity_percent + "%" : "--"}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>电量</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger>
                <div className={"flex items-center space-x-2"}>
                  <Satellite size={14}/>
                  <span>{deviceInfo.device ? deviceInfo.device?.position_state?.rtk_number : str}</span></div>
              </TooltipTrigger>
              <TooltipContent>
                <p>搜星质量</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {/*<TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger>
                <div className={"flex items-center space-x-2"}>
                  <span className={"text-[12px]"}>ASL</span>
                  <span>{!deviceInfo.device || deviceInfo.device?.height === str ? str : parseFloat(deviceInfo.device?.height).toFixed(2) + " m"}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>海拔高度</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>*/}
          {/*<TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger>
                <div className={"flex items-center space-x-2"}>
                  <span className={"text-[12px]"}>ALT</span>
                  <span>{deviceInfo.device && deviceInfo.device?.battery.capacity_percent !== str ? deviceInfo.device?.battery.capacity_percent + " m" : str}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>起飞高度</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>*/}
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger>
                <div className={"flex items-center space-x-2"}>
                  <LandPlot size={14}/>
                  <span>{deviceInfo.device && deviceInfo.device.home_distance !== str ? parseFloat(deviceInfo.device?.home_distance?.toString())?.toFixed(2) + " m" : str}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>离Home点距离</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {/*<TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger>
                <div className={"flex items-center space-x-2"}>
                  <span className={"text-[12px]"}>H.S</span>
                  <span>{!deviceInfo.device || deviceInfo.device.horizontal_speed === str ? str : parseFloat(deviceInfo.device?.horizontal_speed).toFixed(2) + " m/s"}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>水平速度</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>*/}
          {/*<TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger>
                <div className={"flex items-center space-x-2"}>
                  <span className={"text-[12px]"}>V.S</span>
                  <span>{!deviceInfo.device || deviceInfo.device.vertical_speed === str ? str : parseFloat(deviceInfo.device?.vertical_speed).toFixed(2) + " m/s"}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>垂直速度</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>*/}
          {/*<TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger>
                <div className={"flex items-center space-x-2"}>
                  <span className={"text-[12px]"}>W.S</span>
                  <span>{!deviceInfo.device || deviceInfo.device.wind_speed === str ? str : (parseFloat(deviceInfo.device?.wind_speed) / 10).toFixed(2) + " m/s"}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>风速</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>*/}
        </div>
        <div className={"mr-[4px] grid grid-cols-7 py-2"}>
          <div className={" h-full content-center col-span-2"}>
            {isRemoteControl ? <KeyboardControl onMouseUp={onMouseUp} onMouseDown={onMouseDown}/> :
              <CommonButton
                disabled={deviceInfo?.dock?.basic_osd?.mode_code !== EDockModeCode.Idle || !hasFlyControlPermission}
                onClick={() => {
                  show();
                  setTakeOffType("take-off");
                  hideDebugPanel();
                }}
                className={"bg-yjqf flex justify-center items-end w-[87px] h-[97px] cursor-pointer "} style={{
                backgroundSize: "100% 100%"
              }}>
                <span className={"mb-4 text-[12px]"}>一键起飞</span>
              </CommonButton>}
          </div>
          <div className={"h-full content-center col-span-3"}>
            <CommonButton
              disabled={!hasVirtualCockpitPermission}
              style={{
                backgroundSize: "100% 100%"
              }}
              className={"w-[163px] px-0 h-[96px] bg-xnzc flex items-end"} onClick={onClickCockpit}>
              <span className={"mb-4 text-[12px]"}>虚拟座舱</span>
            </CommonButton>
          </div>
          <div
            className={"text-[12px] text-[#D0D0D0] h-full content-center col-span-2"}>
            <CommonButton
              disabled={!hasFlyControlPermission}
              onClick={onClickReturnButton}
              className={"w-[87px] h-[97px] bg-yjfh flex items-end"}
              style={{
                backgroundSize: "100% 100%"
              }}>
              <span
                className={"mb-4 text-[12px]"}>{deviceInfo?.device?.mode_code === EModeCode.Return_To_Home ? "取消返航" : "一键返航"}
              </span>
            </CommonButton>
          </div>
        </div>
      </div>
      <div className={"absolute left-full"}>
        {visible && <TakeOffFormPanel type={takeOffType} sn={osdVisible.gateway_sn || ""} droneSn={osdVisible.sn || ""}
                                      onClose={hide}/>}
        {debugPanelvisible && <DebugPanel sn={osdVisible.gateway_sn || ""} onClose={hideDebugPanel}/>}
      </div>
    </div>
  );
};

export default memo(DronePanel);

