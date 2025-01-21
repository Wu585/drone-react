import {useAjax} from "@/lib/http.ts";
import {
  Airplay,
  Earth, Eclipse, HardDriveDownload,
  HardDriveUpload, LandPlot,
  Rocket,
  Satellite,
  Settings,
  Thermometer,
  ThermometerSun,
  X,
  Zap
} from "lucide-react";
import yjqfPng from "@/assets/images/drone/yjqf.png";
import {useSceneStore} from "@/store/useSceneStore.ts";
import TakeOffFormPanel from "@/components/drone/public/TakeOffFormPanel.tsx";
import {useVisible} from "@/hooks/public/utils.ts";
import remoteControlPng from "@/assets/images/drone/remote-control.png";
import compassPng from "@/assets/images/drone/compass.png";
import {cn, convertWebRTCtoHTTP, extractIPFromRTMP} from "@/lib/utils.ts";
import KeyboardControl from "@/components/drone/public/KeyboardControl.tsx";
import {useNavigate} from "react-router-dom";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {toast} from "@/components/ui/use-toast.ts";
import {memo, useState} from "react";
import {useMqtt} from "@/hooks/drone/use-mqtt.ts";
import {KeyCode, useManualControl} from "@/hooks/drone/useManualControl.ts";
import {useRealTimeDeviceInfo} from "@/hooks/drone/device.ts";
import {EDockModeCode, EGear, EModeCode} from "@/types/device.ts";
import {Button} from "@/components/ui/button.tsx";
import {useDockControl} from "@/hooks/drone/useDockControl.ts";
import {DeviceCmdItem, noDebugCmdList} from "@/types/device-cmd.ts";
import {CURRENT_CONFIG} from "@/lib/config.ts";
import {useVideoJS} from "react-hook-videojs";
import {useCapacity} from "@/hooks/drone";
import {useFlightControl} from "@/hooks/drone/useFlightControl.ts";
import {useMapTool} from "@/hooks/drone/map/useMapTool.ts";
import {GeojsonCoordinate} from "@/types/map.ts";
import {wgs84togcj02} from "@/vendor/coordtransform.ts";

// DRC 链路
const DRC_API_PREFIX = "/control/api/v1";

const MANAGE_HTTP_PREFIX = "/manage/api/v1";

const getGcj02 = <T extends GeojsonCoordinate | GeojsonCoordinate[]>(coordinate: T): T => {
  if (coordinate[0] instanceof Array) {
    return (coordinate as GeojsonCoordinate[]).map(c => wgs84togcj02(c[0], c[1])) as T;
  }
  return wgs84togcj02(coordinate[0], coordinate[1]);
};

const DronePanel = () => {
  const osdVisible = useSceneStore(state => state.osdVisible);
  const setOsdVisible = useSceneStore(state => state.setOsdVisible);
  const {visible, hide, show} = useVisible();
  const navigate = useNavigate();
  const deviceInfo = useRealTimeDeviceInfo();
  const [takeOffType, setTakeOffType] = useState<"take-off" | "fly-to">("take-off");
  const {sendDockControlCmd} = useDockControl();
  const {visible: dockVideoVisible, show: showDockVideo, hide: hideDockVideo} = useVisible();
  const {data: capacityData} = useCapacity();

  const str = "--";

  const {post, delete: deleteClient} = useAjax();

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

  const onStartLiveStream = async () => {
    const dockSn = osdVisible.gateway_sn;
    const videoId = capacityData?.find(item => item.sn === dockSn)?.cameras_list[0].index;
    if (!videoId) return;
    showDockVideo();
    try {
      const res: any = await post(`${MANAGE_HTTP_PREFIX}/live/streams/start`, {
        url: CURRENT_CONFIG.rtmpURL,
        url_type: 1,
        video_id: `${dockSn}/${videoId}/normal-0`,
        video_quality: 0
      });
      toast({
        description: "机场开启直播！"
      });
      setDockVideoSrc(convertWebRTCtoHTTP(res.data.data.url));
    } catch (err: any) {
      if (err.data.code === 513003) {
        console.log(`http://${extractIPFromRTMP(CURRENT_CONFIG.rtmpURL)}:8080/live/${dockSn}-${videoId}.m3u8`);
        setDockVideoSrc(`http://${extractIPFromRTMP(CURRENT_CONFIG.rtmpURL)}:8080/live/${dockSn}-${videoId}.m3u8`);
      }
    }
  };

  const onStopLiveStream = async () => {
    const dockSn = osdVisible.gateway_sn;
    const videoId = capacityData?.find(item => item.sn === dockSn)?.cameras_list[0].index;
    hideDockVideo();
    await post(`${MANAGE_HTTP_PREFIX}/live/streams/stop`, {
      video_id: `${dockSn}/${videoId}/normal-0`
    });
    toast({
      description: "机场停止直播"
    });
    setDockVideoSrc("");
  };

  const [dockVideoSrc, setDockVideoSrc] = useState("");
  const [deviceVideoSrc, setDeviceVideoSrc] = useState("");

  const {Video} = useVideoJS({
    controls: true,
    autoplay: true,
    // preload: "auto",
    fluid: true,
    sources: [{src: dockVideoSrc}],
  });

  const {Video: DeviceVideo} = useVideoJS({
    controls: true,
    autoplay: true,
    // preload: "auto",
    fluid: true,
    sources: [{src: deviceVideoSrc}],
  });

  const dockStatus = !deviceInfo.device ? EModeCode[EModeCode.Disconnected] : EModeCode[deviceInfo.device?.mode_code];
  const deviceStatus = !deviceInfo.device ? EModeCode[EModeCode.Disconnected] : EModeCode[deviceInfo.device?.mode_code];

  const onStartDeviceLivestream = async () => {
    const sn = osdVisible.sn;
    const videoId = capacityData?.find(item => item.sn === sn)?.cameras_list[0].index;
    if (!videoId) {
      return toast({
        description: "飞行器直播准备中!"
      });
    }
    try {
      const res: any = await post(`${MANAGE_HTTP_PREFIX}/live/streams/start`, {
        url: CURRENT_CONFIG.rtmpURL,
        url_type: 1,
        video_id: `${sn}/${videoId}/normal-0`,
        video_quality: 0
      });
      toast({
        description: "飞行器开启直播！"
      });
      // setDeviceVideoSrc("http://106.14.197.27:8080/live/1581F5BMD239S002ZGK5-39-0-7.m3u8");
      setDeviceVideoSrc(convertWebRTCtoHTTP(res.data.data.url));
    } catch (err: any) {
      if (err.data.code === 513003) {
        console.log(`http://${extractIPFromRTMP(CURRENT_CONFIG.rtmpURL)}:8080/live/${sn}-${videoId}.m3u8`);
        setDeviceVideoSrc(`http://${extractIPFromRTMP(CURRENT_CONFIG.rtmpURL)}:8080/live/${sn}-${videoId}.m3u8`);
      }
    }
  };

  const onStopDeviceLivestream = async () => {
    const sn = osdVisible.sn;
    const videoId = capacityData?.find(item => item.sn === sn)?.cameras_list[0].index;
    await post(`${MANAGE_HTTP_PREFIX}/live/streams/stop`, {
      video_id: `${sn}/${videoId}/normal-0`
    });
    toast({
      description: "飞行器停止直播！"
    });
    setDeviceVideoSrc("");
  };

  const useMapToolHook = useMapTool();
  const onPintoDock = () => {
    const coordinate = getGcj02([deviceInfo.dock.basic_osd.longitude, deviceInfo.dock.basic_osd.latitude]);
    useMapToolHook.panTo(coordinate);
  };

  return (
    <div className={"flex relative"}>
      <div className={"w-[422px] bg-control-panel bg-full-size relative"}>
        <X onClick={() => setOsdVisible({...osdVisible, visible: !osdVisible.visible})}
           className={"absolute right-2 top-2 cursor-pointer"}/>
        <div className={"h-[46px] flex items-center pl-6"}>
          DJI Dock
        </div>
        <div className={"flex text-[12px] border-b-[1px] border-[#104992]/[.85] mr-[4px]"}>
          <div className={"w-[65px] bg-[#2A8DFE]/[.5] content-center"} onClick={onPintoDock}>Dock</div>
          <div className={"flex-1 p-[12px] space-y-2 bg-[#001E37]/[.9]"}>
            <div className={"grid grid-cols-4"}>
              <span className={"col-span-1 py-[2px] text-[#40F2FF]"}>设备状态</span>
              <div
                className={cn("col-span-3 py-[2px] bg-[#52607D] pl-4 font-bold",
                  deviceInfo.dock.basic_osd?.mode_code === EDockModeCode.Disconnected ? "text-red-500" : "text-[#00ee8b]")}>
                {EDockModeCode[deviceInfo.dock.basic_osd?.mode_code]}
              </div>
            </div>
            <div className={"grid grid-cols-4 whitespace-nowrap"}>
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger>
                    <div className={"flex items-center  grid-cols-2 gap-x-[2px]"}>
                      <span><Rocket size={10}/></span>
                      <span>{deviceInfo.dock.basic_osd?.drone_in_dock ? "是" : "否"}</span>
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
                      <span>{deviceInfo.dock.basic_osd?.environment_temperature}°C</span>
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
                      <span>{deviceInfo.dock.basic_osd?.temperature} °C</span>
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
                    <div className={"flex items-center  grid-cols-2 gap-x-[2px]"}>
                      <span><Earth size={10}/></span>
                      <span>{deviceInfo.dock.basic_osd?.network_state?.rate} kb/s</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>网络状态</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className={"grid grid-cols-12"}>
              <span
                onClick={() => dockVideoVisible ? onStopLiveStream() : onStartLiveStream()}
                className={cn("col-span-10 rounded-[2px] cursor-pointer content-center py-[2px] bg-[#104992]/[.85]", dockVideoVisible ? "border-[#43ABFF] border-[1px]" : "")}>
                机场直播
              </span>
              <span className={"col-span-2 content-center"}>
                <Settings size={17}/>
              </span>
            </div>
            {dockVideoSrc && <div className={"h-48"}>
              <Video className={"video-js vjs-default-skin"}/>
            </div>}
          </div>
        </div>
        <div className={"flex text-[12px] border-b-[1px] border-[#104992]/[.85] mr-[4px]"}>
          <div className={"w-[65px] bg-[#2A8DFE]/[.5] content-center text-center"}>
            {osdVisible.model}
          </div>
          <div className={"flex-1 p-[12px] space-y-2 bg-[#001E37]/[.9]"}>
            <div className={"grid grid-cols-4"}>
              <span className={"col-span-1 py-[2px] text-[#40F2FF]"}>设备状态</span>
              <div
                className={cn("col-span-3 py-[2px] bg-[#52607D] pl-4 font-bold",
                  !deviceInfo.device || deviceInfo.device?.mode_code === EModeCode.Disconnected ? "text-red-500" : "text-[#00ee8b]")}>
                {deviceStatus}
              </div>
            </div>
            <div className={"grid grid-cols-12"}>
              {deviceStatus === EModeCode[EModeCode.Disconnected] ? <span
                className={"col-span-10 text-[#9F9F9F] cursor-pointer content-center py-[2px]"}>
              当前设备已关机，无法进行直播
            </span> : <span
                onClick={deviceVideoSrc ? onStopDeviceLivestream : onStartDeviceLivestream}
                className={cn("col-span-10 border-[#43ABFF] rounded-[2px] cursor-pointer content-center py-[2px] bg-[#104992]/[.85]", deviceVideoSrc ? "border-[#43ABFF] border-[1px]" : "")}>
              飞行器直播
            </span>}
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
              {/*<span className={"col-span-2 content-center"}>
                <Forward size={17}/>
              </span>*/}
            </div>
            {/*<div className={"grid grid-cols-12"}>
              {deviceStatus !== EModeCode[EModeCode.Disconnected] ? <span
                className={"col-span-10 border-[#43ABFF] rounded-[2px] cursor-pointer content-center py-[2px] bg-[#104992]/[.85]"}>
                飞行器直播
              </span> : <span className={"col-span-10"}></span>}
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
            </div>*/}
            {deviceStatus !== EModeCode[EModeCode.Disconnected] && deviceVideoSrc && <div className={"h-48"}>
              <DeviceVideo className={"video-js vjs-default-skin"}/>
            </div>}
          </div>
        </div>
        <div
          className={"h-[90px] mr-[4px] grid grid-cols-4 bg-[#001E37]/[.9] border-b-[1px] border-[#104992]/[.85] text-[12px] pl-4"}>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger>
                <div className={"flex items-center space-x-2"}>
                  <Satellite size={14}/>
                  <span>{deviceInfo.device ? deviceInfo.device.position_state.rtk_number : str}</span></div>
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
                  <Zap size={14}/>
                  <span>{deviceInfo.device && deviceInfo.device.battery.capacity_percent !== str ? deviceInfo.device?.battery.capacity_percent + " %" : str}</span>
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
                  <HardDriveUpload size={14}/>
                  <span>{deviceInfo.dock.link_osd?.sdr?.up_quality || str}</span></div>
              </TooltipTrigger>
              <TooltipContent>
                <p>上传质量</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger>
                <div className={"flex items-center space-x-2"}>
                  <HardDriveDownload size={14}/>
                  <span>{deviceInfo.dock.link_osd?.sdr?.down_quality || str}</span></div>
              </TooltipTrigger>
              <TooltipContent>
                <p>下载质量</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger>
                <div className={"flex items-center space-x-2"}>
                  <span className={"text-[12px]"}>GPS</span>
                  <span>{deviceInfo.device ? deviceInfo.device.position_state.gps_number : str}</span></div>
              </TooltipTrigger>
              <TooltipContent>
                <p>GPS</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={300}>
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
          </TooltipProvider>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger>
                <div className={"flex items-center space-x-2"}>
                  <span className={"text-[12px]"}>ASL</span>
                  <span>{!deviceInfo.device || deviceInfo.device.height === str ? str : parseFloat(deviceInfo.device?.height).toFixed(2) + " m"}</span>
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
                  <span>{deviceInfo.device && deviceInfo.device.battery.capacity_percent !== str ? deviceInfo.device?.battery.capacity_percent + " m" : str}</span>
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
                  <LandPlot size={14}/>
                  <span>{deviceInfo.device && deviceInfo.device.battery.capacity_percent !== str ? deviceInfo.device?.battery.capacity_percent + " %" : str}</span>
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
                  <span>{!deviceInfo.device || deviceInfo.device?.horizontal_speed === str ? str : parseFloat(deviceInfo.device?.horizontal_speed).toFixed(2) + " m/s"}</span>
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
                  <span>{!deviceInfo.device || deviceInfo.device.vertical_speed === str ? str : parseFloat(deviceInfo.device?.horizontal_speed).toFixed(2) + " m/s"}</span>
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
          <div className={"border-r-[1px] border-r-[#104992]/[.85] h-full content-center"}>
            {isRemoteControl ? <KeyboardControl onMouseUp={onMouseUp} onMouseDown={onMouseDown}/> :
              <img src={yjqfPng} alt="" className={"cursor-pointer"} onClick={() => {
                show();
                setTakeOffType("take-off");
              }}/>}
          </div>
          <div className={"border-r-[1px] border-r-[#104992]/[.85] h-full content-center"}>
            <img src={compassPng} alt=""/>
          </div>
          <div className={"flex flex-col text-[12px] text-[#D0D0D0] justify-center px-2 space-y-2"}>
            <span>指点飞行</span>
            <div className={"flex space-x-2"}>
              <Button className={"bg-[#104992]/[.85] h-6 w-14"} onClick={() => {
                show();
                setTakeOffType("fly-to");
              }}>飞行</Button>
              <Button className={"bg-[#104992]/[.85] h-6 w-14"} onClick={onStopFlyToPoint}>取消</Button>
            </div>
            <span>返航</span>
            <div className={"flex space-x-2"}>
              {noDebugCmdList.map(cmdItem =>
                <Button key={cmdItem.cmdKey} onClick={() => sendControlCmd(cmdItem)}
                        className={"bg-[#104992]/[.85] h-6 w-14"}>{cmdItem.operateText}</Button>)}
            </div>
            <div className={"content-center space-x-4 bg-[#104992]/[.85] px-2 py-[2px] cursor-pointer"}
                 onClick={onClickCockpit}>
              <Airplay size={16}/>
              <span>虚拟座舱</span>
            </div>
          </div>
        </div>
      </div>
      <div className={"absolute left-full"}>
        {visible && <TakeOffFormPanel type={takeOffType} sn={osdVisible.gateway_sn || ""} onClose={hide}/>}
      </div>
    </div>
  );
};

export default memo(DronePanel);

