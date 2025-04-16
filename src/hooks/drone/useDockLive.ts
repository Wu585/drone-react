import {useEffect, useRef, useState} from "react";
import AgoraRTC, {IAgoraRTCClient, IAgoraRTCRemoteUser} from "agora-rtc-sdk-ng";
import {toast} from "@/components/ui/use-toast.ts";
import {useCapacity} from "@/hooks/drone/index.ts";
import {useAjax} from "@/lib/http.ts";

export const AGORA_APP_ID = "066e9b3262924e5680048ed3472c3070";
const MANAGE_HTTP_PREFIX = "/manage/api/v1";

export const useDockLive = (ele: string, dockSn: string, cameraIndex?: string) => {
  const agoraClientRef = useRef<IAgoraRTCClient | null>(null);
  const {data: capacityData} = useCapacity();
  const {post} = useAjax();
  // dock流畅度
  const [dockPosition, setDockPosition] = useState("0");
  const [currentMode, setCurrentMode] = useState("normal");
  const [agoraLiveParam, setAgoraLiveParam] = useState({
    channel: "",
    token: ""
  });

  useEffect(() => {
    agoraClientRef.current = AgoraRTC.createClient({mode: "live", codec: "vp8"});
    const agoraClient = agoraClientRef.current;
    agoraClient.setClientRole("audience", {level: 2});
    agoraClient.on("user-published", async (user: IAgoraRTCRemoteUser, mediaType: "audio" | "video") => {
      await agoraClient.subscribe(user, mediaType);
      if (mediaType === "video") {
        console.log("subscribe success");
        // Get `RemoteVideoTrack` in the `user` object.
        const remoteVideoTrack = user.videoTrack!;
        // Dynamically create a container in the form of a DIV element for playing the remote video track.
        remoteVideoTrack.play(document.getElementById(ele) as HTMLElement);
      }
    });

    agoraClient.on("exception", async (e: any) => {
      console.log(e);
      toast({
        description: e.msg,
        variant: "destructive"
      });
    });

    return () => {
      agoraClient.leave();
      // onStopLiveStream();
    };
  }, []);

  const dockCamera = capacityData?.find(item => item.sn === dockSn);
  let dockVideoId;
  if (cameraIndex) {
    dockVideoId = dockCamera ? `${dockSn}/${dockCamera?.cameras_list?.[+cameraIndex].index}/${dockCamera?.cameras_list?.[+cameraIndex].videos_list[0].index}` : "";
  } else {
    dockVideoId = dockCamera ? `${dockSn}/${dockCamera?.cameras_list?.[0].index}/${dockCamera?.cameras_list?.[0].videos_list[0].index}` : "";
  }

  const onChangeCamera = async (index: string) => {
    const agoraClient = agoraClientRef.current!;
    agoraClient.setClientRole("audience", {level: 2});
    await post(`${MANAGE_HTTP_PREFIX}/live/streams/stop`, {
      video_id: dockVideoId
    });
    const newVideoId = `${dockSn}/${index}/normal-0`;
    const res: any = await post(`${MANAGE_HTTP_PREFIX}/live/streams/start`, {
      video_id: newVideoId,
      url_type: 0,
      video_quality: 0,
    });
    const {token, channel} = res.data.data;
    // const
    if (agoraClient.connectionState === "DISCONNECTED") {
      await agoraClient.join(AGORA_APP_ID, channel, token);
    }
  };

  const onStartLiveStream = async () => {
    const agoraClient = agoraClientRef.current!;
    agoraClient.setClientRole("audience", {level: 2});
    if (!dockVideoId) return;
    try {
      console.log("dockVideoId=========");
      console.log(dockVideoId);
      const res: any = await post(`${MANAGE_HTTP_PREFIX}/live/streams/start`, {
        video_id: dockVideoId,
        url_type: 0,
        video_quality: 0,
        // video_type: "zoom"
      });
      const {token, channel} = res.data.data;
      setAgoraLiveParam({
        channel,
        token
      });
      // const
      if (agoraClient.connectionState === "DISCONNECTED") {
        await agoraClient.join(AGORA_APP_ID, channel, token);
      }
    } catch (error: any) {
      if (error.data.code === 513003) {
        await post(`${MANAGE_HTTP_PREFIX}/live/streams/stop`, {
          video_id: dockVideoId
        });
        await onStartLiveStream();
      }
    }
  };

  // 停止机场直播
  const onStopLiveStream = async () => {
    await post(`${MANAGE_HTTP_PREFIX}/live/streams/stop`, {
      video_id: dockVideoId
    });
  };

  const switchDeviceVideoMode = async (mode: "ir" | "zoom" | "wide" | "normal") => {
    if (!dockVideoId) return;
    // if (mode === "normal") return;
    await post(`${MANAGE_HTTP_PREFIX}/live/streams/switch`, {
      video_id: dockVideoId,
      video_type: mode
    });
    setCurrentMode(mode);
  };

  const updateVideo = async (video_quality: number) => {
    if (!dockVideoId) return;
    try {
      await post(`${MANAGE_HTTP_PREFIX}/live/streams/update`, {
        video_id: dockVideoId,
        video_quality
      });
    } catch (err) {
      console.log(err);
    }
  };

  return {
    onStartLiveStream,
    onStopLiveStream,
    dockVideoId,
    updateVideo,
    dockPosition,
    setDockPosition,
    currentMode,
    setCurrentMode,
    switchDeviceVideoMode,
    onChangeCamera,
    agoraLiveParam
  };
};
