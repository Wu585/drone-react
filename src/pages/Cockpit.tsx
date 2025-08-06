import FitScreen from "@fit-screen/react";
import batteryPng from "@/assets/images/drone/cockpit/battery.png";
import asl from "@/assets/images/drone/cockpit/asl.png";
import rtk from "@/assets/images/drone/cockpit/rtk.png";
import syfxsc from "@/assets/images/drone/cockpit/syfxsc.png";
import qsdjl from "@/assets/images/drone/cockpit/qsdjl.png";
import fhgd from "@/assets/images/drone/cockpit/fhgd.png";
import xg from "@/assets/images/drone/cockpit/xg.png";
import sldz from "@/assets/images/drone/cockpit/sldz.png";
import CockpitFlyControl from "@/components/drone/public/CockpitFlyControl.tsx";
import {clarityList} from "@/hooks/drone/useDeviceVideo.ts";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import {Task, useDeviceTopo, useOnlineDocks, useWaylinJobs} from "@/hooks/drone";
import {toast} from "@/components/ui/use-toast.ts";
import {useAjax} from "@/lib/http.ts";
import {useRealTimeDeviceInfo} from "@/hooks/drone/device.ts";
import {EModeCode, EModeCodeMap, RainfallMap} from "@/types/device.ts";
import {cn} from "@/lib/utils.ts";
import PayloadControl from "@/components/drone/PayloadControl.tsx";
import compassPng from "@/assets/images/drone/cockpit/compass.png";
import pointerPng from "@/assets/images/drone/cockpit/pointer.png";
import {
  ArrowRightLeft,
  ChevronsUpDown,
  ClipboardList,
  Maximize2,
  RefreshCcw,
  Settings,
  Triangle,
  Undo2,
  X
} from "lucide-react";
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
import {
  AlgorithmConfig,
  AlgorithmPlatform,
  cloudClient,
  useAlgorithmConfigList,
  useTaskList
} from "@/hooks/drone/algorithm";
import JSWebrtc from "@/vendor/jswebrtc.min.js";
import {useInitialConnectWebSocket} from "@/hooks/drone/useConnectWebSocket.ts";
import {useWeatherInfo} from "@/hooks/flood-prevention/api.ts";
import {ELocalStorageKey} from "@/types/enum.ts";
import wenduPng from "@/assets/images/drone/cockpit/wendu.png";
import fengliPng from "@/assets/images/drone/cockpit/fengli.png";
import fengxiangPng from "@/assets/images/drone/cockpit/fengxiang.png";
import jiangyuPng from "@/assets/images/drone/cockpit/jiangyu.png";
import compassAroundPng from "@/assets/images/drone/cockpit/bg-compass-around.png";
import wurenjiPng from "@/assets/icons/wurenji.svg";
import GaugeBar from "@/components/public/GaugeBar.tsx";
import titleIcon from "@/assets/images/drone/cockpit/title-icon.png";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group.tsx";
import {WorkOrderCarousel} from "@/components/drone/WorkOrderCarousel.tsx";
import {Switch} from "@/components/ui/switch.tsx";
import {useSceneStore} from "@/store/useSceneStore.ts";
import CustomPopover from "@/components/public/CustomPopover.tsx";
import {TaskStatus, TaskType, TaskTypeMap} from "@/types/task.ts";
import {getCustomSource} from "@/hooks/public/custom-source.ts";
import startPng from "@/assets/images/start.png";
import endPng from "@/assets/images/end.png";
import {CommonButton} from "@/components/drone/public/CommonButton.tsx";
import CommonDialog from "@/components/drone/public/CommonDialog.tsx";
import {IconButton} from "@/components/drone/public/IconButton.tsx";
import dayjs from "dayjs";
import {CommonTable} from "@/components/drone/public/CommonTable.tsx";
import {ColumnDef} from "@tanstack/react-table";
import {formatTaskStatus} from "@/hooks/drone/task";
import {CommonTooltip} from "@/components/drone/public/CommonTooltip.tsx";

// DRC 链路
const DRC_API_PREFIX = "/control/api/v1";

const str = "--";

type ModuleType = "drone" | "dock" | "map" | "ai";

const Cockpit = () => {
  useInitialConnectWebSocket();

  const {clearDeviceState} = useSceneStore();

  useEffect(() => {
    clearDeviceState();
  }, [clearDeviceState]);

  const [mainView, setMainView] = useState<ModuleType>("drone");
  const [dockView, setDockView] = useState<ModuleType>("dock");
  const [mapView, setMapView] = useState<ModuleType>("map");
  const [aiView, setAiView] = useState<ModuleType>("ai");

  const {post} = useAjax();
  const {onlineDocks} = useOnlineDocks();
  const [searchParams] = useSearchParams();
  const dockSn = searchParams.get("gateway_sn") || "";
  const deviceSn = searchParams.get("sn") || "";
  // const instanceId = searchParams.get("instance_id") || "";
  const [instanceId, setInstanceId] = useState("");
  const deviceInfo = useRealTimeDeviceInfo(dockSn, deviceSn);

  // 是否适宜飞行
  const canFly = useMemo(() => {
    if (!deviceInfo || !deviceInfo.dock || !deviceInfo.dock.basic_osd) {
      return "--";
    }
    return deviceInfo.dock.basic_osd.wind_speed < 8 && deviceInfo.dock.basic_osd.rainfall < 1;
  }, [deviceInfo]);

  const deviceStatus2 = useMemo(() => {
    if (!deviceInfo?.dock) return "离线";
    if (deviceInfo.dock?.basic_osd?.drone_in_dock && !deviceInfo.device) {
      return "飞行器在舱内，暂无执行任务";
    } else {
      return EModeCodeMap[deviceInfo.device?.mode_code];
    }
  }, [deviceInfo]);

  const deviceStatus = !deviceInfo.device ? EModeCodeMap[EModeCode.Disconnected] : EModeCodeMap[deviceInfo.device?.mode_code];

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
    // if (showDockLive) {
    //   await startDockLive();
    // }
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
      /*toast({
        description: "获取云台控制权成功"
      });*/
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

  const onFlyTo = useCallback(async () => {
    const targetHeight = +deviceInfo.device.height;
    const commander_flight_height = localStorage.getItem(ELocalStorageKey.CommanderFlightHeight) ? +localStorage.getItem(ELocalStorageKey.CommanderFlightHeight)! : 120;
    const dockHeight = deviceInfo.dock?.basic_osd?.height;

    try {
      await post(`${DRC_API_PREFIX}/devices/${dockSn}/jobs/fly-to-point`, {
        max_speed: 14,
        points: [
          {
            latitude: contextMenu.latitude,
            longitude: contextMenu.longitude,
            height: targetHeight
          }
        ]
      });
      toast({
        description: "指点飞行成功"
      });
      getCustomSource("drone-wayline")?.entities.removeAll();

      const longitude = deviceInfo.device?.longitude;
      const latitude = deviceInfo.device?.latitude;
      const height = deviceInfo.device?.height;

      getCustomSource("drone-wayline")?.entities.add({
        position: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
        billboard: {
          image: startPng,
          width: 64,
          height: 64,
        },
      });

      getCustomSource("drone-wayline")?.entities.add({
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArrayHeights([
            longitude, latitude, height,
            longitude, latitude, targetHeight > +dockHeight + commander_flight_height ? targetHeight : +dockHeight + commander_flight_height,

            longitude, latitude, targetHeight > +dockHeight + commander_flight_height ? targetHeight : +dockHeight + commander_flight_height,
            contextMenu.longitude, contextMenu.latitude, targetHeight > +dockHeight + commander_flight_height ? targetHeight : +dockHeight + commander_flight_height,

            contextMenu.longitude, contextMenu.latitude, targetHeight > +dockHeight + commander_flight_height ? targetHeight : +dockHeight + commander_flight_height,
            contextMenu.longitude, contextMenu.latitude, height,
          ]),
          width: 3,  // 设置折线的宽度
          material: Cesium.Color.BLUE,  // 折线的颜色
        }
      });

      getCustomSource("drone-wayline")?.entities.add({
        position: Cesium.Cartesian3.fromDegrees(contextMenu.longitude, contextMenu.latitude, height),
        billboard: {
          image: endPng,
          width: 64,
          height: 64,
        },
      });
    } catch (err: any) {
      toast({
        description: "指点飞行失败！",
        variant: "destructive"
      });
    }
  }, [deviceInfo.device?.longitude, deviceInfo.device?.latitude, deviceInfo.device?.height, deviceInfo.dock?.basic_osd?.height, dockSn, contextMenu]);

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

  const [fpvOrAi, setFpvOrAi] = useState("ai");

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
            instance_id: device.instance_id,
            task_id: device.task_id
          });
        });
      }
    });

    return result;
  }

  const [currentPlatform, setCurrentPlatform] = useState(AlgorithmPlatform.CloudPlatForm);
  const otherPlatFormAiRef = useRef<HTMLVideoElement>(null);

  const onChangeAiVideo = (platform: AlgorithmPlatform, video_id: string) => {
    setInstanceId(video_id);
    setCurrentPlatform(platform);
  };

  useEffect(() => {
    if (currentPlatform === AlgorithmPlatform.Other && instanceId && otherPlatFormAiRef.current) {
      const webrtcUrl = instanceId.replace("rtmp", "webrtc");
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

  const {data: deviceTopo} = useDeviceTopo();
  const currentTopo = deviceTopo?.find(item => item.device_sn === dockSn);

  const capacity_percent = deviceInfo && deviceInfo.device &&
    deviceInfo.device?.battery?.capacity_percent || deviceInfo.dock?.work_osd?.drone_battery_maintenance_info?.batteries[0]?.capacity_percent;

  const {data: taskList, mutate: mutateTaskList} = useTaskList({page: 1, page_size: 100, input_type: "video"});

  const onSwitchTask = async (checked: boolean, task_id?: string) => {
    if (!task_id) return;
    try {
      await cloudClient.put(`/tasks/${task_id}/${checked ? "start" : "stop"}`);
      toast({
        description: checked ? "任务启用成功！" : "任务停用成功！",
      });
      await mutateTaskList();
    } catch (err) {
      toast({
        description: checked ? "任务启用失败，请联系管理员！" : "任务停用失败，请联系管理员！",
        variant: "destructive"
      });
    }
  };

  const getTitleName = (type: ModuleType) => {
    switch (type) {
      case "dock":
        return "机场直播";
      case "drone":
        return "飞行器直播";
      case "map":
        return "地图展示";
      case "ai":
        return "AI识别";
    }
  };

  // 渲染主视频区内容
  const renderMainVideo = () => {
    if (mainView === "drone") {
      return (
        deviceStatus === EModeCodeMap[EModeCode.Disconnected] ?
          <div className="text-[#d0d0d0]">当前设备已关机，无法进行直播</div>
          : <video
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
      );
    } else if (mainView === "dock") {
      return (
        <video
          ref={dockVideoRef}
          controls
          autoPlay
          className="w-full h-full aspect-video object-fill"
        />
      );
    } else if (mainView === "map") {
      return <div className={"relative w-full h-full"}>
        <CockpitScene/>
        <RightClickPanel>
          <MenuItem onClick={onFlyTo}>飞向此处</MenuItem>
        </RightClickPanel>
      </div>;
    } else if (mainView === "ai") {
      return deviceStatus !== EModeCodeMap[EModeCode.Disconnected] ? (
        fpvDroneVideoId ?
          fpvOrAi === "fpv" ?
            <video
              ref={droneFpvVideoRef}
              controls
              autoPlay
              className={cn(
                "w-full h-full aspect-video object-fill",
                isFpvFullscreen && "!h-screen !w-screen fixed top-0 left-0 z-50 bg-black object-fill aspect-video"
              )}
            />
            : (instanceId ? <iframe
                className={"w-full h-full aspect-video object-fill"}
                src={`http://218.78.133.200:9090/tm?instanceId=${instanceId}&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySUQiOjEsImV4cCI6NDg2OTEwMjE4M30._ZpDlaUdHMz4gyPije6fhOANi8OgEAGl23eRv6JWprA`}
                id={"player3"}/> :
              <div className={"text-[#d0d0d0]"}>请选择算法</div>)
          : currentPlatform === AlgorithmPlatform.CloudPlatForm ? (instanceId ? <iframe
              className={"w-full h-full aspect-video object-fill"}
              id={"player3"}
              src={`http://218.78.133.200:9090/tm?instanceId=${instanceId}&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySUQiOjEsImV4cCI6NDg2OTEwMjE4M30._ZpDlaUdHMz4gyPije6fhOANi8OgEAGl23eRv6JWprA`}>
              {isFpvFullscreen && (
                <X
                  className="absolute top-4 right-4 cursor-pointer text-white z-10"
                  size={24}
                  onClick={exitFpvFullscreen}
                />
              )}
            </iframe> : <div className={"text-[#d0d0d0]"}>请选择算法</div>) :
            <video ref={otherPlatFormAiRef}
                   controls
                   autoPlay
                   className={"w-full h-full aspect-video object-fill"}
            >
            </video>
      ) : (
        <div className={"text-[#d0d0d0]"}>
          当前设备已关机，无法进行直播
        </div>
      );
    }
  };
  const renderMainViewActionGroup = (type: ModuleType) => {
    switch (type) {
      case "dock":
        return (<div style={{
          background: "linear-gradient( 270deg, rgba(76,175,255,0) 0%, rgba(36,144,232,0.29) 16%, rgba(58,186,255,0.45) 51%, rgba(40,141,222,0.37) 84%, rgba(67,171,255,0) 100%)"
        }} className={"content-center space-x-4 px-4 py-2"}>
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
        </div>);

      case "drone":
        return deviceStatus !== EModeCodeMap[EModeCode.Disconnected] ? <PayloadControl
          currentMode={droneCloudMode}
          clarity={droneCloudClarity}
          dockSn={dockSn}
          onRefreshVideo={() => startDroneLive(false)}
          updateVideo={onUpdateDroneCloudClarity}
          deviceSn={deviceSn}
          onChangeMode={onChangeDroneCloudMode}
          playerId="player2"
        /> : null;
      case "map":
        return null;
      case "ai":
        return (
          <div style={{
            background: "linear-gradient( 270deg, rgba(76,175,255,0) 0%, rgba(36,144,232,0.29) 16%, rgba(58,186,255,0.45) 51%, rgba(40,141,222,0.37) 84%, rgba(67,171,255,0) 100%)"
          }} className={"content-center space-x-4 px-4 py-2"}>
            <CustomPopover
              trigger={
                <span className={"text-[18px] flex items-center"}>
                    <ChevronsUpDown size={18}/>
                  </span>
              }
              content={
                <ToggleGroup type="single" className={"flex flex-col"}>
                  {deviceSn && result[deviceSn]?.["0"]?.map(item =>
                    <div className={"flex items-center w-full justify-between"}>
                      <ToggleGroupItem
                        className={"hover:bg-[#4BB5FF] hover:text-white w-full flex justify-between data-[state=on]:bg-[#4BB5FF] data-[state=on]:text-white"}
                        onClick={() => onChangeAiVideo?.(AlgorithmPlatform.CloudPlatForm, item.instance_id)}
                        value={item.instance_id}
                        key={item.instance_id}>{item.algorithm_name}</ToggleGroupItem>
                      {item.task_id && <Switch className={"data-[state=checked]:bg-[#4BB5FF]"} checked={
                        !!taskList?.items.find(
                          (x) =>
                            x.id === +item.task_id! &&
                            x.status &&
                            x.status !== "not_started"
                        )
                      } onCheckedChange={(checked) => onSwitchTask(checked, item.task_id)}/>}
                    </div>)}
                  {deviceSn && result[deviceSn]?.["1"]?.map(item =>
                    <ToggleGroupItem
                      className={"w-full flex justify-between hover:bg-[#4BB5FF] hover:text-white"}
                      value={item.instance_id}
                      key={item.instance_id}>{item.algorithm_name}</ToggleGroupItem>)}
                </ToggleGroup>
              }
            />
            {deviceStatus !== EModeCodeMap[EModeCode.Disconnected] && (
              <div className="flex items-center space-x-2">
                {fpvDroneVideoId && fpvOrAi === "fpv" && <RefreshCcw
                  size={17}
                  className="cursor-pointer"
                  onClick={() => startFpvLive(false)}
                />}
                {(fpvOrAi !== "fpv" || !fpvDroneVideoId) && currentPlatform === AlgorithmPlatform.CloudPlatForm && instanceId &&
                  <Maximize2
                    size={17}
                    className="cursor-pointer"
                    onClick={toggleFpvFullscreen}
                  />}
              </div>
            )}
          </div>
        );
    }
  };

  // 渲染其他区域内容
  const renderOtherView = (type: ModuleType) => {
    switch (type) {
      case "dock":
        return (
          <video
            ref={dockVideoRef}
            controls
            autoPlay
            className={"h-[268px] w-full object-fill"}
          />
        );
      case "drone":
        return (
          deviceStatus === EModeCodeMap[EModeCode.Disconnected] ?
            <div className="text-[#d0d0d0] h-[268px] content-center">当前设备已关机，无法进行直播</div> :
            <video
              ref={droneCloudVideoRef}
              controls
              autoPlay
              className="h-[268px] w-full object-fill"
            />
        );
      case "map":
        return <div className={cn("h-[268px] w-full relative", !showDockLive && "h-[550px]")}>
          <CockpitScene/>
          <RightClickPanel>
            <MenuItem onClick={onFlyTo}>飞向此处</MenuItem>
          </RightClickPanel>
        </div>;
      case "ai":
        return deviceStatus !== EModeCodeMap[EModeCode.Disconnected] ? (
          fpvDroneVideoId ?
            fpvOrAi === "fpv" ?
              <video
                ref={droneFpvVideoRef}
                controls
                autoPlay
                className={cn(
                  "h-[268px] mr-[60px] z-50 my-2 relative",
                  isFpvFullscreen && "!h-screen !w-screen fixed top-0 left-0 z-50 bg-black object-fill aspect-video"
                )}
              />
              : (instanceId ? <iframe
                  className={"h-[268px] w-full "}
                  src={`http://218.78.133.200:9090/tm?instanceId=${instanceId}&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySUQiOjEsImV4cCI6NDg2OTEwMjE4M30._ZpDlaUdHMz4gyPije6fhOANi8OgEAGl23eRv6JWprA`}
                  id={"player3"}/> :
                <div className={"h-[268px] content-center text-[#d0d0d0]"}>请选择算法</div>)
            : currentPlatform === AlgorithmPlatform.CloudPlatForm ? (instanceId ? <iframe
                className={"h-[268px] w-full object-fill"}
                id={"player3"}
                src={`http://218.78.133.200:9090/tm?instanceId=${instanceId}&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySUQiOjEsImV4cCI6NDg2OTEwMjE4M30._ZpDlaUdHMz4gyPije6fhOANi8OgEAGl23eRv6JWprA`}>
                {isFpvFullscreen && (
                  <X
                    className="absolute top-4 right-4 cursor-pointer text-white z-10"
                    size={24}
                    onClick={exitFpvFullscreen}
                  />
                )}
              </iframe> : <div className={"h-[268px] content-center text-[#d0d0d0]"}>请选择算法</div>) :
              <video ref={otherPlatFormAiRef}
                     controls
                     autoPlay
                     className={"h-[268px] w-full object-fill"}
              >
              </video>
        ) : (
          <div className={"text-[#d0d0d0] h-[268px] content-center"}>
            当前设备已关机，无法进行直播
          </div>
        );
    }
  };
  const renderOtherViewActionGroup = (type: ModuleType) => {
    switch (type) {
      case "dock":
        return (<>
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
        </>);
      case "drone":
        return null;
      case "map":
        return null;
      case "ai":
        return (
          <>
            <CustomPopover
              trigger={
                <span className={"text-[18px] flex items-center"}>
                    <ChevronsUpDown size={18}/>
                  </span>
              }
              content={
                <ToggleGroup type="single" className={"flex flex-col"}>
                  {deviceSn && result[deviceSn]?.["0"]?.map(item =>
                    <div className={"flex items-center w-full justify-between"}>
                      <ToggleGroupItem
                        className={"hover:bg-[#4BB5FF] hover:text-white w-full flex justify-between data-[state=on]:bg-[#4BB5FF] data-[state=on]:text-white"}
                        onClick={() => onChangeAiVideo?.(AlgorithmPlatform.CloudPlatForm, item.instance_id)}
                        value={item.instance_id}
                        key={item.instance_id}>{item.algorithm_name}</ToggleGroupItem>
                      {item.task_id && <Switch className={"data-[state=checked]:bg-[#4BB5FF]"} checked={
                        !!taskList?.items.find(
                          (x) =>
                            x.id === +item.task_id! &&
                            x.status &&
                            x.status !== "not_started"
                        )
                      } onCheckedChange={(checked) => onSwitchTask(checked, item.task_id)}/>}
                    </div>)}
                  {deviceSn && result[deviceSn]?.["1"]?.map(item =>
                    <ToggleGroupItem
                      className={"w-full flex justify-between hover:bg-[#4BB5FF] hover:text-white"}
                      value={item.instance_id}
                      key={item.instance_id}>{item.algorithm_name}</ToggleGroupItem>)}
                </ToggleGroup>
              }
            />
            {deviceStatus !== EModeCodeMap[EModeCode.Disconnected] && (
              <div className="flex items-center space-x-2">
                {fpvDroneVideoId && fpvOrAi === "fpv" && <RefreshCcw
                  size={17}
                  className="cursor-pointer"
                  onClick={() => startFpvLive(false)}
                />}
                {(fpvOrAi !== "fpv" || !fpvDroneVideoId) && currentPlatform === AlgorithmPlatform.CloudPlatForm && instanceId &&
                  <Maximize2
                    size={17}
                    className="cursor-pointer"
                    onClick={toggleFpvFullscreen}
                  />}
              </div>
            )}
          </>
        );
    }
  };

  const columns: ColumnDef<Task>[] = useMemo(() => {
    return [
      {
        header: "计划时间 | 实际时间",
        size: 200,
        cell: ({row}) => {
          // 格式化时间函数
          const formatTime = (timeStr: string) => {
            if (!timeStr) return "";
            const time = timeStr.split(" ")[1];  // 取空格后的时间部分
            return time ? time.substring(0, 8) : ""; // 只保留时分秒 (HH:mm:ss)
          };

          return (
            <div className="flex gap-0.5 space-x-2 whitespace-nowrap">
              <div className="text-gray-400 text-[13px]">
                {/*[{formatTime(row.original.begin_time)}-{formatTime(row.original.end_time)}]*/}
                [{formatTime(row.original.begin_time)}-{formatTime(row.original.end_time)}]
              </div>
              <div className="text-[#43ABFF] text-[13px]">
                {formatTime(row.original.execute_time) ?
                  `[${formatTime(row.original.execute_time)}-${formatTime(row.original.completed_time)}]` : "--"
                }
              </div>
            </div>
          );
        }
      },

      {
        accessorKey: "job_name",
        header: "计划名称",
        size: 140,
        cell: ({row}) => (
          <div className="truncate" title={row.original.job_name}>
            {row.original.job_name}
          </div>
        )
      },
      {
        accessorKey: "task_type",
        header: "类型",
        size: 80,
        cell: ({row}) => <span className="whitespace-nowrap">{TaskTypeMap[row.original.task_type]}</span>
      },
      {
        accessorKey: "file_name",
        header: "航线名称",
        size: 160,
        cell: ({row}) => (
          <div className="max-w-[160px] truncate" title={row.original.file_name}>
            {row.original.file_name}
          </div>
        )
      },
      {
        header: "执行状态",
        size: 100,
        cell: ({row}) =>
          <span style={{
            color: formatTaskStatus(row.original).color
          }} className={"whitespace-nowrap"}>{formatTaskStatus(row.original).text}</span>
      },
    ];
  }, []);

  const departId = localStorage.getItem("departId")!;

  const {data: jobList} = useWaylinJobs(workspaceId, {
    page: 1,
    page_size: 100,
    start_time: dayjs().format("YYYY-MM-DD 00:00:00"),
    end_time: dayjs().format("YYYY-MM-DD 23:59:59"),
    task_type: undefined as TaskType | undefined,
    dock_sn: dockSn,
    keyword: "",
    status: TaskStatus.Wait,
    organs: departId ? [+departId] : undefined
  });

  return (
    <FitScreen mode={"full"}>
      <div
        style={{backgroundSize: "100% 100%"}}
        className={"h-full bg-cockpit relative grid grid-cols-5"}>
        <header
          className={"bg-cockpit-header h-40 bg-full-size absolute top-0 w-full left-0 flex justify-center text-lg px-4 z-30"}>
          {/* 左边部分（靠左） */}
        </header>
        <div className={"absolute top-0 w-full z-50"}>
          <div className={"flex-1 content-center py-[12px] space-x-6 absolute left-0 top-0 px-4 text-lg"}>
            <div className={"bg-[#072E62]/[.7] h-8 content-center cursor-pointer rounded-lg"}
                 onClick={() => {
                   navigate("/tsa");
                 }}>
              <Undo2
                className=" text-white w-12"
                size={24}
              />
            </div>
            <img src={wurenjiPng} alt=""/>
            <span>{currentTopo?.nickname + " - " + currentTopo?.children.nickname}</span>
            {/*<CustomPopover
              trigger={<Triangle fill={"white"} size={12} className="rotate-180"/>}
              className={"max-h-48 overflow-auto max-w-80"}
              content={
                <div className={""}>
                  {!jobList ? (
                    <div className={"text-center"}>加载中...</div>
                  ) : jobList.list.length ? (
                    <>
                      <h1>待执行任务：</h1>
                      {jobList.list.map(job => (
                        <div key={job.id} className={"space-x-4"}>
                          <span>{job.begin_time}</span>
                          <span>{job.job_name}</span>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className={"text-center"}>暂无任务</div>
                  )}
                </div>
              }
            />*/}
            <CommonDialog
              titleClassname={"text-lg font-medium pl-8"}
              contentClassName={"max-w-[1000px]"}
              title={"今日飞行任务列表"}
              trigger={<IconButton>
                <ClipboardList size={16}/>
              </IconButton>}
              showCancel={false}
            >
              <CommonTable
                getRowClassName={(_, index) => index % 2 === 1 ? "bg-[#203D67]/70" : ""}
                maxHeight={"calc(100vh - 600px)"}
                manualPagination={false}
                data={jobList?.list || []}
                columns={columns}
              />
            </CommonDialog>

          </div>
          {/* 中间部分（绝对居中） */}
          <div className={"py-4 text-xl font-bold text-[#63E5FF] z-50 absolute left-1/2 top-0 -translate-x-1/2"}>
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
          <div className="absolute right-0 flex py-4 space-x-6 pr-4 text-lg">
            <div className={canFly ? "text-[#40F2FF]" : "text-red-500"}>
              {canFly ? "适宜飞行" : "不宜飞行"}：
            </div>
            <CommonTooltip trigger={<div className={"space-x-2 content-center"}>
              <img className={"h-6"} src={wenduPng} alt=""/>
              <span>{deviceInfo.dock?.basic_osd?.environment_temperature} °C</span>
            </div>}>
              <span className={"text-base"}>温度</span>
            </CommonTooltip>

            <CommonTooltip trigger={<div className={"space-x-2 content-center"}>
              <img className={"h-6"} src={fengliPng} alt=""/>
              <span>{deviceInfo.dock?.basic_osd?.wind_speed} m/s</span>
            </div>}>
              <span className={"text-base"}>风速</span>
            </CommonTooltip>

            <CommonTooltip trigger={<div className={"space-x-2 content-center"}>
              <img className={"h-6"} src={jiangyuPng} alt=""/>
              <span>{RainfallMap[deviceInfo.dock?.basic_osd?.rainfall]}</span>
            </div>}>
              <span className={"text-base"}>降雨</span>
            </CommonTooltip>
          </div>
        </div>
        <div className={"pt-32 pl-10 z-40"}>
          <div className={"row-span-2 flex flex-col space-y-2"}>
            <div className={"flex space-x-[16px] items-center whitespace-nowrap text-lg"}>
              <img src={titleIcon} alt="" className={"w-4"}/>
              <span>{getTitleName(dockView)}</span>
              {/*{mapView === "map" &&
                <X size={18} className={cn("transition-transform cursor-pointer", !showDockLive && "rotate-45")}
                   onClick={handleDockLiveToggle}/>}*/}
              {mapView === "map" &&
                <X size={16} className={cn("transition-transform cursor-pointer", !showDockLive && "rotate-45")}
                   onClick={handleDockLiveToggle}/>}
              {showDockLive && (
                <div className={"flex space-x-[16px]"}>
                  {renderOtherViewActionGroup(dockView)}
                  <ArrowRightLeft size={16} className={"cursor-pointer"} onClick={() => {
                    setMainView(dockView);
                    setDockView(mainView);
                  }}/>
                </div>
              )}
            </div>
            {showDockLive && <div className={"flex-1 relative"}>
              {renderOtherView(dockView)}
              {/* 左上角 */}
              <div className="absolute left-0 top-0" style={{
                width: "2px",
                height: "20px",
                background: "#63E5FF",
                boxShadow: "0 0 8px rgba(99, 229, 255, 0.8)",
                zIndex: 10
              }}/>
              <div className="absolute left-0 top-0" style={{
                width: "20px",
                height: "2px",
                background: "#63E5FF",
                boxShadow: "0 0 8px rgba(99, 229, 255, 0.8)",
                zIndex: 10
              }}/>

              {/* 右上角 */}
              <div className="absolute right-0 top-0" style={{
                width: "2px",
                height: "20px",
                background: "#63E5FF",
                boxShadow: "0 0 8px rgba(99, 229, 255, 0.8)",
                zIndex: 10
              }}/>
              <div className="absolute right-0 top-0" style={{
                width: "20px",
                height: "2px",
                background: "#63E5FF",
                boxShadow: "0 0 8px rgba(99, 229, 255, 0.8)",
                zIndex: 10
              }}/>

              {/* 左下角 */}
              <div className="absolute left-0 bottom-0" style={{
                width: "2px",
                height: "20px",
                background: "#63E5FF",
                boxShadow: "0 0 8px rgba(99, 229, 255, 0.8)",
                zIndex: 10
              }}/>
              <div className="absolute left-0 bottom-0" style={{
                width: "20px",
                height: "2px",
                background: "#63E5FF",
                boxShadow: "0 0 8px rgba(99, 229, 255, 0.8)",
                zIndex: 10
              }}/>

              {/* 右下角 */}
              <div className="absolute right-0 bottom-0" style={{
                width: "2px",
                height: "20px",
                background: "#63E5FF",
                boxShadow: "0 0 8px rgba(99, 229, 255, 0.8)",
                zIndex: 10
              }}/>
              <div className="absolute right-0 bottom-0" style={{
                width: "20px",
                height: "2px",
                background: "#63E5FF",
                boxShadow: "0 0 8px rgba(99, 229, 255, 0.8)",
                zIndex: 10
              }}/>
            </div>}
          </div>
          <div className={cn("flex flex-col space-y-[4px]")}>
            <div className={"flex space-x-[16px] items-center whitespace-nowrap text-lg my-2"}>
              <img src={titleIcon} alt="" className={"w-4"}/>
              <span>{getTitleName(mapView)}</span>
              <ArrowRightLeft size={16} className={"cursor-pointer"} onClick={() => {
                if (mapView === "map") {
                  setShowDockLive(true);
                }
                setMainView(mapView);
                setMapView(mainView);
              }}/>
              {renderOtherViewActionGroup(mapView)}
            </div>
            <div className={cn("relative", showDockLive ? "h-[268px]" : "h-[550px]")}>
              {renderOtherView(mapView)}
              <div className="absolute left-0 top-0" style={{
                width: "2px",
                height: "20px",
                background: "#63E5FF",
                boxShadow: "0 0 8px rgba(99, 229, 255, 0.8)",
                zIndex: 10
              }}/>
              <div className="absolute left-0 top-0" style={{
                width: "20px",
                height: "2px",
                background: "#63E5FF",
                boxShadow: "0 0 8px rgba(99, 229, 255, 0.8)",
                zIndex: 10
              }}/>

              {/* 右上角 */}
              <div className="absolute right-0 top-0" style={{
                width: "2px",
                height: "20px",
                background: "#63E5FF",
                boxShadow: "0 0 8px rgba(99, 229, 255, 0.8)",
                zIndex: 10
              }}/>
              <div className="absolute right-0 top-0" style={{
                width: "20px",
                height: "2px",
                background: "#63E5FF",
                boxShadow: "0 0 8px rgba(99, 229, 255, 0.8)",
                zIndex: 10
              }}/>

              {/* 左下角 */}
              <div className="absolute left-0 bottom-0" style={{
                width: "2px",
                height: "20px",
                background: "#63E5FF",
                boxShadow: "0 0 8px rgba(99, 229, 255, 0.8)",
                zIndex: 10
              }}/>
              <div className="absolute left-0 bottom-0" style={{
                width: "20px",
                height: "2px",
                background: "#63E5FF",
                boxShadow: "0 0 8px rgba(99, 229, 255, 0.8)",
                zIndex: 10
              }}/>

              {/* 右下角 */}
              <div className="absolute right-0 bottom-0" style={{
                width: "2px",
                height: "20px",
                background: "#63E5FF",
                boxShadow: "0 0 8px rgba(99, 229, 255, 0.8)",
                zIndex: 10
              }}/>
              <div className="absolute right-0 bottom-0" style={{
                width: "20px",
                height: "2px",
                background: "#63E5FF",
                boxShadow: "0 0 8px rgba(99, 229, 255, 0.8)",
                zIndex: 10
              }}/>
            </div>
            {/* 左上角 */}
          </div>
          <div className={"pt-4"}>
            <div className={"space-y-[16px] mt-[16px]"}>
              <div className={"grid grid-cols-2 px-[16px]"}>
                <span>当前状态：</span>
                <span
                  className={cn("font-bold", !deviceInfo.device || deviceInfo.device?.mode_code === EModeCode.Disconnected ? "text-red-500" : "text-[#00ee8b]")}>{deviceStatus}</span>
              </div>
              <div>
                <div
                  className={cn("grid grid-cols-2 px-[16px]")}>
                  <span>当前任务：</span>
                  <span
                    title={currentJobList?.list?.[0]?.job_name || "暂无任务"}
                    className={cn("font-bold truncate", currentJobList?.list?.length && currentJobList?.list?.length > 0 ? "text-green-500" : "text-yellow-500")}>
                        {currentJobList?.list?.[0]?.job_name || "暂无任务"}
                      </span>
                </div>
              </div>
              <div>
                <div
                  className={cn("grid grid-cols-2 px-[16px]")}>
                  <span>当前航线：</span>
                  <span
                    title={currentJobList?.list?.[0]?.file_name || "暂无航线"}
                    className={cn("truncate", currentJobList?.list?.length && currentJobList?.list?.length > 0 ? "text-green-500" : "text-yellow-500")}>
                        {currentJobList?.list?.[0]?.file_name || "暂无航线"}
                      </span>
                </div>
              </div>
              {/*<div>
                <div className={"grid grid-cols-2 px-[26px]"}>
                  <span>机场：</span>
                  <span>{deviceType?.gateway.model || str}</span>
                </div>
              </div>*/}
              <div>
                <div className={"grid grid-cols-2 px-[16px]"}>
                  <span>机场SN：</span>
                  <span>{deviceType?.gateway.sn || str}</span>
                </div>
              </div>
              {/*<div>
                <div className={"grid grid-cols-2 px-[26px]"}>
                  <span>设备型号：</span>
                  <span>{deviceType?.model || str}</span>
                </div>
              </div>*/}
              <div>
                <div className={"grid grid-cols-2 px-[16px]"}>
                  <span>设备SN：</span>
                  <span>{deviceType?.sn || str}</span>
                </div>
              </div>
              <div>
                <div className={"grid grid-cols-2 px-[16px]"}>
                  <span>当前经度：</span>
                  <span>{deviceInfo?.device?.longitude || str}</span>
                </div>
              </div>
              <div>
                <div className={"grid grid-cols-2 px-[16px]"}>
                  <span>当前纬度：</span>
                  <span>{deviceInfo?.device?.latitude || str}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={"col-span-3 pt-20 grid grid-rows-10"}>
          <div style={{
            backgroundSize: "100% 100%"
          }} className={"bg-center-video row-span-7 content-center z-50 relative"}>
            <div
              className={"w-[90%] h-[88%] content-center overflow-hidden cursor-crosshair [clip-path:polygon(50px_0,calc(100%-50px)_0,100%_60px,100%_calc(100%-70px),calc(100%-60px)_100%,60px_100%,0_calc(100%-70px),0_60px)]"}>
              {renderMainVideo()}
              <div className={"absolute right-36 top-16 z-50 content-center space-x-4"}>
                {renderMainViewActionGroup(mainView)}
              </div>
            </div>
          </div>
          <div className={"row-span-3 grid grid-cols-5"}>
            <div className={"col-span-1 grid grid-rows-4"}>
              <div className={"space-x-6 grid grid-cols-4 pl-12 items-center"}>
                <img className={"h-1/2"} src={batteryPng} alt=""/>
                <div className={"flex flex-col col-span-3"}>
                  <span className={"text-[#D0D0D0]"}>电池电量</span>
                  <span
                    className={"whitespace-nowrap"}>{capacity_percent && +capacity_percent <= 100 ? capacity_percent + " %" : "--"}</span>
                </div>
              </div>
              <div className={"space-x-6 grid grid-cols-4 pl-12 items-center"}>
                <img className={"h-1/2"} src={rtk} alt=""/>
                <div className={"flex flex-col col-span-3"}>
                  <span className={"text-[#D0D0D0]"}>搜星质量</span>
                  <span
                    className={"whitespace-nowrap"}>{deviceInfo.device ? deviceInfo.device.position_state.rtk_number : str}</span>
                </div>
              </div>
              <div className={"space-x-6 grid grid-cols-4 pl-12 items-center"}>
                <img className={"h-1/2 col-span-1"} src={syfxsc} alt=""/>
                <div className={"flex flex-col col-span-3"}>
                  <span className={"text-[#D0D0D0]"}>剩余飞行时长</span>
                  <span
                    className={"whitespace-nowrap"}>{deviceInfo.device ? (deviceInfo.device.battery.remain_flight_time / 60).toFixed(0) + " min" : str}</span>
                </div>
              </div>
              <div className={"space-x-6 grid grid-cols-4 pl-12 items-center"}>
                <img className={"h-1/2"} src={qsdjl} alt=""/>
                <div className={"flex flex-col col-span-3"}>
                  <span className={"text-[#D0D0D0]"}>起始点距离</span>
                  <span
                    className={"whitespace-nowrap"}>{!deviceInfo.device || deviceInfo.device.home_distance.toString() === str ? str : (+deviceInfo.device?.home_distance).toFixed(2) + " m"}</span>
                </div>
              </div>
            </div>
            <div className={"col-span-3 grid grid-cols-7 overflow-hidden"}>
              <div className={"col-span-2 content-center z-50 "}>
                <GaugeBar min={0} max={30}
                          value={deviceInfo?.device?.horizontal_speed ? +(+deviceInfo?.device?.horizontal_speed).toFixed(1) : 0}
                          name={"水平速度"}
                />
              </div>
              <div className={"col-span-3"}>
                <div className={"relative h-full content-center aspect-square"}>
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
              <div className={"col-span-2 content-center z-50 "}>
                <GaugeBar min={-15} max={15}
                          value={deviceInfo?.device?.vertical_speed ? +(+deviceInfo?.device?.vertical_speed).toFixed(1) : 0}
                          name={"垂直速度"}/>
              </div>
            </div>
            <div className={"col-span-1 grid grid-rows-4"}>
              {/*<div className={"col-span-1 grid grid-rows-4"}>*/}
              <div className={"space-x-6 grid grid-cols-4 pl-12 items-center"}>
                <img className={"h-1/2"} src={asl} alt=""/>
                <div className={"flex flex-col col-span-3"}>
                  <span className={"text-[#D0D0D0]"}>海拔高度</span>
                  <span
                    className={"whitespace-nowrap"}>{!deviceInfo.device || deviceInfo.device.height === str ? str : parseFloat(deviceInfo.device?.height as string).toFixed(2) + " m"}</span>
                </div>
              </div>
              <div className={"grid grid-cols-4 pl-12 items-center space-x-6"}>
                <img className={"h-1/2"} src={fhgd} alt=""/>
                <div className={"flex flex-col col-span-3"}>
                  <span className={"text-[#D0D0D0]"}>返航高度</span>
                  <span
                    className={"whitespace-nowrap"}>{deviceInfo.device ? deviceInfo.device.rth_altitude + " m" : str}</span>
                </div>
              </div>
              <div className={"grid grid-cols-4 pl-12 items-center space-x-6"}>
                <img className={"h-1/2"} src={xg} alt=""/>
                <div className={"flex flex-col col-span-3"}>
                  <span className={"text-[#D0D0D0]"}>限高</span>
                  <span
                    className={"whitespace-nowrap"}>{deviceInfo.device ? deviceInfo.device.height_limit + " m" : str}</span>
                </div>
              </div>
              <div className={"grid grid-cols-4 pl-12 items-center space-x-6"}>
                <img className={"h-1/2"} src={sldz} alt=""/>
                <div className={"flex flex-col col-span-3"}>
                  <span className={"text-[#D0D0D0]"}>失联动作</span>
                  <span
                    className={"whitespace-nowrap text-red-400"}>返航</span>
                </div>
                {/*</div>*/}
              </div>
              {/*<div
                style={{
                  backgroundSize: "100% 100%"
                }}
                className={"h-full bg-degrees-group grid grid-rows-3"}>
                <div className={"relative px-4"}>
                  <div className={"absolute left-[21%] top-[38%]"}>
                    <div className={"flex justify-center flex-col items-center"}>
                      <span className={"text-sm text-[#D0D0D0]"}>偏航角</span>
                      <span
                        className={"text-sm"}>{deviceInfo?.device?.attitude_head ? deviceInfo?.device?.attitude_head + "°" : "--"}</span>
                    </div>
                    <div></div>
                  </div>
                </div>
                <div className={"grid grid-cols-2 relative"}>
                  <div className={"absolute right-[13%] top-[40%] flex flex-col items-center"}>
                    <span className={"text-sm text-[#D0D0D0]"}>俯仰角</span>
                    <span
                      className={"text-sm"}>{deviceInfo?.device?.attitude_pitch ? deviceInfo?.device?.attitude_pitch + "°" : "--"}</span>
                  </div>
                </div>
                <div className={"grid grid-cols-2 relative"}>
                  <div className={"absolute left-[14%] top-[16%] flex flex-col items-center"}>
                    <span className={"text-sm text-[#D0D0D0]"}>横滚角</span>
                    <span
                      className={"text-sm"}>{deviceInfo?.device?.attitude_roll ? deviceInfo?.device?.attitude_roll + "°" : "--"}</span>
                  </div>
                </div>
              </div>*/}
            </div>
          </div>
        </div>
        <div className={"pt-32 pr-8"}>
          <div className={"row-span-2 flex flex-col space-y-2"}>
            <div className={"flex space-x-[16px] items-center whitespace-nowrap text-lg z-50"}>
              <img src={titleIcon} alt="" className={"w-4"}/>
              <span>{getTitleName(aiView)}</span>
              <ArrowRightLeft
                size={16}
                className={"cursor-pointer ml-2"}
                onClick={() => {
                  setAiView(mainView);
                  setMainView(aiView);
                }}/>
              {renderOtherViewActionGroup(aiView)}
            </div>
            <div className={"flex-1 relative"}>
              {renderOtherView(aiView)}
              {/* 左上角 */}
              <div className="absolute left-0 top-0" style={{
                width: "2px",
                height: "20px",
                background: "#63E5FF",
                boxShadow: "0 0 8px rgba(99, 229, 255, 0.8)",
                zIndex: 10
              }}/>
              <div className="absolute left-0 top-0" style={{
                width: "20px",
                height: "2px",
                background: "#63E5FF",
                boxShadow: "0 0 8px rgba(99, 229, 255, 0.8)",
                zIndex: 10
              }}/>

              {/* 右上角 */}
              <div className="absolute right-0 top-0" style={{
                width: "2px",
                height: "20px",
                background: "#63E5FF",
                boxShadow: "0 0 8px rgba(99, 229, 255, 0.8)",
                zIndex: 10
              }}/>
              <div className="absolute right-0 top-0" style={{
                width: "20px",
                height: "2px",
                background: "#63E5FF",
                boxShadow: "0 0 8px rgba(99, 229, 255, 0.8)",
                zIndex: 10
              }}/>

              {/* 左下角 */}
              <div className="absolute left-0 bottom-0" style={{
                width: "2px",
                height: "20px",
                background: "#63E5FF",
                boxShadow: "0 0 8px rgba(99, 229, 255, 0.8)",
                zIndex: 10
              }}/>
              <div className="absolute left-0 bottom-0" style={{
                width: "20px",
                height: "2px",
                background: "#63E5FF",
                boxShadow: "0 0 8px rgba(99, 229, 255, 0.8)",
                zIndex: 10
              }}/>

              {/* 右下角 */}
              <div className="absolute right-0 bottom-0" style={{
                width: "2px",
                height: "20px",
                background: "#63E5FF",
                boxShadow: "0 0 8px rgba(99, 229, 255, 0.8)",
                zIndex: 10
              }}/>
              <div className="absolute right-0 bottom-0" style={{
                width: "20px",
                height: "2px",
                background: "#63E5FF",
                boxShadow: "0 0 8px rgba(99, 229, 255, 0.8)",
                zIndex: 10
              }}/>
            </div>
          </div>
          <div className={"row-span-2 flex flex-col space-y-2 my-2"}>
            <div className={"flex space-x-[16px] items-center whitespace-nowrap text-lg"}>
              <img src={titleIcon} alt="" className={"w-4"}/>
              <span>工单照片</span>
            </div>
            <div className={"flex-1 relative"}>
              <div className={"h-[268px] w-full"}>
                <WorkOrderCarousel dockSn={dockSn}/>
              </div>
            </div>
          </div>
          <CockpitFlyControl sn={dockSn}/>
        </div>
      </div>
    </FitScreen>
  );
};

export default Cockpit;

