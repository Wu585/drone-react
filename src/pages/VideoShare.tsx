import AgoraRTC, {IAgoraRTCClient, IAgoraRTCRemoteUser} from "agora-rtc-sdk-ng";
import {useEffect, useRef} from "react";
import {toast} from "@/components/ui/use-toast.ts";
import {useSearchParams} from "react-router-dom";
import {Helmet} from "react-helmet";

const AGORA_APP_ID = "066e9b3262924e5680048ed3472c3070";

const VideoShare = () => {
  const agoraClientRef = useRef<IAgoraRTCClient | null>(null);
  const [searchParams] = useSearchParams();

  const channel = searchParams.get("channel");
  const encodedToken = searchParams.get("token");
  const token = decodeURIComponent(encodedToken || "");

  useEffect(() => {
    agoraClientRef.current = AgoraRTC.createClient({mode: "live", codec: "vp8"});
    const agoraClient = agoraClientRef.current;
    agoraClient.setClientRole("audience", {level: 2});

    if (agoraClient.connectionState === "DISCONNECTED" && channel && token) {
      agoraClient.join(AGORA_APP_ID, channel, token);
    }

    agoraClient.on("user-published", async (user: IAgoraRTCRemoteUser, mediaType: "audio" | "video") => {
      await agoraClient.subscribe(user, mediaType);
      if (mediaType === "video") {
        console.log("subscribe success");
        // Get `RemoteVideoTrack` in the `user` object.
        const remoteVideoTrack = user.videoTrack!;
        // Dynamically create a container in the form of a DIV element for playing the remote video track.
        remoteVideoTrack.play(document.getElementById("player-share") as HTMLElement);
      }
    });

    agoraClient.on("exception", async (e: any) => {
      console.log(e);
      toast({
        description: e.msg,
        variant: "destructive"
      });
    });

  }, [channel, token]);

  return (
    <div className={"h-screen w-screen"}>
      <Helmet>
        <title>直播分享</title>
      </Helmet>
      <div id={"player-share"} className={"h-screen w-screen"}>
      </div>
    </div>
  );
};

export default VideoShare;

