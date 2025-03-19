import {Aperture, ArrowUpDown, Camera, CloudFog, RefreshCcw, Settings, Video, Maximize2} from "lucide-react";
import {useSceneStore} from "@/store/useSceneStore.ts";
import {FC, useState} from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup, DropdownMenuRadioItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {clarityList, VideoType, videoType, videoTypeLabel} from "@/hooks/drone/useDeviceVideo.ts";
import {useCapacity} from "@/hooks/drone";
import {useAjax} from "@/lib/http.ts";
import {toast} from "@/components/ui/use-toast.ts";
import {useFullscreen} from "@/hooks/useFullscreen";
import {CameraMode} from "@/types/live-stream.ts";
import {useRealTimeDeviceInfo} from "@/hooks/drone/device.ts";

interface Props {
  onRefreshVideo: () => void;
  updateVideo: (value: string) => Promise<void>;
  devicePosition: string;
  setDevicePosition: (value: string) => void;
  deviceSn: string;
  currentDeviceCamera: string;
  onChangeCamera: (value: string) => Promise<void>;
  currentMode: "ir" | "wide" | "zoom";
  onChangeMode: (mode: Props["currentMode"]) => Promise<void>;
  playerId?: string;
}

const API_PREFIX = "/control/api/v1";

const PayloadControl: FC<Props> = ({
                                     onRefreshVideo,
                                     updateVideo,
                                     devicePosition,
                                     setDevicePosition,
                                     deviceSn,
                                     currentDeviceCamera,
                                     onChangeCamera,
                                     currentMode,
                                     onChangeMode,
                                     playerId = "player2"
                                   }) => {
  const osdVisible = useSceneStore(state => state.osdVisible);
  const payloadsOptions = osdVisible.payloads;
  const [cameraMode, setCameraMode] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  console.log("payloadsOptions");
  console.log(payloadsOptions);
  console.log("osdVisible");
  console.log(osdVisible);
  const {data: capacityData} = useCapacity();
  const {post} = useAjax();

  const {toggleFullscreen} = useFullscreen(playerId);

  const onChangeClarity = async (value: string) => {
    await updateVideo(value);
    setDevicePosition(value);
  };

  const cameraList = capacityData?.find(item => item.sn === deviceSn)?.cameras_list || [];
  console.log("cameraList=====");
  console.log(cameraList);
  const onChangeCurrentCamera = async (value: string) => {
    await onChangeCamera(value);
  };

  const videoModeList = cameraList[1]?.videos_list?.[0]?.switch_video_types || [];

  const getPayloadControl = async () => {
    await post(`${API_PREFIX}/devices/${osdVisible.gateway_sn}/authority/payload`, {
      payload_index: currentDeviceCamera
    });
    toast({
      description: "获取云端控制权成功！"
    });
  };

  const onCameraModeSwitch = async () => {
    await post(`${API_PREFIX}/devices/${osdVisible.gateway_sn}/payload/commands`, {
      cmd: "camera_mode_switch",
      data: {
        payload_index: currentDeviceCamera,
        camera_mode: cameraMode ? 0 : 1
      }
    });
    setCameraMode(!cameraMode);
    toast({
      description: "切换相机模式成功！"
    });
  };

  const realTimeDeviceInfo = useRealTimeDeviceInfo();

  const currentCameraMode = realTimeDeviceInfo?.device?.cameras?.[0]?.camera_mode;
  const recordState = realTimeDeviceInfo?.device?.cameras?.[0]?.recording_state;

  console.log("currentCameraMode===");
  console.log(currentCameraMode);

  const onTakePhoto = async () => {
    const payloadIndex = osdVisible.payloads?.[0].payload_index;
    await post(`${API_PREFIX}/devices/${osdVisible.gateway_sn}/authority/payload`, {
      payload_index: payloadIndex
    });
    try {
      if (currentCameraMode !== CameraMode.Photo) {
        await post(`${API_PREFIX}/devices/${osdVisible.gateway_sn}/payload/commands`, {
          cmd: "camera_mode_switch",
          data: {
            payload_index: payloadIndex,
            camera_mode: CameraMode.Photo
          }
        });
      }
      setTimeout(async () => {
        await post(`${API_PREFIX}/devices/${osdVisible.gateway_sn}/payload/commands`, {
          cmd: "camera_photo_take",
          data: {
            payload_index: payloadIndex,
          }
        });
        toast({
          description: "拍照成功！"
        });
      }, 1000);
    } catch (err) {
      toast({
        description: err.data.message,
        variant: "destructive"
      });
    }
  };

  const onRecording = async () => {
    const payloadIndex = osdVisible.payloads?.[0].payload_index;
    await post(`${API_PREFIX}/devices/${osdVisible.gateway_sn}/authority/payload`, {
      payload_index: payloadIndex
    });
    try {
      if (currentCameraMode !== CameraMode.Video) {
        await post(`${API_PREFIX}/devices/${osdVisible.gateway_sn}/payload/commands`, {
          cmd: "camera_mode_switch",
          data: {
            payload_index: payloadIndex,
            camera_mode: CameraMode.Video
          }
        });
      }
      setTimeout(async () => {
        await post(`${API_PREFIX}/devices/${osdVisible.gateway_sn}/payload/commands`, {
          cmd: recordState ? "camera_recording_stop" : "camera_recording_start",
          data: {
            payload_index: payloadIndex,
          }
        });
        toast({
          description: recordState ? "停止录像" : "开始录像"
        });
      }, 1000);
    } catch (err) {
      toast({
        description: err.data.message,
        variant: "destructive"
      });
    }
    /*
        await post(`${API_PREFIX}/devices/${osdVisible.gateway_sn}/payload/commands`, {
          cmd: isRecording ? "camera_recording_stop" : "camera_recording_start",
          data: {
            payload_index: currentDeviceCamera,
          }
        });
        toast({
          description: isRecording ? "停止录像" : "开始录像"
        });
        setIsRecording(!isRecording);*/
  };

  return (
    <div style={{
      background: "linear-gradient( 270deg, rgba(76,175,255,0) 0%, rgba(36,144,232,0.29) 16%, rgba(58,186,255,0.45) 51%, rgba(40,141,222,0.37) 84%, rgba(67,171,255,0) 100%)"
    }} className={"h-[30px] flex content-center space-x-4 z-50"}>
      <RefreshCcw size={16} className={"cursor-pointer"} onClick={onRefreshVideo}/>
      <Maximize2 size={16} className={"cursor-pointer"} onClick={toggleFullscreen}/>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Settings size={16}/>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-16">
          <DropdownMenuLabel>清晰度</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={devicePosition}
            onValueChange={onChangeClarity}>
            {clarityList.map(item =>
              <DropdownMenuRadioItem key={item.value}
                                     value={item.value.toString()}>{item.label}</DropdownMenuRadioItem>)}
          </DropdownMenuRadioGroup>
          {/*<DropdownMenuLabel>镜头</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={currentDeviceCamera} onValueChange={onChangeCurrentCamera}>
            {cameraList.map(item => <DropdownMenuRadioItem key={item.index}
                                                           value={item.index}>{item.name}</DropdownMenuRadioItem>)}
          </DropdownMenuRadioGroup>*/}
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Aperture size={16}/>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-16">
          <DropdownMenuLabel>视角</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={currentMode}
            onValueChange={(value) => onChangeMode(value as Props["currentMode"])}>
            {videoModeList.map(item =>
              <DropdownMenuRadioItem key={item}
                                     value={item}>{videoTypeLabel[item]}</DropdownMenuRadioItem>)}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      {/*<CloudFog size={16} onClick={getPayloadControl}/>
      <ArrowUpDown onClick={onCameraModeSwitch} size={16}/>
      <Camera onClick={onTakePhoto} size={16}/>
      <Video onClick={onRecording} size={16}/>*/}
      <Camera className={"cursor-pointer"} onClick={onTakePhoto} size={16}/>
      <Video className={"cursor-pointer"} onClick={onRecording} size={16}/>
    </div>
  );
};

export default PayloadControl;

