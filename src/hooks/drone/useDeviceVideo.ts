import {useState} from "react";
import {useVideoJS} from "react-hook-videojs";
import {useSceneStore} from "@/store/useSceneStore.ts";
import {useCapacity} from "@/hooks/drone/index.ts";
import {CURRENT_CONFIG} from "@/lib/config.ts";
import {convertWebRTCtoHTTP, extractIPFromRTMP} from "@/lib/utils.ts";
import {useAjax} from "@/lib/http.ts";
import {toast} from "@/components/ui/use-toast.ts";

const MANAGE_HTTP_PREFIX = "/manage/api/v1";

export const clarityList = [
  {
    value: 0,
    label: "自适应"
  },
  {
    value: 1,
    label: "流畅"
  },
  {
    value: 2,
    label: "标准"
  },
  {
    value: 3,
    label: "高清"
  },
  {
    value: 4,
    label: "超清"
  }
];

// export const videoType = [
//   {
//     value: "wide",
//     label: "广角"
//   },
//   {
//     value: "zoom",
//     label: "变焦"
//   },
//   {
//     value: "ir",
//     label: "红外"
//   }
// ];

export enum VideoType {
  NORMAL = "normal",
  WIDE = "wide",
  ZOOM = "zoom",
  IR = "ir"
}

export const videoTypeLabel = {
  [VideoType.NORMAL]: "正常",
  [VideoType.WIDE]: "广角",
  [VideoType.ZOOM]: "变焦",
  [VideoType.IR]: "红外",
};

export const useDeviceVideo = () => {
  const [dockVideoSrc, setDockVideoSrc] = useState("");
  const [deviceVideoSrc, setDeviceVideoSrc] = useState("");
  // dock流畅度
  const [dockPosition, setDockPosition] = useState("0");
  // 飞机流畅度
  const [devicePosition, setDevicePosition] = useState("0");
  const [currentDeviceCamera, setCurrentDeviceCamera] = useState("");
  const osdVisible = useSceneStore(state => state.osdVisible);
  const {data: capacityData} = useCapacity();
  const {post} = useAjax();
  const [currentMode, setCurrentMode] = useState("normal");

  const {Video} = useVideoJS({
    controls: true,
    autoplay: true,
    preload: "auto",
    fluid: false,
    sources: [{src: dockVideoSrc}],
  });

  const {Video: DeviceVideo} = useVideoJS({
    controls: true,
    autoplay: true,
    preload: "auto",
    fluid: false,
    sources: [{src: deviceVideoSrc}],
  });

  const startDockVideo = async (dockSn: string) => {
    const videoId = capacityData?.find(item => item.sn === dockSn)?.cameras_list[0].index;
    if (!videoId) {
      return;
    }
    try {
      const res: any = await post(`${MANAGE_HTTP_PREFIX}/live/streams/start`, {
        url: CURRENT_CONFIG.rtmpURL,
        url_type: 1,
        video_id: `${dockSn}/${videoId}/normal-0`,
        video_quality: +dockPosition
      });
      setDockVideoSrc(convertWebRTCtoHTTP(res.data.data.url));
    } catch (err: any) {
      if (err.data.code === 513003) {
        console.log(`http://${extractIPFromRTMP(CURRENT_CONFIG.rtmpURL)}:8080/live/${dockSn}-${videoId}.m3u8`);
        setDockVideoSrc(`http://${extractIPFromRTMP(CURRENT_CONFIG.rtmpURL)}:8080/live/${dockSn}-${videoId}.m3u8`);
      }
    }
  };

  const onRefreshDockVideo = async (dockSn: string) => {
    if (!dockSn) return;

    // 先清空视频源
    setDockVideoSrc("");

    // 等待 DOM 更新
    await new Promise(resolve => setTimeout(resolve, 100));

    // 重新获取视频流
    try {
      await startDockVideo(dockSn);
      toast({
        description: "视频刷新成功"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "视频刷新失败，请重试"
      });
    }
  };

  const updateVideo = async (dockSn: string, video_quality: number, type: "dock" | "device" = "dock", indexCode?: string) => {
    const videoId = capacityData?.find(item => item.sn === dockSn)?.cameras_list[0].index;
    if (!videoId) {
      return;
    }
    try {
      await post(`${MANAGE_HTTP_PREFIX}/live/streams/update`, {
        video_id: `${dockSn}/${indexCode || videoId}/normal-0`,
        video_quality
      });
      type === "dock" ? setDockPosition(video_quality.toString()) : setDevicePosition(video_quality.toString());
    } catch (err) {
      console.log(err);
    }
  };

  const stopDockVideo = async () => {
    const dockSn = osdVisible.gateway_sn;
    const videoId = capacityData?.find(item => item.sn === dockSn)?.cameras_list[0].index;
    await post(`${MANAGE_HTTP_PREFIX}/live/streams/stop`, {
      video_id: `${dockSn}/${videoId}/normal-0`
    });
    setDockVideoSrc("");
  };

  const startDeviceVideo = async (sn: string, indexCode?: string) => {
    const videoId = capacityData?.find(item => item.sn === sn)?.cameras_list[0].index;
    if (!videoId) {
      return;
    }
    try {
      const res: any = await post(`${MANAGE_HTTP_PREFIX}/live/streams/start`, {
        url: CURRENT_CONFIG.rtmpURL,
        url_type: 1,
        video_id: `${sn}/${indexCode || videoId}/normal-0`,
        video_quality: +devicePosition
      });
      // setDeviceVideoSrc("http://106.14.197.27:8080/live/1581F5BMD239S002ZGK5-39-0-7.m3u8");
      console.log("convertWebRTCtoHTTP(res.data.data.url)");
      console.log(convertWebRTCtoHTTP(res.data.data.url));
      setCurrentDeviceCamera(indexCode || videoId);
      setDeviceVideoSrc(convertWebRTCtoHTTP(res.data.data.url));
    } catch (err: any) {
      if (err.data.code === 513003) {
        console.log(`http://${extractIPFromRTMP(CURRENT_CONFIG.rtmpURL)}:8080/live/${sn}-${videoId}.m3u8`);
        setCurrentDeviceCamera(indexCode || videoId);
        setDeviceVideoSrc(`http://${extractIPFromRTMP(CURRENT_CONFIG.rtmpURL)}:8080/live/${sn}-${indexCode || videoId}.m3u8`);
      }
    }
  };

  const onRefreshDeviceVideo = async (deviceSn: string) => {
    if (!deviceSn) return;

    // 先清空视频源
    setDeviceVideoSrc("");

    // 等待 DOM 更新
    await new Promise(resolve => setTimeout(resolve, 100));

    // 重新获取视频流
    try {
      await startDeviceVideo(deviceSn, currentDeviceCamera);
      toast({
        description: "视频刷新成功"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "视频刷新失败，请重试"
      });
    }
  };

  const stopDeviceVideo = async (indexCode?: string) => {
    if (!indexCode) return;
    const sn = osdVisible.sn;
    // const videoId = capacityData?.find(item => item.sn === sn)?.cameras_list[0].index;
    await post(`${MANAGE_HTTP_PREFIX}/live/streams/stop`, {
      video_id: `${sn}/${indexCode}/normal-0`
    });
    // setDeviceVideoSrc("");
  };

  const switchDeviceVideoMode = async (mode: "ir" | "zoom" | "wide" | "normal", indexCode?: string,) => {
    if (mode === "normal") return;
    if (!indexCode) return;
    const sn = osdVisible.sn;
    await post(`${MANAGE_HTTP_PREFIX}/live/streams/switch`, {
      video_id: `${sn}/${indexCode}/normal-0`,
      video_type: mode
    });
    setCurrentMode(mode);
  };

  return {
    dockVideoSrc,
    setDockVideoSrc,
    deviceVideoSrc,
    setDeviceVideoSrc,
    Video,
    DeviceVideo,
    startDockVideo,
    stopDockVideo,
    startDeviceVideo,
    stopDeviceVideo,
    updateVideo,
    onRefreshDockVideo,
    onRefreshDeviceVideo,
    dockPosition,
    devicePosition,
    setDockPosition,
    setDevicePosition,
    currentDeviceCamera,
    setCurrentDeviceCamera,
    switchDeviceVideoMode,
    currentMode,
    setCurrentMode
  };
};
