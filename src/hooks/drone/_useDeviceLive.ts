import {useAjax} from "@/lib/http.ts";
import {CURRENT_CONFIG} from "@/lib/config.ts";
import JSWebrtc from "@/vendor/jswebrtc.min.js";
import {useToast} from "@/components/ui/use-toast.ts";
import {useCapacity} from "@/hooks/drone/index.ts";
import {useCallback, useMemo} from "react";

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

export const useDeviceLive = (ele?: HTMLVideoElement | null, deviceSn?: string, isFpv?: boolean) => {
  const {post} = useAjax();
  const {toast} = useToast();
  const {data: deviceList} = useCapacity();

  const device = deviceList?.find(item => item.sn === deviceSn);

  const videoId = useMemo(() => {
    if (!device || !deviceSn) return;
    const cameras_list = device?.cameras_list;
    if (cameras_list.length === 1) {
      return deviceSn + "/" + cameras_list[0].index + "/" + cameras_list[0].videos_list[0].index;
    } else if (isFpv) {
      const camera = cameras_list.find(item => item.name === "FPV");
      if (!camera) return;
      return deviceSn + "/" + camera.index + "/" + camera.videos_list[0].index;
    } else {
      const camera = cameras_list.find(item => item.name !== "FPV");
      if (!camera) return;
      return deviceSn + "/" + camera.index + "/" + camera.videos_list[0].index;
    }
  }, [device, deviceSn, isFpv]);

  const webRtcUrl = useMemo(() => {
    if (!videoId) return;
    const list = videoId.split("/");
    if (list.length < 2) {
      return;
    }
    return `webrtc://${CURRENT_CONFIG.rtcIp}/live/${list[0]}-${list[1]}`;
  }, [videoId]);
  console.log('webRtcUrl========');
  console.log(webRtcUrl);
  const startLive = useCallback(async () => {
    console.log(111);
    if (!webRtcUrl || !videoId) {
      return;
    }
    console.log(222);
    try {
      const res: any = await post(`${MANAGE_HTTP_PREFIX}/live/streams/start`, {
        url: CURRENT_CONFIG.rtmpURL,
        url_type: 1,
        video_id: videoId,
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
        new jswebrtc.Player(webRtcUrl, {
          video: ele,
          autoplay: true,
          onPlay: () => {
            console.log("start play livestream");
          }
        });
      }
    }
  }, [videoId, ele, webRtcUrl]);

  const stopLive = useCallback(async () => {
    try {
      await post(`${MANAGE_HTTP_PREFIX}/live/streams/stop`, {
        video_id: videoId,
      });
      toast({
        description: "设备停止直播"
      });
    } catch (err) {

    }
  }, [videoId]);

  const updateClarity = useCallback(async (value: number) => {
    try {
      await post(`${MANAGE_HTTP_PREFIX}/live/streams/update`, {
        video_id: videoId,
        video_quality: value
      });
      toast({
        description: "切换清晰度成功"
      });
    } catch (err) {

    }
  }, [videoId]);

  return {
    startLive,
    stopLive,
    updateClarity
  };
};
