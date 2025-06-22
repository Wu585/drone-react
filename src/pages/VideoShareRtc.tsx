import {useSearchParams} from "react-router-dom";
import {useDeviceLive} from "@/hooks/drone/useDeviceLive.ts";
import {useEffect, useRef} from "react";

const VideoShareRtc = () => {
  const [searchParams] = useSearchParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const dockSn = searchParams.get("dockSn");
  const droneSn = searchParams.get("droneSn");
  const {startLive: startDockLive} = useDeviceLive(videoRef.current, dockSn || "");
  const {startLive: startDroneLive} = useDeviceLive(videoRef.current, dockSn || "", droneSn || "");

  console.log(dockSn);
  console.log(droneSn);


  if (dockSn && droneSn) {
    startDroneLive(false);
  }

  if (dockSn && !droneSn) {
    startDockLive();
  }

  return (
    <div className="w-screen h-screen border-2">
      <video
        className={"aspect-video object-fill h-full w-full"}
        ref={videoRef}
        controls
        autoPlay
      />
    </div>
  );
};

export default VideoShareRtc;

/*
import {useSearchParams} from "react-router-dom";
import {useDeviceLive} from "@/hooks/drone/useDeviceLive.ts";
import {useEffect, useRef} from "react";
import JSWebrtc from "@/vendor/jswebrtc.min.js";

const VideoShareRtc = () => {
  const [searchParams] = useSearchParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const sn = searchParams.get("sn");

  // const {startLive} = useDeviceLive(videoRef.current, sn || "");

  // startLive();

  useEffect(() => {
    new JSWebrtc.Player("webrtc://36.139.117.52/live/test2", {
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

export default VideoShareRtc;
*/

