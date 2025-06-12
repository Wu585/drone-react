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
import {useDeviceTopo, useOnlineDocks, usePermission, useWaylinJobs} from "@/hooks/drone";
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
import {EDockModeCode, EModeCode, EModeCodeMap, RainfallEnum, RainfallMap} from "@/types/device.ts";
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
import {useWeatherInfo} from "@/hooks/flood-prevention/api.ts";
import {ELocalStorageKey} from "@/types/enum.ts";
import wenduPng from "@/assets/images/drone/cockpit/wendu.png";
import fengliPng from "@/assets/images/drone/cockpit/fengli.png";
import fengxiangPng from "@/assets/images/drone/cockpit/fengxiang.png";
import jiangyuPng from "@/assets/images/drone/cockpit/jiangyu.png";
import compassAroundPng from "@/assets/images/drone/cockpit/bg-compass-around.png";

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
  console.log("deviceInfo");
  console.log(deviceInfo);
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

  const onFlyTo = async () => {
    try {
      await post(`${DRC_API_PREFIX}/devices/${dockSn}/jobs/fly-to-point`, {
        max_speed: 14,
        points: [
          {
            latitude: contextMenu.latitude,
            longitude: contextMenu.longitude,
            height: 100
          }
        ]
      });
      toast({
        description: "指点飞行成功"
      });
    } catch (err: any) {
      toast({
        description: "指点飞行失败！",
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

  const {data: weatherInfo} = useWeatherInfo("101021000");
  const workspaceId = localStorage.getItem(ELocalStorageKey.WorkspaceId)!;
  const {data: currentJobList} = useWaylinJobs(workspaceId, {
    page: 1,
    page_size: 10,
    status: 2,
    dock_sn: dockSn
  });

  const result = groupByDevicePlatformAndName(algorithmConfigList?.records || []);

  const navigate = useNavigate();

  // 切换中屏显示
  const [videoLayout, setVideoLayout] = useState<"default" | "switched">("default");

  const switchVideos = () => {
    setVideoLayout(prev => prev === "default" ? "switched" : "default");
  };

  const {hasPermission} = usePermission();
  const hasFlyControlPermission = hasPermission("Collection_DeviceControlBasic");


  const {data: deviceTopo} = useDeviceTopo();
  const currentTopo = deviceTopo?.find(item => item.device_sn === dockSn);
  console.log("currentTopo");
  console.log(currentTopo);

  const capacity_percent = deviceInfo && deviceInfo.device &&
    deviceInfo.device?.battery?.capacity_percent || deviceInfo.dock?.work_osd?.drone_battery_maintenance_info?.batteries[0]?.capacity_percent;

  return (
    <FitScreen mode={"full"}>
      <div
        style={{backgroundSize: "100% 100%"}}
        className={"h-full bg-cockpit relative grid grid-cols-5"}>
        <header
          className={"bg-cockpit-header h-40 bg-full-size absolute top-0 w-full left-0 flex justify-center text-lg px-4"}>
          {/* 左边部分（靠左） */}
          <div className={"flex-1 flex justify-start py-2"}>
            <Undo2
              className="cursor-pointer text-white w-12"
              size={24}
              onClick={() => {
                navigate("/tsa");
              }}/>
            <span>{currentTopo?.nickname + " - " + currentTopo?.children.nickname}</span>
          </div>
          {/* 中间部分（绝对居中） */}
          <div className={"py-4 text-xl"}>
            虚拟座舱 -
            <span className={
              deviceInfo.dock?.basic_osd?.drone_in_dock && !deviceInfo.device
                ? "text-yellow-500 px-2 font-bold"
                : !deviceInfo.device || deviceInfo.device?.mode_code === EModeCode.Disconnected
                  ? "text-red-500 px-2 font-bold"
                  : "text-[#00ee8b] px-2 font-bold"
            }>
        {deviceStatus2}
          </span>
          </div>
          {/* 右边部分（靠右） */}
          <div className="flex-1 flex justify-end space-x-6 py-2">
            <div className={"flex space-x-2"}>
              <img className={"h-6"} src={wenduPng} alt=""/>
              <span>{deviceInfo.dock?.basic_osd?.environment_temperature}°C</span>
            </div>
            <div className={"flex  space-x-2"}>
              <img className={"h-6"} src={fengliPng} alt=""/>
              <span>{weatherInfo?.[0]?.realtime.wS}</span>
            </div>
            <div className={"flex  space-x-2"}>
              <img className={"h-6"} src={fengxiangPng} alt=""/>
              <span>{weatherInfo?.[0]?.realtime.wD}</span>
            </div>
            <div className={"flex space-x-2"}>
              <img className={"h-6"} src={jiangyuPng} alt=""/>
              <span>{RainfallMap[deviceInfo.dock?.basic_osd?.rainfall]}</span>
            </div>
          </div>
        </header>
        <div className={"border-2"}>
          111
        </div>
        <div className={"border-2 col-span-3 pt-20 grid grid-rows-10"}>
          <div style={{
            backgroundSize: "100% 100%"
          }} className={"bg-center-video row-span-7 content-center z-100"}>
            {deviceStatus !== EModeCodeMap[EModeCode.Disconnected] ? (
              <div
                className={"w-[90%] h-[88%] overflow-hidden cursor-crosshair [clip-path:polygon(50px_0,calc(100%-50px)_0,100%_60px,100%_calc(100%-70px),calc(100%-60px)_100%,60px_100%,0_calc(100%-70px),0_60px)]"}>
                <video
                  ref={droneCloudVideoRef}
                  autoPlay
                  className={"w-full h-full aspect-video object-fill"}
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
              </div>
            ) : (
              <div className={"text-[#d0d0d0]"}>
                当前设备已关机，无法进行直播
              </div>
            )}
          </div>
          <div className={"row-span-3 grid grid-cols-5"}>
            <div className={"col-span-1 grid grid-rows-3"}>
              <div className={"content-center space-x-6"}>
                <img className={"h-1/2"} src={batteryPng} alt=""/>
                <div className={"flex flex-col"}>
                  <span className={"text-[#D0D0D0]"}>电池电量</span>
                  <span
                    className={"whitespace-nowrap"}>{capacity_percent ? capacity_percent + " %" : "--"}</span>
                </div>
              </div>
              <div className={"content-center space-x-6"}>
                <img className={"h-1/2"} src={asl} alt=""/>
                <div className={"flex flex-col"}>
                  <span className={"text-[#D0D0D0]"}>海拔高度</span>
                  <span
                    className={"whitespace-nowrap"}>{!deviceInfo.device || deviceInfo.device.height === str ? str : parseFloat(deviceInfo.device?.height as string).toFixed(2) + " m"}</span>
                </div>
              </div>
              <div className={"content-center space-x-6"}>
                <img className={"h-1/2"} src={batteryPng} alt=""/>
                <div className={"flex flex-col"}>
                  <span className={"text-[#D0D0D0]"}>起始点距离</span>
                  <span
                    className={"whitespace-nowrap"}>{!deviceInfo.device || deviceInfo.device.home_distance.toString() === str ? str : (+deviceInfo.device?.home_distance).toFixed(2) + " m"}</span>
                </div>
              </div>
            </div>
            <div className={"col-span-3 border-2 grid grid-cols-7"}>
              <div className={"col-span-2"}>11</div>
              <div className={"col-span-3 border-2"}>
                <div className={"relative border-2 h-full content-center aspect-square"}>
                  <img src={compassAroundPng} alt="" className={"absolute w-full aspect-square"}
                       style={{
                         scale: "1.8"
                       }}/>
                  <img src={compassPng}
                       style={{
                         transform: `rotate(${-(headingDegrees || 0)}deg)`,
                         transition: "transform 0.3s ease-out",
                         scale: "0.6"
                       }}
                       className={"aspect-square w-full"} alt=""
                  />
                  <img src={pointerPng} alt="" className={"absolute"}/>
                </div>
              </div>
              <div className={"col-span-2"}>33</div>
            </div>
            <div className={"col-span-1 border-2 py-4 px-2"}>
              <div
                style={{
                  backgroundSize: "100% 100%"
                }}
                className={"h-full bg-degrees-group grid grid-rows-3"}>
                <div className={"relative px-4"}>
                  <div className={"absolute left-[21%] top-[38%]"}>
                    <div className={"flex justify-center flex-col items-center"}>
                      <span className={"text-sm text-[#D0D0D0]"}>偏航角</span>
                      <span className={"text-sm"}>90°</span>
                    </div>
                    <div></div>
                  </div>
                </div>
                <div className={"grid grid-cols-2 relative"}>
                  <div className={"absolute right-[13%] top-[40%] flex flex-col items-center"}>
                    <span className={"text-sm text-[#D0D0D0]"}>俯仰角</span>
                    <span className={"text-sm"}>90°</span>
                  </div>
                </div>
                <div className={"grid grid-cols-2 relative"}>
                  <div className={"absolute left-[14%] top-[16%] flex flex-col items-center"}>
                    <span className={"text-sm text-[#D0D0D0]"}>横滚角</span>
                    <span className={"text-sm"}>90°</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={"border-2"}>
          111
        </div>
      </div>
    </FitScreen>
  );
};

export default Cockpit;

