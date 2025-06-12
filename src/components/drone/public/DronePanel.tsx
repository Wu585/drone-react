import {useAjax} from "@/lib/http.ts";
import {
  Airplay,
  Earth,
  LandPlot,
  Rocket,
  Satellite,
  Settings,
  Thermometer,
  ThermometerSun,
  X,
  Forward, CircleStop, BatteryFull
} from "lucide-react";
import yjqfPng from "@/assets/images/drone/yjqf.png";
import {useSceneStore} from "@/store/useSceneStore.ts";
import TakeOffFormPanel from "@/components/drone/public/TakeOffFormPanel.tsx";
import {useVisible} from "@/hooks/public/utils.ts";
import remoteControlPng from "@/assets/images/drone/remote-control.png";
import compassPng from "@/assets/images/drone/compass.png";
import pointerPng from "@/assets/images/drone/pointer.png";
import {cn} from "@/lib/utils.ts";
import KeyboardControl from "@/components/drone/public/KeyboardControl.tsx";
import {useNavigate} from "react-router-dom";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {toast} from "@/components/ui/use-toast.ts";
import {memo, useEffect, useMemo, useRef, useState} from "react";
import {useMqtt} from "@/hooks/drone/use-mqtt.ts";
import {KeyCode, useManualControl} from "@/hooks/drone/useManualControl.ts";
import {useRealTimeDeviceInfo} from "@/hooks/drone/device.ts";
import {EDockModeCode, EDockModeCodeMap, EModeCode, EModeCodeMap} from "@/types/device.ts";
import {Button} from "@/components/ui/button.tsx";
import {useDockControl} from "@/hooks/drone/useDockControl.ts";
import {DeviceCmdItem, noDebugCmdList} from "@/types/device-cmd.ts";
import {useFlightControl} from "@/hooks/drone/useFlightControl.ts";
import DebugPanel from "@/components/drone/public/DebugPanel.tsx";
import {copyToClipboard} from "@/hooks/drone/media";
import PermissionButton from "@/components/drone/public/PermissionButton.tsx";
import {useDeviceLive} from "@/hooks/drone/useDeviceLive.ts";
import dockDemoPng from "@/assets/images/drone/dock-demo.png";
import droneDemoPng from "@/assets/images/drone/drone-demo.png";
import {usePermission} from "@/hooks/drone";

// DRC 链路
const DRC_API_PREFIX = "/control/api/v1";

const DronePanel = () => {
  const osdVisible = useSceneStore(state => state.osdVisible);
  const setOsdVisible = useSceneStore(state => state.setOsdVisible);
  const {visible, hide, show} = useVisible();
  const {visible: debugPanelvisible, hide: hideDebugPanel, show: showDebugPanel} = useVisible();
  const navigate = useNavigate();
  const deviceInfo = useRealTimeDeviceInfo(osdVisible.gateway_sn, osdVisible.sn);
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
    exitFlightControl,
    enterFlightControl,
    deviceTopicInfo,
    outRemoteControl
  } = useFlightControl();

  useMqtt(deviceTopicInfo);

  const onClickFightControl = async () => {
    if (isRemoteControl) {
      await exitFlightControl();
      return;
    }
    await enterFlightControl();
  };

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
    navigate(`/cockpit?sn=${osdVisible.sn}&gateway_sn=${osdVisible.gateway_sn}`);
  };

  const onStopFlyToPoint = async () => {
    await deleteClient(`${DRC_API_PREFIX}/devices/${osdVisible.gateway_sn}/jobs/fly-to-point`);
    toast({
      description: "停止飞行成功"
    });
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
    const url = `${base}video-share?sn=${osdVisible.gateway_sn}`;
    await copyToClipboard(url);
    toast({
      description: "直播链接已复制到粘贴板！"
    });
  };

  const onShareDroneLink = async () => {
    const base = import.meta.env.MODE === "development" ? "localhost:5173/#/" : "http://36.152.38.220:8920/#/";
    const url = `${base}video-share?sn=${osdVisible.sn}`;
    await copyToClipboard(url);
    toast({
      description: "直播链接已复制到粘贴板！"
    });
  };

  const headingDegrees = useMemo(() => {
    if (deviceInfo.device) {
      return deviceInfo.device.attitude_head;
    }
  }, [deviceInfo]);

  useEffect(() => {
    return () => {
      setOsdVisible({...osdVisible, visible: false});
    };
  }, []);

  const {hasPermission} = usePermission();
  const hasFlyControlPermission = hasPermission("Collection_DeviceControlBasic");

  const capacity_percent = deviceInfo && deviceInfo.device &&
    deviceInfo.device.battery.capacity_percent || deviceInfo.dock.work_osd?.drone_battery_maintenance_info?.batteries[0]?.capacity_percent;

  return (
    <div className={"flex relative"}>
      <div className={"w-[422px] bg-control-panel bg-full-size relative"}>
        <X onClick={() => setOsdVisible({...osdVisible, visible: !osdVisible.visible})}
           className={"absolute right-2 top-2 cursor-pointer"}/>
        <div className={"h-[46px] flex items-center pl-6 text-lg"}>
          {osdVisible.gateway_callsign} - {osdVisible.callsign ?? "暂无机器"}
        </div>
        <div className={"flex text-[12px] border-b-[1px] border-[#104992]/[.85] mr-[4px]"}>
          <div className={"w-[65px] bg-[#2A8DFE]/[.5] content-center cursor-pointer"} onClick={onPintoDock}>
            <img src={dockDemoPng} alt=""/>
          </div>
          <div className={"flex-1 p-[12px] space-y-2 bg-[#001E37]/[.9]"}>
            <div className={"grid grid-cols-4"}>
              <span className={"col-span-1 py-[2px] text-[#40F2FF] text-base"}>设备状态</span>
              <div
                className={cn("col-span-3 py-[2px] bg-[#52607D] pl-4 font-bold flex items-center text-base",
                  deviceInfo?.dock?.basic_osd?.mode_code === EDockModeCode.Disconnected ? "text-red-500" : "text-[#00ee8b]")}>
                {EDockModeCodeMap[deviceInfo?.dock?.basic_osd?.mode_code]}
              </div>
            </div>
            <div className={"grid grid-cols-4 whitespace-nowrap text-sm"}>
              <TooltipProvider delayDuration={300}>
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
              </TooltipProvider>
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger>
                    <div className={"flex items-center  grid-cols-2 gap-x-[2px]"}>
                      <span><ThermometerSun size={10}/></span>
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
                    <div className={"flex items-center  grid-cols-2 gap-x-[2px]"}>
                      <span><Thermometer size={10}/></span>
                      <span>{deviceInfo.dock?.basic_osd?.temperature} °C</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>机场温度</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider delayDuration={300}>
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
              </TooltipProvider>
            </div>
            <div className={"flex justify-between text-base"}>
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
                className={cn("h-[24px] rounded-[2px] px-20 cursor-pointer content-center py-[2px] bg-[#104992]/[.85] text-base",
                  dockVideoVisible ? "border-[#43ABFF] border-[1px]" : "")}>
                机场直播
              </PermissionButton>
              <div className={"col-span-4 content-center flex justify-end space-x-4"}>
                {dockVideoVisible && (
                  <div className={"flex h-[24px] space-x-4"}>
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
        <div className={"flex text-[12px] border-b-[1px] border-[#104992]/[.85] mr-[4px]"}>
          <div className={"flex flex-col w-[65px] bg-[#2A8DFE]/[.5] content-center text-center cursor-pointer"}
               onClick={onPointDrone}>
            <img src={droneDemoPng} alt=""/>
            {/*{osdVisible.model}*/}
          </div>
          <div className={"flex-1 p-[12px] space-y-2 bg-[#001E37]/[.9]"}>
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
                    className={cn("col-span-8 border-[#43ABFF] rounded-[2px] cursor-pointer content-center py-[2px] bg-[#104992]/[.85] text-base",
                      droneVideoVisible ? "border-[#43ABFF] border-[1px]" : "")}>
                    飞行器直播
                  </span>
                  <div className={"col-span-4 content-center flex justify-end space-x-2"}>
                    {droneVideoVisible && (
                      <div className={"flex space-x-2"}>
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
                    {hasFlyControlPermission && <TooltipProvider delayDuration={100}>
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
                    </TooltipProvider>}
                  </div>
                </>
              )}
            </div>
            <video
              ref={droneVideoRef}
              controls
              autoPlay
              className={cn(
                deviceStatus !== EModeCode[EModeCode.Disconnected] && droneVideoVisible ? "h-64" : "h-0"
              )}
            />
          </div>
        </div>
        <div
          className={"mr-[4px] grid grid-cols-4 bg-[#001E37]/[.9] border-b-[1px] border-[#104992]/[.85] text-[12px] pl-4 py-2 gap-y-2"}>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger>
                <div className={"flex items-center space-x-2"}>
                  <Satellite size={18}/>
                  <span>{deviceInfo.device ? deviceInfo.device?.position_state?.rtk_number : str}</span></div>
              </TooltipTrigger>
              <TooltipContent>
                <p>搜星质量</p>
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
          {/*<TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger>
                <div className={"flex items-center space-x-2"}>
                  <HardDriveUpload size={14}/>
                  <span>{deviceInfo.dock?.link_osd?.sdr?.up_quality || str}</span></div>
              </TooltipTrigger>
              <TooltipContent>
                <p>上传质量</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>*/}
          {/*<TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger>
                <div className={"flex items-center space-x-2"}>
                  <HardDriveDownload size={14}/>
                  <span>{deviceInfo.dock?.link_osd?.sdr?.down_quality || str}</span></div>
              </TooltipTrigger>
              <TooltipContent>
                <p>下载质量</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>*/}
          {/*<TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger>
                <div className={"flex items-center space-x-2"}>
                  <span className={"text-[12px]"}>GPS</span>
                  <span>{deviceInfo.device ? deviceInfo.device?.position_state.gps_number : str}</span></div>
              </TooltipTrigger>
              <TooltipContent>
                <p>GPS</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>*/}
          {/*<TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger>
                <div className={"flex items-center space-x-2"}>
                  <Eclipse size={14}/>
                  <span>{deviceInfo.device ? EGear[deviceInfo.device?.gear] : str}</span></div>
              </TooltipTrigger>
              <TooltipContent>
                <p>飞行模式</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>*/}
          <TooltipProvider delayDuration={300}>
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
          </TooltipProvider>
          <TooltipProvider delayDuration={300}>
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
          </TooltipProvider>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger>
                <div className={"flex items-center space-x-2"}>
                  <LandPlot size={18}/>
                  <span>{deviceInfo.device && deviceInfo.device.home_distance !== str ? parseFloat(deviceInfo.device?.home_distance?.toString())?.toFixed(2) + " m" : str}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>离Home点距离</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={300}>
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
          </TooltipProvider>
          <TooltipProvider delayDuration={300}>
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
          </TooltipProvider>
          <TooltipProvider delayDuration={300}>
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
          </TooltipProvider>
        </div>
        <div className={"bg-[#001E37]/[.9] mr-[4px] py-2 grid grid-cols-3"}>
          {hasFlyControlPermission ?
            <div className={"border-r-[1px] border-r-[#104992]/[.85] h-full content-center"}>
              {isRemoteControl ? <KeyboardControl onMouseUp={onMouseUp} onMouseDown={onMouseDown}/> :
                <img src={yjqfPng} alt="" className={"cursor-pointer"} onClick={() => {
                  show();
                  setTakeOffType("take-off");
                  hideDebugPanel();
                }}/>}
            </div> : <div
              className={"border-r-[1px] border-r-[#104992]/[.85] h-full content-center text-sm text-[#d0d0d0]"}>无飞控权限</div>}
          <div className={"border-r-[1px] border-r-[#104992]/[.85] h-full content-center relative"}>
            <img src={compassPng} alt=""
                 style={{
                   transform: `rotate(${-(headingDegrees || 0)}deg)`,
                   transition: "transform 0.3s ease-out"
                 }}
                 className={"will-change-transform"}/>
            <img src={pointerPng} alt="" className={"absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"}/>
          </div>
          <div className={"flex flex-col text-[12px] text-[#D0D0D0] justify-center px-2 space-y-2 text-sm"}>
            {hasFlyControlPermission && <span>指点飞行</span>}
            {hasFlyControlPermission && <div className={"flex space-x-2"}>
              <Button className={"bg-[#104992]/[.85] h-6 w-14 text-base"} onClick={() => {
                show();
                setTakeOffType("fly-to");
                hideDebugPanel();
              }}>飞行</Button>
              <Button className={"bg-[#104992]/[.85] h-6 w-14 text-base"} onClick={onStopFlyToPoint}>取消</Button>
            </div>}
            {hasFlyControlPermission && <span className={"text-base"}>返航</span>}
            {hasFlyControlPermission && <div className={"flex space-x-2"}>
              {noDebugCmdList.map(cmdItem =>
                <Button key={cmdItem.cmdKey} onClick={() => sendControlCmd(cmdItem)}
                        className={"bg-[#104992]/[.85] h-6 w-14"}>{cmdItem.operateText}</Button>)}
            </div>}
            <PermissionButton permissionKey={"Button_EnterVirtualCockpit"}
                              className={"content-center space-x-4 h-[24px] bg-[#104992]/[.85] px-2 py-[2px] cursor-pointer text-base"}
                              onClick={onClickCockpit}>
              <Airplay size={16}/>
              <span className={"text-base"}>虚拟座舱</span>
            </PermissionButton>
          </div>
        </div>
      </div>
      <div className={"absolute left-full"}>
        {visible && <TakeOffFormPanel type={takeOffType} sn={osdVisible.gateway_sn || ""} onClose={hide}/>}
        {debugPanelvisible && <DebugPanel sn={osdVisible.gateway_sn || ""} onClose={hideDebugPanel}/>}
      </div>
    </div>
  );
};

export default memo(DronePanel);

