import {Aperture, ArrowUpDown, Camera, CloudFog, RefreshCcw, Settings, Video} from "lucide-react";
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
                                     onChangeMode
                                   }) => {
  const osdVisible = useSceneStore(state => state.osdVisible);
  const payloadsOptions = osdVisible.payloads;
  const [cameraMode, setCameraMode] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  console.log("payloadsOptions");
  console.log(payloadsOptions);

  const {data: capacityData} = useCapacity();
  const {post} = useAjax();

  const onChangeClarity = async (value: string) => {
    await updateVideo(value);
    setDevicePosition(value);
  };

  const cameraList = capacityData?.find(item => item.sn === deviceSn)?.cameras_list || [];

  const onChangeCurrentCamera = async (value: string) => {
    await onChangeCamera(value);
  };

  const videoModeList = cameraList.find(item => item.index === currentDeviceCamera)?.videos_list?.[0]?.switch_video_types || [];
  console.log("videoModeList");
  console.log(videoModeList);

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

  const onTakePhoto = async () => {
    await post(`${API_PREFIX}/devices/${osdVisible.gateway_sn}/payload/commands`, {
      cmd: "camera_photo_take",
      data: {
        payload_index: currentDeviceCamera,
      }
    });
    toast({
      description: "拍照成功！"
    });
  };

  const onRecording = async () => {
    await post(`${API_PREFIX}/devices/${osdVisible.gateway_sn}/payload/commands`, {
      cmd: isRecording ? "camera_recording_stop" : "camera_recording_start",
      data: {
        payload_index: currentDeviceCamera,
      }
    });
    toast({
      description: isRecording ? "停止录像" : "开始录像"
    });
    setIsRecording(!isRecording);
  };

  return (
    <div style={{
      background: "linear-gradient( 270deg, rgba(76,175,255,0) 0%, rgba(36,144,232,0.29) 16%, rgba(58,186,255,0.45) 51%, rgba(40,141,222,0.37) 84%, rgba(67,171,255,0) 100%)"
    }} className={"h-[30px] flex content-center space-x-4 z-50"}>
      <RefreshCcw size={16} className={"cursor-pointer"} onClick={onRefreshVideo}/>
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
          <DropdownMenuLabel>镜头</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={currentDeviceCamera} onValueChange={onChangeCurrentCamera}>
            {cameraList.map(item => <DropdownMenuRadioItem key={item.index}
                                                           value={item.index}>{item.name}</DropdownMenuRadioItem>)}
          </DropdownMenuRadioGroup>
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
      <CloudFog size={16} onClick={getPayloadControl}/>
      <ArrowUpDown onClick={onCameraModeSwitch} size={16}/>
      <Camera onClick={onTakePhoto} size={16}/>
      <Video onClick={onRecording} size={16}/>
    </div>
  );
};

export default PayloadControl;

