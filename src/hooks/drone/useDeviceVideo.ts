import {useState} from "react";
import {useVideoJS} from "react-hook-videojs";
import {useSceneStore} from "@/store/useSceneStore.ts";
import {useCapacity} from "@/hooks/drone/index.ts";
import {CURRENT_CONFIG} from "@/lib/config.ts";
import {convertWebRTCtoHTTP, extractIPFromRTMP} from "@/lib/utils.ts";
import {useAjax} from "@/lib/http.ts";

const MANAGE_HTTP_PREFIX = "/manage/api/v1";

export const useDeviceVideo = () => {
  const [dockVideoSrc, setDockVideoSrc] = useState("");
  const [deviceVideoSrc, setDeviceVideoSrc] = useState("");
  const osdVisible = useSceneStore(state => state.osdVisible);
  const {data: capacityData} = useCapacity();
  const {post} = useAjax();

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
        video_quality: 0
      });
      setDockVideoSrc(convertWebRTCtoHTTP(res.data.data.url));
    } catch (err: any) {
      if (err.data.code === 513003) {
        console.log(`http://${extractIPFromRTMP(CURRENT_CONFIG.rtmpURL)}:8080/live/${dockSn}-${videoId}.m3u8`);
        setDockVideoSrc(`http://${extractIPFromRTMP(CURRENT_CONFIG.rtmpURL)}:8080/live/${dockSn}-${videoId}.m3u8`);
      }
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

  const startDeviceVideo = async (sn: string) => {
    const videoId = capacityData?.find(item => item.sn === sn)?.cameras_list[0].index;
    if (!videoId) {
      return;
    }
    try {
      const res: any = await post(`${MANAGE_HTTP_PREFIX}/live/streams/start`, {
        url: CURRENT_CONFIG.rtmpURL,
        url_type: 1,
        video_id: `${sn}/${videoId}/normal-0`,
        video_quality: 0
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

  const stopDeviceVideo = async () => {
    const sn = osdVisible.sn;
    const videoId = capacityData?.find(item => item.sn === sn)?.cameras_list[0].index;
    await post(`${MANAGE_HTTP_PREFIX}/live/streams/stop`, {
      video_id: `${sn}/${videoId}/normal-0`
    });
    setDeviceVideoSrc("");
  };

  return {
    dockVideoSrc,
    deviceVideoSrc,
    Video,
    DeviceVideo,
    startDockVideo,
    stopDockVideo,
    startDeviceVideo,
    stopDeviceVideo
  };
};
