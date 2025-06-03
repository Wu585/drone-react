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
import humidityPng from "@/assets/images/drone/cockpit/humidity.png";
import rainyPng from "@/assets/images/drone/cockpit/rainy.png";
import windyPng from "@/assets/images/drone/cockpit/windy.png";
import windPowerPng from "@/assets/images/drone/cockpit/wind-power.png";
import CockpitFlyControl from "@/components/drone/public/CockpitFlyControl.tsx";
import {Input} from "@/components/ui/input.tsx";
import {clarityList} from "@/hooks/drone/useDeviceVideo.ts";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import {useOnlineDocks, usePermission} from "@/hooks/drone";
import {z} from "zod";
import {
  CommanderFlightModeInCommandFlightOptions,
  CommanderModeLostActionInCommandFlightOptions,
  ECommanderFlightMode,
  ECommanderModeLostAction,
  ERthMode,
  LostControlActionInCommandFLight,
  LostControlActionInCommandFLightOptions,
  RthModeInCommandFlightOptions,
  WaylineLostControlActionInCommandFlight,
  WaylineLostControlActionInCommandFlightOptions
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
import {EDockModeCode, EModeCode, EModeCodeMap, RainfallEnum} from "@/types/device.ts";
import {cn} from "@/lib/utils.ts";
import PayloadControl from "@/components/drone/PayloadControl.tsx";
import compassWrapperPng from "@/assets/images/drone/cockpit/compass-wrapper.png";
import compassPng from "@/assets/images/drone/cockpit/compass.png";
import pointerPng from "@/assets/images/drone/cockpit/pointer.png";
import {Maximize2, RefreshCcw, Settings, Undo2, X} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {useFullscreen} from "@/hooks/useFullscreen";
import {PayloadCommandsEnum} from "@/hooks/drone/usePayloadControl.ts";
import {useRightClickPanel} from "@/components/drone/public/useRightClickPanel.tsx";
import {useDeviceLive} from "@/hooks/drone/useDeviceLive.ts";
import CockpitScene from "@/components/drone/public/CockpitScene.tsx";
import {AlgorithmConfig, AlgorithmPlatform, useAlgorithmConfigList} from "@/hooks/drone/algorithm";
import JSWebrtc from "@/vendor/jswebrtc.min.js";
import {useInitialConnectWebSocket} from "@/hooks/drone/useConnectWebSocket.ts";

// DRC 链路
const DRC_API_PREFIX = "/control/api/v1";

const str = "--";

const Cockpit = () => {
  useInitialConnectWebSocket();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      target_latitude: 30.891961,
      target_longitude: 121.44556,
      target_height: 120,
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

  const {post} = useAjax();
  const {onlineDocks} = useOnlineDocks();
  const [searchParams] = useSearchParams();
  const dockSn = searchParams.get("gateway_sn") || "";
  const deviceSn = searchParams.get("sn") || "";
  // const instanceId = searchParams.get("instance_id") || "";
  const [instanceId, setInstanceId] = useState("");
  const deviceInfo = useRealTimeDeviceInfo(dockSn, deviceSn);

  const deviceStatus2 = useMemo(() => {
    if (!deviceInfo?.dock) return "离线";
    if (deviceInfo.dock?.basic_osd?.drone_in_dock && !deviceInfo.device) {
      return "飞行器在舱内，暂无执行任务";
    } else {
      return EModeCodeMap[deviceInfo.device?.mode_code];
    }
  }, [deviceInfo]);

  const deviceStatus = !deviceInfo.device ? EModeCodeMap[EModeCode.Disconnected] : EModeCodeMap[deviceInfo.device?.mode_code];

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

  const dockVideoRef = useRef<HTMLVideoElement>(null);
  const droneCloudVideoRef = useRef<HTMLVideoElement>(null);
  const droneFpvVideoRef = useRef<HTMLVideoElement>(null);

  const {
    startLive: startDockLive,
    stopLive: stopDockLive,
    updateClarity: updateDockClarity
  } = useDeviceLive(dockVideoRef.current, dockSn, deviceSn);

  const {
    startLive: startDroneLive,
    stopLive: stopDroneLive,
    updateClarity: updateDroneClarity,
    switchCameraMode: switchCloudCameraMode,
    clarity: droneCloudClarity,
    setClarity: setDroneCloudClarity,
    mode: droneCloudMode,
    setMode: setDroneCloudMode,
  } = useDeviceLive(droneCloudVideoRef.current, dockSn, deviceSn);

  const {
    startLive: startFpvLive,
    stopLive: stopFpvLive,
    updateClarity: updateFpvClarity,
    droneVideoId: fpvDroneVideoId
  } = useDeviceLive(droneFpvVideoRef.current, dockSn, deviceSn, true);

  useEffect(() => {
    startDockLive();
  }, [startDockLive]);

  useEffect(() => {
    startDroneLive(false);
  }, [startDroneLive]);

  useEffect(() => {
    startFpvLive(false);
  }, [startFpvLive]);

  const deviceType = onlineDocks.find(item => item.sn === deviceSn);

  // 添加 FPV 全屏控制
  const {
    isFullscreen: isFpvFullscreen,
    toggleFullscreen: toggleFpvFullscreen,
    exitFullscreen: exitFpvFullscreen
  } = useFullscreen("player3");

  const [showDockLive, setShowDockLive] = useState(true);

  // 处理机场直播显示/隐藏的切换
  const handleDockLiveToggle = async () => {
    setShowDockLive(!showDockLive);
    if (showDockLive) {
      await startDockLive();
    }
  };

  // 修改为双击事件处理函数
  const handleVideoDoubleClick = async (event: React.MouseEvent<HTMLVideoElement>) => {
    // const div = event.currentTarget;
    // const rect = div.getBoundingClientRect();

    // 获取视频元素
    const videoElement = droneCloudVideoRef.current;
    if (!videoElement) return;

    const videoRect = videoElement.getBoundingClientRect();

    // 使用视频元素的实际显示区域计算坐标
    const x = (event.clientX - videoRect.left) / videoRect.width;
    const y = (event.clientY - videoRect.top) / videoRect.height;

    // 限制坐标范围在 0-1 之间
    const normalizedX = Math.max(0, Math.min(1, x));
    const normalizedY = Math.max(0, Math.min(1, y));

    // 调试信息
    console.log("点击事件信息:", {
      clientX: event.clientX,
      clientY: event.clientY,
      videoRect: {
        left: videoRect.left,
        top: videoRect.top,
        width: videoRect.width,
        height: videoRect.height
      },
      计算结果: {
        x: normalizedX,
        y: normalizedY
      }
    });

    // 如果点击在视频区域外，则不处理
    if (x < 0 || x > 1 || y < 0 || y > 1) {
      console.log("点击在视频区域外");
      return;
    }

    try {
      const payloadIndex = deviceInfo?.device?.cameras?.[0]?.payload_index;
      await post(`${DRC_API_PREFIX}/devices/${dockSn}/payload/commands`, {
        cmd: PayloadCommandsEnum.CameraAim,
        data: {
          payload_index: payloadIndex,
          camera_type: droneCloudMode,
          locked: false,
          x: normalizedX,
          y: normalizedY,
        },
      });
      toast({
        description: "获取云台控制权成功"
      });
    } catch (error) {
      toast({
        description: "云台控制失败",
        variant: "destructive"
      });
    }
  };

  const [zoomValue, setZoomValue] = useState(2);

  // 处理滚轮事件
  const handleWheel = useCallback((event: React.WheelEvent<HTMLVideoElement>) => {
    // event.preventDefault();

    // 根据滚动方向决定增加或减少
    const direction = event.deltaY > 0 ? -1 : 1;
    setZoomValue(prev => Math.min(droneCloudMode === "ir" ? 20 : 200, Math.max(2, prev + direction)));
  }, [droneCloudMode]);

  useEffect(() => {
    const payloadIndex = deviceInfo?.device?.cameras?.[0]?.payload_index;
    if (droneCloudMode !== "zoom" && droneCloudMode !== "ir") return;
    post(`${DRC_API_PREFIX}/devices/${dockSn}/payload/commands`, {
      cmd: PayloadCommandsEnum.CameraFocalLengthSet,
      data: {
        payload_index: payloadIndex,
        camera_type: droneCloudMode,
        zoom_factor: zoomValue
      }
    });
  }, [zoomValue, dockSn, droneCloudMode]);

  const {RightClickPanel, MenuItem, contextMenu} = useRightClickPanel({
    containerId: "cesiumContainer",
  });

  const onLookAt = async () => {
    const payloadIndex = deviceInfo?.device?.cameras?.[0]?.payload_index;
    try {
      await post(`${DRC_API_PREFIX}/devices/${dockSn}/payload/commands`, {
        cmd: PayloadCommandsEnum.CameraLookAt,
        data: {
          payload_index: payloadIndex,
          locked: true,
          longitude: contextMenu.longitude,
          latitude: contextMenu.latitude,
          height: 100,
        }
      });
    } catch (err: any) {
      toast({
        description: err.data.message,
        variant: "destructive"
      });
    }
  };

  // 添加状态记录鼠标按下的位置和是否正在拖动
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({x: 0, y: 0});
  const [dragTimer, setDragTimer] = useState<NodeJS.Timeout | null>(null);

  // 处理鼠标按下事件
  const handleMouseDown = (event: React.MouseEvent<HTMLVideoElement>) => {
    const div = event.currentTarget;
    const rect = div.getBoundingClientRect();

    // 记录起始位置
    setStartPos({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    });

    // 设置定时器，长按 200ms 后才开始拖动
    const timer = setTimeout(() => {
      setIsDragging(true);
    }, 200);
    setDragTimer(timer);
  };

  // 处理鼠标移动事件
  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLVideoElement>) => {
    if (!isDragging) return;

    const div = event.currentTarget;
    const rect = div.getBoundingClientRect();
    const currentX = event.clientX - rect.left;
    const currentY = event.clientY - rect.top;

    // 计算相对于中心点的偏移
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // 计算拖动距离相对于div一半高度/宽度的比例，转换为角度，并限制在 -180 到 180 度之间
    const yawAngle = Math.max(-180, Math.min(180, ((currentX - startPos.x) / centerX) * 180));
    const pitchAngle = Math.max(-180, Math.min(180, ((startPos.y - currentY) / centerY) * 180));

    console.log("yawAngle pitchAngle");
    console.log(yawAngle, pitchAngle);

    // 发送云台控制命令
    const payloadIndex = deviceInfo?.device?.cameras?.[0]?.payload_index;
    post(`${DRC_API_PREFIX}/devices/${dockSn}/payload/commands`, {
      cmd: PayloadCommandsEnum.CameraScreenDrag,
      data: {
        payload_index: payloadIndex,
        yaw_speed: yawAngle,
        pitch_speed: pitchAngle,
        locked: false
      }
    });
  }, [isDragging, startPos, deviceInfo, dockSn]);

  // 处理鼠标松开事件
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    if (dragTimer) {
      clearTimeout(dragTimer);
      setDragTimer(null);
    }
  }, [dragTimer]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (dragTimer) {
        clearTimeout(dragTimer);
      }
    };
  }, [dragTimer]);

  const [fpvOrAi, setFpvOrAi] = useState("fpv");
  const onGroupChange = (value: string) => {
    setFpvOrAi(value);
  };

  const onUpdateDroneCloudClarity = async (value?: number) => {
    setDroneCloudClarity(value);
    await updateDroneClarity(value!);
  };

  const onChangeDroneCloudMode = async (mode?: "ir" | "wide" | "zoom") => {
    setDroneCloudMode(mode!);
    await switchCloudCameraMode(mode!);
  };

  const headingDegrees = useMemo(() => {
    if (deviceInfo.device) {
      return deviceInfo.device.attitude_head;
    }
  }, [deviceInfo]);

  // 算法选择
  const {data: algorithmConfigList} = useAlgorithmConfigList({
    page: 1,
    size: 1000,
  });

  function groupByDevicePlatformAndName(algorithms: AlgorithmConfig[]): Record<string, Record<number, any[]>> {
    const result: Record<string, Record<number, any[]>> = {};

    algorithms.forEach(algorithm => {
      const platform = algorithm.algorithm_platform;
      const algorithmName = algorithm.algorithm_name;

      if (algorithm.device_list && algorithm.device_list.length > 0) {
        algorithm.device_list.forEach(device => {
          const sn = device.device_sn;

          // Initialize device_sn entry if not exists
          if (!result[sn]) {
            result[sn] = {};
          }

          // Initialize platform entry if not exists
          if (!result[sn][platform]) {
            result[sn][platform] = [];
          }

          // Add instance detail with algorithm name
          result[sn][platform].push({
            algorithm_name: algorithmName,
            instance_id: device.instance_id
          });
        });
      }
    });

    return result;
  }

  const [currentPlatform, setCurrentPlatform] = useState(AlgorithmPlatform.CloudPlatForm);
  const otherPlatFormAiRef = useRef<HTMLVideoElement>(null);

  const onChangeAiVideo = (platform: AlgorithmPlatform, video_id: string) => {
    console.log("video_id");
    console.log(video_id);
    setInstanceId(video_id);
    setCurrentPlatform(platform);
  };

  useEffect(() => {
    if (currentPlatform === AlgorithmPlatform.Other && instanceId && otherPlatFormAiRef.current) {
      const webrtcUrl = instanceId.replace("rtmp", "webrtc");
      console.log("webrtcUrl");
      console.log(webrtcUrl);
      new JSWebrtc.Player(webrtcUrl, {
        video: otherPlatFormAiRef.current,
        autoplay: true,
        onPlay: () => {
          console.log("start play livestream");
        }
      });
    }
  }, [currentPlatform, instanceId]);


  const result = groupByDevicePlatformAndName(algorithmConfigList?.records || []);

  const navigate = useNavigate();

  // 切换中屏显示
  const [videoLayout, setVideoLayout] = useState<"default" | "switched">("default");

  const switchVideos = () => {
    setVideoLayout(prev => prev === "default" ? "switched" : "default");
  };

  const {hasPermission} = usePermission();
  const hasFlyControlPermission = hasPermission("Collection_DeviceControlBasic");

  return (
    <FitScreen width={1920} height={1080} mode="full">
      <Form {...form}>
        <form className={"h-full bg-cockpit bg-full-size relative grid grid-cols-5"}
              onSubmit={form.handleSubmit(onSubmit)}>
          <header
            className={"bg-cockpit-header h-[164px] bg-full-size absolute top-0 w-full left-0 flex justify-center py-4 z-[5] text-lg"}>
            远程控制 - <span
            className={deviceInfo.dock?.basic_osd?.drone_in_dock && !deviceInfo.device ? "text-yellow-500 px-2 font-bold" : !deviceInfo.device || deviceInfo.device?.mode_code === EModeCode.Disconnected ? "text-red-500 px-2 font-bold" : "text-[#00ee8b] px-2 font-bold"}>{deviceStatus2}</span>
          </header>
          <div className={"col-span-1 z-50"}>
            <div
              className={"absolute top-4 left-6 flex items-center justify-center space-x-2 z-[20] cursor-pointer bg-[#072E62]/[.7] px-2 py-1 rounded"}>
              <Undo2 className="cursor-pointer text-white" size={24} onClick={() => {
                navigate("/tsa");
              }}/>
              {/*<span>返回</span>*/}
            </div>
            <div className={"mt-[123px] ml-[53px] mb-[12px] flex items-center justify-between pr-4 z-50"}>
              <div
                className="flex items-center space-x-2 cursor-pointer"
                onClick={handleDockLiveToggle}
              >
                <CockpitTitle title={"机场直播"}/>
                <X size={18} className={cn("transition-transform", !showDockLive && "rotate-45")}/>
              </div>
              {showDockLive && (
                <div className={"ml-2 flex space-x-2"}>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Settings size={16}/>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-16">
                      <DropdownMenuLabel>清晰度</DropdownMenuLabel>
                      <DropdownMenuRadioGroup
                        onValueChange={(value) => updateDockClarity(+value)}>
                        {clarityList.map(item =>
                          <DropdownMenuRadioItem key={item.value}
                                                 value={item.value.toString()}>{item.label}</DropdownMenuRadioItem>)}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <RefreshCcw
                    className={"cursor-pointer"}
                    onClick={() => startDockLive()}
                    size={16}
                  />
                  {/*<ArrowRightLeft
                    className={"cursor-pointer"}
                    // onClick={() => startDockLive()}
                    onClick={switchVideos}
                    size={16}
                  />*/}
                </div>
              )}
            </div>
            {showDockLive && (
              <div className={"w-[360px] h-[186px] ml-[30px]"}>
                {videoLayout === "default" ? (
                  <video
                    ref={dockVideoRef}
                    controls
                    autoPlay
                    className={"h-[180px] w-full object-fill rounded-lg"}
                  />
                ) : (
                  <video
                    ref={droneCloudVideoRef}
                    autoPlay
                    className={"h-[180px] w-full object-fill rounded-lg"}
                    onDoubleClick={handleVideoDoubleClick}
                    onWheel={handleWheel}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    style={{
                      background: "#000",
                      userSelect: "none"
                    }}
                  />
                )}
              </div>
            )}
            <div className={cn(
              "w-[360px] ml-[30px] rounded-lg",
              showDockLive ? "h-[244px] mt-[10px]" : "h-[430px]"
            )}>
              <CockpitScene/>
              <RightClickPanel>
                <MenuItem onClick={onLookAt}>看向这里</MenuItem>
              </RightClickPanel>
            </div>
            <div className={"ml-[53px] py-[30px]"}>
              <CockpitTitle title={"一键起飞基本参数"}/>
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
              {deviceStatus !== EModeCodeMap[EModeCode.Disconnected] ? (
                videoLayout === "default" ? (
                  <video
                    ref={droneCloudVideoRef}
                    autoPlay
                    className={"w-[830px] rounded-[40px] overflow-hidden cursor-crosshair aspect-video object-fill"}
                    id={"player2"}
                    onDoubleClick={handleVideoDoubleClick}
                    onWheel={handleWheel}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#000",
                      position: "relative",
                      userSelect: "none"
                    }}
                  />
                ) : (
                  <video
                    ref={dockVideoRef}
                    controls
                    autoPlay
                    className={"w-[830px] rounded-[40px] overflow-hidden aspect-video object-fill"}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#000",
                      position: "relative"
                    }}
                  />
                )) : (
                <div className={"text-[#d0d0d0]"}>
                  当前设备已关机，无法进行直播
                </div>
              )}
              <div className={"absolute right-40 top-16 z-50"}>
                <PayloadControl
                  currentMode={droneCloudMode}
                  clarity={droneCloudClarity}
                  dockSn={dockSn}
                  onRefreshVideo={() => startDroneLive(false)}
                  updateVideo={onUpdateDroneCloudClarity}
                  deviceSn={deviceSn}
                  onChangeMode={onChangeDroneCloudMode}
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
                      <span className={"whitespace-nowrap"}>
                        {deviceInfo.device && deviceInfo.device.battery.capacity_percent !== str ? deviceInfo.device?.battery.capacity_percent + " %" : str}
                      </span>
                    </div>
                  </div>
                  <div className={"flex space-x-4"}>
                    <img src={rtkPng} alt=""/>
                    <div className={"flex flex-col justify-center space-y-2"}>
                      <span className={"text-[12px] text-[#D0D0D0]"}>搜星质量</span>
                      <span className={"whitespace-nowrap"}>
                        {deviceInfo.device ? deviceInfo.device.position_state.rtk_number : str}
                      </span>
                    </div>
                  </div>
                  <div className={"flex space-x-4"}>
                    <img src={czsd} alt=""/>
                    <div className={"flex flex-col justify-center space-y-2"}>
                      <span className={"text-[12px] text-[#D0D0D0]"}>垂直速度</span>
                      <span
                        className={"whitespace-nowrap"}>{!deviceInfo.device || deviceInfo.device.vertical_speed === str ? str : parseFloat(deviceInfo.device?.vertical_speed).toFixed(2) + " m/s"}</span>
                    </div>
                  </div>
                  <div className={"flex space-x-4"}>
                    <img src={spsd} alt=""/>
                    <div className={"flex flex-col justify-center space-y-2"}>
                      <span
                        className={"text-[12px] text-[#D0D0D0]"}>水平速度</span>
                      <span
                        className={"whitespace-nowrap"}>{!deviceInfo.device || deviceInfo.device?.horizontal_speed === str ? str : parseFloat(deviceInfo.device?.horizontal_speed).toFixed(2) + " m/s"}</span>
                    </div>
                  </div>
                </div>
                <div className={"grid grid-cols-2 gap-8"}>
                  <div className={"flex space-x-4"}>
                    <img src={asl} alt=""/>
                    <div className={"flex flex-col justify-center space-y-2"}>
                      <span className={"text-[12px] text-[#D0D0D0]"}>ASL</span>
                      <span
                        className={"whitespace-nowrap"}>{!deviceInfo.device || deviceInfo.device.height === str ? str : parseFloat(deviceInfo.device?.height).toFixed(2) + " m"}</span>
                    </div>
                  </div>
                  <div className={"flex space-x-4"}>
                    <img src={alt} alt=""/>
                    <div className={"flex flex-col justify-center space-y-2"}>
                      <span className={"text-[12px] text-[#D0D0D0] whitespace-nowrap"}>ALT</span>
                      <span
                        className={"whitespace-nowrap"}>{deviceInfo.device && deviceInfo.device.battery.capacity_percent !== str ? deviceInfo.device?.battery.capacity_percent + " m" : str}</span>
                    </div>
                  </div>
                  <div className={"flex space-x-4"}>
                    <img src={windSpeed} alt=""/>
                    <div className={"flex flex-col justify-center space-y-2"}>
                      <span className={"text-[12px] text-[#D0D0D0]"}>风速</span>
                      <span
                        className={"whitespace-nowrap"}>{!deviceInfo.device || deviceInfo.device.wind_speed === str ? str : (parseFloat(deviceInfo.device?.wind_speed) / 10).toFixed(2) + " m/s"}</span>
                    </div>
                  </div>
                  <div className={"flex space-x-4"}>
                    <img src={qsdjl} alt=""/>
                    <div className={"flex flex-col justify-center space-y-2"}>
                      <span className={"text-[12px] text-[#D0D0D0]"}>距起始点距离</span>
                      <span className={"whitespace-nowrap"}>
                        {!deviceInfo.device || deviceInfo.device.home_distance.toString() === str ? str : (+deviceInfo.device?.home_distance).toFixed(2) + " m"}
                        {/*{deviceInfo.device && deviceInfo.device.battery.capacity_percent !== str ? deviceInfo.device?.battery.capacity_percent + " %" : str}*/}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className={"col-span-1h-full relative content-center"}>
                <img src={compassWrapperPng} className={"absolute right-14 scale-150 bottom-28 border-2"} alt=""/>
                <img src={compassPng}
                     style={{
                       transform: `rotate(${-(headingDegrees || 0)}deg)`,
                       transition: "transform 0.3s ease-out"
                     }}
                     className={"absolute left-18 top-[70px]"} alt=""
                />
                <img src={pointerPng} alt=""
                     className={"absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[50px]"}/>
                <Button disabled={!hasFlyControlPermission} type={"submit"}
                        className={"bg-transparent absolute bottom-0"}>
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
              <CockpitTitle
                sn={deviceSn}
                title={!fpvDroneVideoId ? "AI识别" : undefined}
                groupValue={fpvOrAi}
                groupList={fpvDroneVideoId ? [
                  {
                    name: "FPV直播",
                    value: "fpv"
                  },
                  {
                    name: "AI识别",
                    value: "ai"
                  }
                ] : undefined}
                onGroupChange={onGroupChange}
                onClickPopoverItem={onChangeAiVideo}
              />
              {deviceStatus !== EModeCodeMap[EModeCode.Disconnected] && (
                <div className="flex items-center space-x-2">
                  {fpvDroneVideoId && fpvOrAi === "fpv" && <RefreshCcw
                    size={17}
                    className="cursor-pointer"
                    onClick={() => startFpvLive(false)}
                  />}
                  {(fpvOrAi !== "fpv" || !fpvDroneVideoId) && currentPlatform === AlgorithmPlatform.CloudPlatForm &&
                    <Maximize2
                      size={17}
                      className="cursor-pointer"
                      onClick={toggleFpvFullscreen}
                    />}
                </div>
              )}
            </div>
            {deviceStatus !== EModeCodeMap[EModeCode.Disconnected] ? (
              fpvDroneVideoId ?
                fpvOrAi === "fpv" ?
                  <video
                    ref={droneFpvVideoRef}
                    controls
                    autoPlay
                    className={cn(
                      "h-[200px] mr-[60px] z-50 my-2 relative",
                      isFpvFullscreen && "!h-screen !w-screen fixed top-0 left-0 z-50 bg-black object-fill aspect-video"
                    )}
                  >
                  </video>
                  : <iframe
                    className={""}
                    src={`http://218.78.133.200:9090/tm?instanceId=${instanceId || "ce2bd19b-d039-4c5c-b49d-abc8a87696d5"}&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySUQiOjEsImV4cCI6NDg2OTEwMjE4M30._ZpDlaUdHMz4gyPije6fhOANi8OgEAGl23eRv6JWprA`}
                    id={"player3"}></iframe>
                : currentPlatform === AlgorithmPlatform.CloudPlatForm ? <iframe
                    className={"w-80 h-60 rounded-[16px]"}
                    id={"player3"}
                    src={`http://218.78.133.200:9090/tm?instanceId=${instanceId || "b211d582-1211-4f24-b196-60c731eee84c"}&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySUQiOjEsImV4cCI6NDg2OTEwMjE4M30._ZpDlaUdHMz4gyPije6fhOANi8OgEAGl23eRv6JWprA`}>
                    {isFpvFullscreen && (
                      <X
                        className="absolute top-4 right-4 cursor-pointer text-white z-10"
                        size={24}
                        onClick={exitFpvFullscreen}
                      />
                    )}
                  </iframe> :
                  <video ref={otherPlatFormAiRef}
                         controls
                         autoPlay
                         className={"aspect-video w-80 rounded-lg mt-4"}
                  >
                  </video>
            ) : (
              <div className={"text-[#d0d0d0] h-[200px] flex items-center pl-6"}>
                当前设备已关机，无法进行直播
              </div>
            )}
            <div className={"py-4"}>
              <CockpitTitle title={"实时气象"}/>
            </div>
            <div className={"flex"}>
              {/*<div className={"flex flex-col content-center"}>
                <img className={"translate-y-12"} src={cloudyPng} alt=""/>
                <img src={weatherBasePng} alt=""/>
              </div>*/}
              <div className={"pl-[32px] flex justify-center items-center space-x-2"}>
                <span>温度：</span>
                <div className={"text-[34px]"}>
                  {deviceInfo.dock?.basic_osd?.environment_temperature}°C
                </div>
              </div>
            </div>
            <div className={"grid grid-cols-2 mt-[16px]"}>
              <div className={"flex"}>
                <img src={humidityPng} alt=""/>
                <div className={"flex flex-col"}>
                  <span>湿度</span>
                  <span className={"text-[18px] text-[#32A3FF]"}>
                    {deviceInfo.dock?.basic_osd?.humidity}
                  </span>
                </div>
              </div>
              <div className={"flex"}>
                <img src={rainyPng} alt=""/>
                <div className={"flex flex-col"}>
                  <span>降雨</span>
                  <span className={"text-[18px] text-[#32A3FF]"}>
                    {RainfallEnum[deviceInfo.dock?.basic_osd?.rainfall]}
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
              <CockpitFlyControl sn={dockSn}/>
            </div>
          </div>
        </form>
      </Form>
    </FitScreen>
  );
};

export default Cockpit;

