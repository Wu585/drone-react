import VideoPlayer from "@/components/public/VideoPlayer.tsx";
import {FC} from "react";

interface Props {
  videoSrc: string;
}

const RealtimeMonitor:FC<Props> = ({videoSrc}) => {
  // const videoSrc = "https://open.ys7.com/v3/openlive/FE4724701_1_1.m3u8?expire=1757060003&id=753649335266807808&t=3d92e7198735ffbfc00d78af5b072535a92f252328f7f7703738ec8172fc6627&ev=100"

  return (
    <div className={"flex"}>
        <div className={"w-full h-[350px] flex justify-center items-center"}>
          {/*<img src={cameraTestPng} alt=""/>*/}
          <VideoPlayer src={videoSrc}/>
        </div>
        {/*<div className={"bg-rwsjzs-bg flex bg-100% justify-between pb-[8px]"}>
          <span className={"text-[#33DAFC]"}>奉浦酒店后厨2号摄像头</span>
          <div className={"flex items-center space-x-2"}>
            <span className={"w-[6px] h-[6px] bg-[#00FF79] rounded-full"}></span>
            <span className={"text-[#00FF79]"}>在线</span>
          </div>
        </div>*/}
    </div>
  );
};

export default RealtimeMonitor;

