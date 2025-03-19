import FitScreen from "@fit-screen/react";
import batteryPng from "@/assets/images/drone/cockpit/battery.png";
import rtkPng from "@/assets/images/drone/cockpit/rtk.png";
import czsd from "@/assets/images/drone/cockpit/czsd.png";
import spsd from "@/assets/images/drone/cockpit/spsd.png";
import asl from "@/assets/images/drone/cockpit/asl.png";
import alt from "@/assets/images/drone/cockpit/alt.png";
import windSpeed from "@/assets/images/drone/cockpit/wind-speed.png";
import qsdjl from "@/assets/images/drone/cockpit/qsdjl.png";
import CockpitTitle from "@/components/drone/public/CockpitTitle.tsx";
import weatherBasePng from "@/assets/images/drone/cockpit/weather-base.png";
import cloudyPng from "@/assets/images/drone/cockpit/cloudy.png";
import humidityPng from "@/assets/images/drone/cockpit/humidity.png";
import rainyPng from "@/assets/images/drone/cockpit/rainy.png";
import windyPng from "@/assets/images/drone/cockpit/windy.png";
import windPowerPng from "@/assets/images/drone/cockpit/wind-power.png";
import CockpitFlyControl from "@/components/drone/public/CockpitFlyControl.tsx";
import {Input} from "@/components/ui/input.tsx";
import GMap from "@/components/drone/public/GMap.tsx";
import {clarityList, useDeviceVideo} from "@/hooks/drone/useDeviceVideo.ts";
import {useEffect, useState} from "react";
import {useInitialConnectWebSocket} from "@/hooks/drone/useConnectWebSocket.ts";
import {useSearchParams} from "react-router-dom";
import {useCapacity, useOnlineDocks} from "@/hooks/drone";
import {z} from "zod";
import {
  CommanderFlightModeInCommandFlightOptions,
  CommanderModeLostActionInCommandFlightOptions,
  ECommanderFlightMode,
  ECommanderModeLostAction,
  ERthMode,
  LostControlActionInCommandFLight, LostControlActionInCommandFLightOptions, RthModeInCommandFlightOptions,
  WaylineLostControlActionInCommandFlight, WaylineLostControlActionInCommandFlightOptions
} from "@/types/drone.ts";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {formSchema} from "@/components/drone/public/TakeOffFormPanel.tsx";
import {Form, FormControl, FormField, FormItem, FormLabel} from "@/components/ui/form.tsx";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Button} from "@/components/ui/button.tsx";
import yjqfPng from "@/assets/images/drone/cockpit/yjqf.png";
import {toast} from "@/components/ui/use-toast.ts";
import {useAjax} from "@/lib/http.ts";
import {useRealTimeDeviceInfo} from "@/hooks/drone/device.ts";
import {EModeCode, RainfallEnum} from "@/types/device.ts";
import {cn} from "@/lib/utils.ts";
import PayloadControl from "@/components/drone/PayloadControl.tsx";
import compassWrapperPng from "@/assets/images/drone/cockpit/compass-wrapper.png";
import compassPng from "@/assets/images/drone/cockpit/compass.png";
import {RefreshCcw, Settings, Maximize2, X} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {useDockLive} from "@/hooks/drone/useDockLive.ts";
import {useFullscreen} from "@/hooks/useFullscreen";
import TsaScene from "@/components/drone/public/TsaScene.tsx";

// DRC 链路
const DRC_API_PREFIX = "/control/api/v1";

const str = "--";

const Cockpit = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      target_latitude: "30.891961",
      target_longitude: "121.44556",
      target_height: "120",
      security_takeoff_height: "120",
      rth_altitude: "120",
      commander_flight_height: "120",
      rc_lost_action: LostControlActionInCommandFLight.RETURN_HOME,
      exit_wayline_when_rc_lost: WaylineLostControlActionInCommandFlight.EXEC_LOST_ACTION,
      rth_mode: ERthMode.SETTING,
      commander_mode_lost_action: ECommanderModeLostAction.CONTINUE,
      commander_flight_mode: ECommanderFlightMode.SETTING,
    },
  });

  const {
    dockVideoSrc,
    Video,
    startDockVideo,
    onRefreshDockVideo,
    // updateVideo,
    deviceVideoSrc,
    DeviceVideo,
    startDeviceVideo,
    stopDeviceVideo,
    onRefreshDeviceVideo,
    devicePosition,
    setDevicePosition,
    setCurrentDeviceCamera,
    stopDockVideo,
    currentDeviceCamera,
  } = useDeviceVideo();
  console.log("deviceVideoSrc");
  console.log(deviceVideoSrc);
  const {post} = useAjax();
  const {data: capacityData} = useCapacity();
  const {onlineDocks} = useOnlineDocks();
  useInitialConnectWebSocket();
  const [searchParams] = useSearchParams();
  const dockSn = searchParams.get("gateway_sn") || "";
  const deviceSn = searchParams.get("sn") || "";
  const deviceInfo = useRealTimeDeviceInfo();
  const deviceStatus = !deviceInfo.device ? EModeCode[EModeCode.Disconnected] : EModeCode[deviceInfo.device?.mode_code];
  console.log("deviceInfo=====");
  console.log(deviceInfo);
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!dockSn) return;
    const body = {
      ...values,
      target_latitude: parseFloat(values.target_latitude),
      target_longitude: parseFloat(values.target_longitude),
      target_height: parseFloat(values.target_height),
      security_takeoff_height: parseFloat(values.security_takeoff_height),
      rth_altitude: parseFloat(values.rth_altitude),
      commanderFlightHeight: parseFloat(values.commander_flight_height),
      rc_lost_action: +values.rc_lost_action,
      exit_wayline_when_rc_lost: +values.exit_wayline_when_rc_lost,
      rth_mode: +values.rth_mode,
      commander_mode_lost_action: +values.commander_mode_lost_action,
      commander_flight_mode: +values.commander_flight_mode,
      max_speed: 14,
    };
    const resp: any = await post(`${DRC_API_PREFIX}/devices/${dockSn}/jobs/takeoff-to-point`, body);
    if (resp.data.code === 0) {
      toast({
        description: <span>起飞成功</span>
      });
    }
  };

  const deviceType = onlineDocks.find(item => item.sn === deviceSn);

  const {
    onStartLiveStream,
    dockVideoId,
    updateVideo,
    dockPosition,
    setDockPosition,
    onStopLiveStream
  } = useDockLive("player1", dockSn);
  const {onStartLiveStream: startFpv, dockVideoId: fpvVideoId} = useDockLive("player3", deviceSn);
  const {
    onStartLiveStream: onStartDroneLive,
    dockVideoId: droneVideoId,
    updateVideo: updateDroneVideo,
    dockPosition: dronePosition,
    setDockPosition: setDronePosition,
    switchDeviceVideoMode, currentMode, onChangeCamera
  } = useDockLive("player2", deviceSn, "1");

  const onChangeClarity = async (value: string) => {
    await updateVideo(+value);
    setDockPosition(value);
  };

  const onSwitchMode = async (mode: "ir" | "wide" | "zoom" | "normal") => {
    await switchDeviceVideoMode(mode);
  };

  useEffect(() => {
    onStartLiveStream();
  }, [dockVideoId]);

  useEffect(() => {
    onStartDroneLive();
  }, [droneVideoId]);

  useEffect(() => {
    startFpv();
  }, [fpvVideoId]);

  // 添加 FPV 全屏控制
  const {
    isFullscreen: isFpvFullscreen,
    toggleFullscreen: toggleFpvFullscreen,
    exitFullscreen: exitFpvFullscreen
  } = useFullscreen("player3");

  const [showDockLive, setShowDockLive] = useState(true);

  // 处理机场直播显示/隐藏的切换
  const handleDockLiveToggle = async () => {
    if (showDockLive) {
      // 如果当前是显示状态，切换到隐藏时停止直播
      await onStopLiveStream();
    } else {
      // 如果当前是隐藏状态，切换到显示时开始直播
      await onStartLiveStream();
    }
    setShowDockLive(!showDockLive);
  };

  return (
    <FitScreen width={1920} height={1080} mode="full">
      <Form {...form}>
        <form className={"h-full bg-cockpit bg-full-size relative grid grid-cols-5"}
              onSubmit={form.handleSubmit(onSubmit)}>
          <header
            className={"bg-cockpit-header h-[164px] bg-full-size absolute top-0 w-full left-0 flex justify-center py-4 z-10"}>
            远程控制 - <span
            className={!deviceInfo.device || deviceInfo.device?.mode_code === EModeCode.Disconnected ? "text-red-500 px-2 font-bold" : "text-[#00ee8b] px-2 font-bold"}>{deviceStatus}</span>
          </header>
          <div className={"col-span-1 z-50"}>
            <div className={"mt-[123px] ml-[53px] mb-[12px] flex items-center justify-between pr-4 z-50"}>
              <div
                className="flex items-center space-x-2 cursor-pointer"
                onClick={handleDockLiveToggle}
              >
                <CockpitTitle title={"机场直播"}/>
                <X size={16} className={cn("transition-transform", !showDockLive && "rotate-45")}/>
              </div>
              {showDockLive && (
                <div className={"flex space-x-2"}>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Settings size={16}/>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-16">
                      <DropdownMenuLabel>清晰度</DropdownMenuLabel>
                      <DropdownMenuRadioGroup
                        value={dockPosition}
                        onValueChange={onChangeClarity}>
                        {clarityList.map(item =>
                          <DropdownMenuRadioItem key={item.value}
                                                 value={item.value.toString()}>{item.label}</DropdownMenuRadioItem>)}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <RefreshCcw
                    className={"cursor-pointer"}
                    onClick={() => onStartLiveStream()}
                    size={16}
                  />
                </div>
              )}
            </div>
            {showDockLive && (
              <div className={"w-[360px] h-[186px] ml-[30px]"}>
                <div className={"h-[180px] w-full"} id={"player1"}></div>
              </div>
            )}
            <div className={cn(
              "w-[360px] ml-[30px] rounded-lg",
              showDockLive ? "h-[244px] mt-[10px]" : "h-[430px]"
            )}>
              <TsaScene/>
            </div>
            <div className={"ml-[53px] py-[30px]"}>
              <CockpitTitle title={"飞行器基本参数"}/>
            </div>
            <div className={"ml-[53px] mr-[32px] space-y-2 h-[360px] overflow-auto"}>
              <FormField
                control={form.control}
                render={({field}) => (
                  <FormItem style={{
                    backgroundSize: "100% 100%"
                  }} className={"w-[290px] bg-fly-params grid grid-cols-6 items-center py-[10px] px-[16px]"}>
                    <FormLabel className={"col-span-4"}>目标经度</FormLabel>
                    <FormControl className={"col-span-3"}>
                      <Input type={"number"}
                             className={"col-span-2 h-[24px] bg-[#072E62]/[.7] border-[1px] border-[#0076C9]/[.85] rounded-[1px]"} {...field}/>
                    </FormControl>
                  </FormItem>
                )}
                name={"target_longitude"}
              />
              <FormField
                control={form.control}
                render={({field}) => (
                  <FormItem style={{
                    backgroundSize: "100% 100%"
                  }} className={"w-[290px] bg-fly-params grid grid-cols-6 items-center py-[10px] px-[16px]"}>
                    <FormLabel className={"col-span-4"}>目标纬度</FormLabel>
                    <FormControl className={"col-span-3"}>
                      <Input type={"number"}
                             className={"col-span-2 h-[22px] bg-[#072E62]/[.7] border-[1px] border-[#0076C9]/[.85] rounded-[1px]"} {...field}/>
                    </FormControl>
                  </FormItem>
                )}
                name={"target_latitude"}
              />
              <FormField
                control={form.control}
                render={({field}) => (
                  <FormItem style={{
                    backgroundSize: "100% 100%"
                  }} className={"w-[290px] bg-fly-params grid grid-cols-6 items-center py-[10px] px-[16px]"}>
                    <FormLabel className={"col-span-4"}>目标高度</FormLabel>
                    <FormControl className={"col-span-3"}>
                      <Input type={"number"}
                             className={"col-span-2 h-[22px] bg-[#072E62]/[.7] border-[1px] border-[#0076C9]/[.85] rounded-[1px]"} {...field}/>
                    </FormControl>
                  </FormItem>
                )}
                name={"target_height"}
              />
              <FormField
                control={form.control}
                render={({field}) => (
                  <FormItem style={{
                    backgroundSize: "100% 100%"
                  }} className={"w-[290px] bg-fly-params grid grid-cols-6 items-center py-[10px] px-[16px]"}>
                    <FormLabel className={"col-span-4"}>安全起飞高度</FormLabel>
                    <FormControl className={"col-span-3"}>
                      <Input type={"number"}
                             className={"col-span-2 h-[22px] bg-[#072E62]/[.7] border-[1px] border-[#0076C9]/[.85] rounded-[1px]"} {...field}/>
                    </FormControl>
                  </FormItem>
                )}
                name={"security_takeoff_height"}
              />
              <FormField
                control={form.control}
                render={({field}) => (
                  <FormItem style={{
                    backgroundSize: "100% 100%"
                  }} className={"w-[290px] bg-fly-params grid grid-cols-6 items-center py-[10px] px-[16px]"}>
                    <FormLabel className={"col-span-4"}>返航高度</FormLabel>
                    <FormControl className={"col-span-3"}>
                      <Input type={"number"}
                             className={"col-span-2 h-[22px] bg-[#072E62]/[.7] border-[1px] border-[#0076C9]/[.85] rounded-[1px]"} {...field}/>
                    </FormControl>
                  </FormItem>
                )}
                name={"rth_altitude"}
              />
              <FormField
                control={form.control}
                render={({field}) => (
                  <FormItem style={{
                    backgroundSize: "100% 100%"
                  }} className={"w-[290px] bg-fly-params grid grid-cols-6 items-center py-[10px] px-[16px]"}>
                    <FormLabel className={"col-span-4"}>失联动作</FormLabel>
                    <Select value={field.value.toString()} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="col-span-2 bg-[#0C66BF]/[.85] rounded-none border-none h-[24px]">
                          <SelectValue placeholder=""/>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className={""}>
                        <SelectGroup>
                          {LostControlActionInCommandFLightOptions.map(item =>
                            <SelectItem value={item.value.toString()} key={item.value}>{item.label}</SelectItem>)}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
                name={"rc_lost_action"}
              />
              <FormField
                control={form.control}
                render={({field}) => (
                  <FormItem style={{
                    backgroundSize: "100% 100%"
                  }} className={"w-[290px] bg-fly-params grid grid-cols-6 items-center py-[10px] px-[16px]"}>
                    <FormLabel className={"col-span-4"}>失控动作</FormLabel>
                    <Select value={field.value.toString()} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="col-span-2 bg-[#0C66BF]/[.85] rounded-none border-none h-[24px]">
                          <SelectValue placeholder=""/>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className={""}>
                        <SelectGroup>
                          {WaylineLostControlActionInCommandFlightOptions.map(item =>
                            <SelectItem value={item.value.toString()} key={item.value}>{item.label}</SelectItem>)}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
                name={"exit_wayline_when_rc_lost"}
              />
              <FormField
                control={form.control}
                render={({field}) => (
                  <FormItem style={{
                    backgroundSize: "100% 100%"
                  }} className={"w-[290px] bg-fly-params grid grid-cols-6 items-center py-[10px] px-[16px]"}>
                    <FormLabel className={"col-span-4"}>返航模式</FormLabel>
                    <Select value={field.value.toString()} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="col-span-2 bg-[#0C66BF]/[.85] rounded-none border-none h-[24px]">
                          <SelectValue placeholder=""/>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className={""}>
                        <SelectGroup>
                          {RthModeInCommandFlightOptions.map(item =>
                            <SelectItem value={item.value.toString()} key={item.value}>{item.label}</SelectItem>)}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
                name={"rth_mode"}
              />
              <FormField
                control={form.control}
                render={({field}) => (
                  <FormItem style={{
                    backgroundSize: "100% 100%"
                  }} className={"w-[290px] bg-fly-params grid grid-cols-6 items-center py-[10px] px-[16px]"}>
                    <FormLabel className={"col-span-4"}>指令失联动作</FormLabel>
                    <Select value={field.value.toString()} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="col-span-2 bg-[#0C66BF]/[.85] rounded-none border-none h-[24px]">
                          <SelectValue placeholder=""/>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className={""}>
                        <SelectGroup>
                          {CommanderModeLostActionInCommandFlightOptions.map(item =>
                            <SelectItem value={item.value.toString()} key={item.value}>{item.label}</SelectItem>)}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
                name={"commander_mode_lost_action"}
              />
              <FormField
                control={form.control}
                render={({field}) => (
                  <FormItem style={{
                    backgroundSize: "100% 100%"
                  }} className={"w-[290px] bg-fly-params grid grid-cols-6 items-center py-[10px] px-[16px]"}>
                    <FormLabel className={"col-span-4"}>指令飞行模式</FormLabel>
                    <Select value={field.value.toString()} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="col-span-2 bg-[#0C66BF]/[.85] rounded-none border-none h-[24px]">
                          <SelectValue placeholder=""/>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className={""}>
                        <SelectGroup>
                          {CommanderFlightModeInCommandFlightOptions.map(item =>
                            <SelectItem value={item.value.toString()} key={item.value}>{item.label}</SelectItem>)}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
                name={"commander_flight_mode"}
              />
              <FormField
                control={form.control}
                render={({field}) => (
                  <FormItem style={{
                    backgroundSize: "100% 100%"
                  }} className={"w-[290px] bg-fly-params grid grid-cols-6 items-center py-[10px] px-[16px]"}>
                    <FormLabel className={"col-span-4"}>指令飞行高度</FormLabel>
                    <FormControl className={"col-span-3"}>
                      <Input type={"number"}
                             className={"col-span-2 h-[22px] bg-[#072E62]/[.7] border-[1px] border-[#0076C9]/[.85] rounded-[1px]"} {...field}/>
                    </FormControl>
                  </FormItem>
                )}
                name={"commander_flight_height"}
              />
            </div>
          </div>
          <div className={"col-span-3 z-50"}>
            <div className={"h-[596px] bg-center-video mt-[52px] bg-full-size content-center relative"}>
              {deviceStatus !== EModeCode[EModeCode.Disconnected] ? (
                <div
                  className={"h-[480px] w-[930px] rounded-[80px] overflow-hidden"}
                  id={"player2"}
                />
              ) : (
                <div className={"text-[#d0d0d0]"}>
                  当前设备已关机，无法进行直播
                </div>
              )}
              <div className={"absolute right-40 top-16 z-50"}>
                <PayloadControl
                  onRefreshVideo={onRefreshDeviceVideo}
                  updateVideo={updateDroneVideo}
                  devicePosition={dronePosition}
                  setDevicePosition={setDronePosition}
                  deviceSn={deviceSn}
                  currentDeviceCamera={currentDeviceCamera}
                  onChangeCamera={onChangeCamera}
                  currentMode={currentMode}
                  onChangeMode={onSwitchMode}
                  playerId="player2"
                />
              </div>
            </div>
            <div className={"grid grid-cols-3 h-[380px]"}>
              <div className={"col-span-1 py-6 space-y-8 pl-16"}>
                <div className={"grid grid-cols-2 gap-8"}>
                  <div className={"flex space-x-4"}>
                    <img src={batteryPng} alt=""/>
                    <div className={"flex flex-col justify-center space-y-2"}>
                      <span className={"text-[12px] text-[#D0D0D0]"}>电池电量</span>
                      <span>
                        {deviceInfo.device && deviceInfo.device.battery.capacity_percent !== str ? deviceInfo.device?.battery.capacity_percent + " %" : str}
                      </span>
                    </div>
                  </div>
                  <div className={"flex space-x-4"}>
                    <img src={rtkPng} alt=""/>
                    <div className={"flex flex-col justify-center space-y-2"}>
                      <span className={"text-[12px] text-[#D0D0D0]"}>搜星质量</span>
                      <span>
                        {deviceInfo.device ? deviceInfo.device.position_state.rtk_number : str}
                      </span>
                    </div>
                  </div>
                  <div className={"flex space-x-4"}>
                    <img src={czsd} alt=""/>
                    <div className={"flex flex-col justify-center space-y-2"}>
                      <span className={"text-[12px] text-[#D0D0D0]"}>垂直速度</span>
                      <span>{!deviceInfo.device || deviceInfo.device.vertical_speed === str ? str : parseFloat(deviceInfo.device?.horizontal_speed).toFixed(2) + " m/s"}</span>
                    </div>
                  </div>
                  <div className={"flex space-x-4"}>
                    <img src={spsd} alt=""/>
                    <div className={"flex flex-col justify-center space-y-2"}>
                      <span
                        className={"text-[12px] text-[#D0D0D0]"}>水平速度</span>
                      <span>{!deviceInfo.device || deviceInfo.device?.horizontal_speed === str ? str : parseFloat(deviceInfo.device?.horizontal_speed).toFixed(2) + " m/s"}</span>
                    </div>
                  </div>
                </div>
                <div className={"grid grid-cols-2 gap-8"}>
                  <div className={"flex space-x-4"}>
                    <img src={asl} alt=""/>
                    <div className={"flex flex-col justify-center space-y-2"}>
                      <span className={"text-[12px] text-[#D0D0D0]"}>ASL</span>
                      <span>{!deviceInfo.device || deviceInfo.device.height === str ? str : parseFloat(deviceInfo.device?.height).toFixed(2) + " m"}</span>
                    </div>
                  </div>
                  <div className={"flex space-x-4"}>
                    <img src={alt} alt=""/>
                    <div className={"flex flex-col justify-center space-y-2"}>
                      <span className={"text-[12px] text-[#D0D0D0] whitespace-nowrap"}>ALT</span>
                      <span>{deviceInfo.device && deviceInfo.device.battery.capacity_percent !== str ? deviceInfo.device?.battery.capacity_percent + " m" : str}</span>
                    </div>
                  </div>
                  <div className={"flex space-x-4"}>
                    <img src={windSpeed} alt=""/>
                    <div className={"flex flex-col justify-center space-y-2"}>
                      <span className={"text-[12px] text-[#D0D0D0]"}>风速</span>
                      <span>{!deviceInfo.device || deviceInfo.device.wind_speed === str ? str : (parseFloat(deviceInfo.device?.wind_speed) / 10).toFixed(2) + " m/s"}</span>
                    </div>
                  </div>
                  <div className={"flex space-x-4"}>
                    <img src={qsdjl} alt=""/>
                    <div className={"flex flex-col justify-center space-y-2"}>
                      <span className={"text-[12px] text-[#D0D0D0]"}>距起始点距离</span>
                      <span>
                        {deviceInfo.device && deviceInfo.device.battery.capacity_percent !== str ? deviceInfo.device?.battery.capacity_percent + " %" : str}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className={"col-span-1h-full relative content-center"}>
                <img src={compassWrapperPng} className={"absolute right-14 scale-150 bottom-28"} alt=""/>
                <img src={compassPng} className={"absolute left-18 top-[70px]"} alt=""/>
                <Button type={"submit"} className={"bg-transparent absolute bottom-0"}>
                  <img src={yjqfPng} alt=""/>
                </Button>
              </div>
              <div className={"col-span-1"}>
                <CockpitTitle title={"飞行器当前状态"}/>
                <div className={"space-y-[10px] mt-[64px]"}>
                  <div className={"grid grid-cols-2 px-[26px]"}>
                    <span>当前状态：</span>
                    <span
                      className={cn("font-bold", !deviceInfo.device || deviceInfo.device?.mode_code === EModeCode.Disconnected ? "text-red-500" : "text-[#00ee8b]")}>{deviceStatus}</span>
                  </div>
                  <div>
                    <div className={"grid grid-cols-2 px-[26px]"}>
                      <span>机场：</span>
                      <span>{deviceType?.gateway.model || str}</span>
                    </div>
                  </div>
                  <div>
                    <div className={"grid grid-cols-2 px-[26px]"}>
                      <span>机场SN：</span>
                      <span>{deviceType?.gateway.sn || str}</span>
                    </div>
                  </div>
                  <div>
                    <div className={"grid grid-cols-2 px-[26px]"}>
                      <span>设备型号：</span>
                      <span>{deviceType?.model || str}</span>
                    </div>
                  </div>
                  <div>
                    <div className={"grid grid-cols-2 px-[26px]"}>
                      <span>设备SN：</span>
                      <span>{deviceType?.sn || str}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={"col-span-1 pt-[100px]"}>
            <div className="flex items-center  mr-[60px] z-50 relative">
              <CockpitTitle title={"FPV直播"}/>
              {deviceStatus !== EModeCode[EModeCode.Disconnected] && (
                <div className="flex items-center space-x-2">
                  <RefreshCcw
                    size={17}
                    className="cursor-pointer"
                    onClick={() => startFpv()}
                  />
                  <Maximize2
                    size={17}
                    className="cursor-pointer"
                    onClick={toggleFpvFullscreen}
                  />
                </div>
              )}
            </div>
            {deviceStatus !== EModeCode[EModeCode.Disconnected] ? (
              <div
                className={cn(
                  "h-[200px] mr-[60px] z-50 my-2 relative",
                  isFpvFullscreen && "!h-screen !w-screen fixed top-0 left-0 z-50 bg-black"
                )}
                id={"player3"}
              >
                {isFpvFullscreen && (
                  <X
                    className="absolute top-4 right-4 cursor-pointer text-white z-10"
                    size={24}
                    onClick={exitFpvFullscreen}
                  />
                )}
              </div>
            ) : (
              <div className={"text-[#d0d0d0] h-[200px] flex items-center pl-6"}>
                当前设备已关机，无法进行直播
              </div>
            )}
            <CockpitTitle title={"实时气象"}/>
            <div className={"flex"}>
              <div className={"flex flex-col content-center"}>
                <img className={"translate-y-12"} src={cloudyPng} alt=""/>
                <img src={weatherBasePng} alt=""/>
              </div>
              <div className={"pl-[32px] space-y-2 flex flex-col justify-center"}>
                <span>温度：</span>
                <div className={"text-[34px]"}>
                  {deviceInfo.dock.basic_osd?.environment_temperature}°C
                </div>
              </div>
            </div>
            <div className={"grid grid-cols-2 mt-[16px]"}>
              <div className={"flex"}>
                <img src={humidityPng} alt=""/>
                <div className={"flex flex-col"}>
                  <span>湿度</span>
                  <span className={"text-[18px] text-[#32A3FF]"}>
                    {deviceInfo.dock.basic_osd?.humidity}
                  </span>
                </div>
              </div>
              <div className={"flex"}>
                <img src={rainyPng} alt=""/>
                <div className={"flex flex-col"}>
                  <span>降雨</span>
                  <span className={"text-[18px] text-[#32A3FF]"}>
                    {RainfallEnum[deviceInfo.dock.basic_osd?.rainfall]}
                  </span>
                </div>
              </div>
              <div className={"flex"}>
                <img src={windyPng} alt=""/>
                <div className={"flex flex-col"}>
                  <span>风向</span>
                  <span className={"text-[18px] text-[#32A3FF]"}>东南风</span>
                </div>
              </div>
              <div className={"flex"}>
                <img src={windPowerPng} alt=""/>
                <div className={"flex flex-col"}>
                  <span>风力</span>
                  <span className={"text-[18px] text-[#32A3FF]"}>2级</span>
                </div>
              </div>
            </div>
            <div>
              <CockpitFlyControl/>
            </div>
          </div>
        </form>
      </Form>
    </FitScreen>
  );
};

export default Cockpit;

