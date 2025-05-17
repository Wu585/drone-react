import {useAjax} from "@/lib/http.ts";
import {CURRENT_CONFIG} from "@/lib/config.ts";
import JSWebrtc from "@/vendor/jswebrtc.min.js";
import {useToast} from "@/components/ui/use-toast.ts";
import {useCapacity} from "@/hooks/drone/index.ts";
import {useCallback, useMemo} from "react";
import {useRealTimeDeviceInfo} from "@/hooks/drone/device.ts";

// 为 JSWebrtc 添加类型声明
interface Player {
  new(url: string, options: {
    video?: HTMLVideoElement | null;
    autoplay?: boolean;
    onPlay?: () => void;
    onPause?: () => void;
    [key: string]: any;
  }): any;
}

interface JSWebrtcType {
  Player: Player;

  [key: string]: any;
}

// 断言 JSWebrtc 拥有正确的类型
const jswebrtc = JSWebrtc as unknown as JSWebrtcType;

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

export const useDeviceLive = (ele?: HTMLVideoElement | null, dockSn?: string, droneSn?: string, isFpv?: boolean) => {
  const {post} = useAjax();
  const {toast} = useToast();
  const {data: deviceList} = useCapacity();

  const dock = deviceList?.find(item => item.sn === dockSn);
  const realtime = useRealTimeDeviceInfo(dockSn);

  const dockVideoId = useMemo(() => {
    if (!dock) return;
    const dock_cameras_list = dock?.cameras_list;
    if (!dock_cameras_list || dock_cameras_list.length <= 0) return;
    return dockSn + "/" + dock_cameras_list[0].index + "/" + dock_cameras_list[0].videos_list[0].index;
  }, [dock, dockSn]);

  const droneVideoId = useMemo(() => {
    if (isFpv) {
      const device = deviceList?.find(item => item.sn === droneSn);
      if (!device) return;
      const camera_list = device.cameras_list;
      if (!camera_list || camera_list.length <= 0) return;
      const fpvCamera = camera_list.find(item => item.name.toUpperCase() === "FPV");
      if (!fpvCamera) return;
      return droneSn + "/" + fpvCamera.index + "/" + fpvCamera.videos_list[0].index;
    } else {
      const cameras = realtime.device?.cameras;
      if (!cameras || cameras.length <= 0) return;
      return droneSn + "/" + cameras[0].payload_index + "/" + "normal-0";
    }
  }, [deviceList, droneSn, isFpv, realtime]);

  const dockWebRtcUrl = useMemo(() => {
    if (!dockVideoId) return;
    const list = dockVideoId.split("/");
    if (list.length < 2) {
      return;
    }
    return `webrtc://${CURRENT_CONFIG.rtcIp}/live/${list[0]}-${list[1]}`;
  }, [dockVideoId]);

  const droneWebRtcUrl = useMemo(() => {
    if (!droneVideoId) return;
    const list = droneVideoId.split("/");
    if (list.length < 2) {
      return;
    }
    return `webrtc://${CURRENT_CONFIG.rtcIp}/live/${list[0]}-${list[1]}`;
  }, [droneVideoId]);

  const startLive = useCallback(async (isDock = true) => {
    if (isDock && (!dockWebRtcUrl || !dockVideoId)) {
      return;
    }
    try {
      const res: any = await post(`${MANAGE_HTTP_PREFIX}/live/streams/start`, {
        url: CURRENT_CONFIG.rtmpURL,
        url_type: 1,
        video_id: isDock ? dockVideoId : droneVideoId,
        video_quality: 0,
      });
      if (ele) {
        const url = res.data.data.url;
        new jswebrtc.Player(url, {
          video: ele,
          autoplay: true,
          onPlay: () => {
            console.log("start play livestream");
          }
        });
      }
    } catch (err: any) {
      if (err.data.code === 513003) {
        // 可以添加特定错误码的处理逻辑
        new jswebrtc.Player(isDock ? dockWebRtcUrl! : droneWebRtcUrl!, {
          video: ele,
          autoplay: true,
          onPlay: () => {
            console.log("start play livestream");
          }
        });
      }
    }
  }, [dockVideoId, ele, dockWebRtcUrl, droneWebRtcUrl, droneVideoId]);

  const stopLive = useCallback(async (isDock = true) => {
    try {
      await post(`${MANAGE_HTTP_PREFIX}/live/streams/stop`, {
        video_id: isDock ? dockVideoId : droneVideoId
      });
      toast({
        description: "设备停止直播"
      });
    } catch (err) {

    }
  }, [dockVideoId, droneVideoId]);

  const updateClarity = useCallback(async (value: number, isDock = true) => {
    try {
      await post(`${MANAGE_HTTP_PREFIX}/live/streams/update`, {
        video_id: isDock ? dockVideoId : droneVideoId,
        video_quality: value
      });
      toast({
        description: "切换清晰度成功"
      });
    } catch (err) {

    }
  }, [dockVideoId, droneVideoId]);

  return {
    startLive,
    stopLive,
    updateClarity,
    dockVideoId,
    droneVideoId,
    dockWebRtcUrl,
    droneWebRtcUrl
  };
};
