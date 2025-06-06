import {useSearchParams} from "react-router-dom";
import {useDeviceLive} from "@/hooks/drone/useDeviceLive.ts";
import {useEffect, useRef} from "react";
import JSWebrtc from "@/vendor/jswebrtc.min.js";

const VideoShareRtc2 = () => {
  const [searchParams] = useSearchParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const sn = searchParams.get("sn");

  // const {startLive} = useDeviceLive(videoRef.current, sn || "");

  // startLive();

  useEffect(() => {
    new JSWebrtc.Player("webrtc://36.152.38.220/live/test2", {
      video: videoRef.current,
      autoplay: true,
      onPlay: () => {
        console.log("start play livestream");
      }
    });
  }, []);

  return (
    <video
      className={"w-full h-full"}
      ref={videoRef}
      controls
      autoPlay
    />
  );
};

export default VideoShareRtc2;

