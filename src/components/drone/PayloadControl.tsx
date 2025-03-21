import {Aperture, ArrowUpDown, Camera, CloudFog, RefreshCcw, Settings, Video, Maximize2, RotateCw} from "lucide-react";
import {useSceneStore} from "@/store/useSceneStore.ts";
import {FC, useEffect, useState} from "react";
import {
  DropdownMenu,
  DropdownMenuContent, DropdownMenuItem,
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
import {PayloadCommandsEnum} from "@/hooks/drone/usePayloadControl.ts";

interface Props {
  onRefreshVideo: () => void;
  updateVideo: (value: string) => Promise<void>;
  devicePosition: string;
  setDevicePosition: (value: string) => void;
  deviceSn: string;
  dockSn: string;
  currentDeviceCamera: string;
  onChangeCamera: (value: string) => Promise<void>;
  currentMode: "ir" | "wide" | "zoom";
  onChangeMode: (mode: Props["currentMode"]) => Promise<void>;
  playerId?: string;
}

const API_PREFIX = "/control/api/v1";

const gimbalResetMode = [
  {
    name: "回中",
    value: 0
  },
  {
    name: "向下",
    value: 1
  },
  {
    name: "偏航回中",
    value: 2
  },
  {
    name: "俯仰向下",
    value: 3
  }
];

const PayloadControl: FC<Props> = ({
                                     onRefreshVideo,
                                     updateVideo,
                                     devicePosition,
                                     setDevicePosition,
                                     deviceSn,
                                     dockSn,
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


  const onCameraModeSwitch = async () => {
    await post(`${API_PREFIX}/devices/${dockSn}/payload/commands`, {
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
  console.log("realTimeDeviceInfo");
  console.log(realTimeDeviceInfo);
  const currentCameraMode = realTimeDeviceInfo?.device?.cameras?.[0]?.camera_mode;
  const recordState = realTimeDeviceInfo?.device?.cameras?.[0]?.recording_state;
  const payload_index = realTimeDeviceInfo?.device?.cameras?.[0]?.payload_index;

  console.log("currentCameraMode===");
  console.log(currentCameraMode);

  const getPayloadControl = async () => {
    await post(`${API_PREFIX}/devices/${dockSn}/authority/payload`, {
      payload_index
    });
    toast({
      description: "获取云端控制权成功！"
    });
  };

  const onTakePhoto = async () => {
    // await post(`${API_PREFIX}/devices/${osdVisible.gateway_sn}/authority/payload`, {
    //   payload_index: payloadIndex
    // });
    try {
      if (currentCameraMode !== CameraMode.Photo) {
        await post(`${API_PREFIX}/devices/${dockSn}/payload/commands`, {
          cmd: "camera_mode_switch",
          data: {
            payload_index,
            camera_mode: CameraMode.Photo
          }
        });
      }
      setTimeout(async () => {
        await post(`${API_PREFIX}/devices/${dockSn}/payload/commands`, {
          cmd: "camera_photo_take",
          data: {
            payload_index
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
    // await post(`${API_PREFIX}/devices/${osdVisible.gateway_sn}/authority/payload`, {
    //   payload_index: payloadIndex
    // });
    try {
      if (currentCameraMode !== CameraMode.Video) {
        await post(`${API_PREFIX}/devices/${dockSn}/payload/commands`, {
          cmd: "camera_mode_switch",
          data: {
            payload_index,
            camera_mode: CameraMode.Video
          }
        });
      }
      setTimeout(async () => {
        await post(`${API_PREFIX}/devices/${dockSn}/payload/commands`, {
          cmd: recordState ? "camera_recording_stop" : "camera_recording_start",
          data: {
            payload_index,
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

  const onGimbalReset = async (value: number) => {
    // PayloadCommandsEnum.GimbalReset
    try {
      await post(`${API_PREFIX}/devices/${dockSn}/payload/commands`, {
        cmd: PayloadCommandsEnum.GimbalReset,
        data: {
          payload_index,
          reset_mode: value
        }
      });
      toast({
        description: "云台重置成功"
      });
    } catch (err: any) {
      toast({
        description: err.data.message,
        variant: "destructive"
      });
    }

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
      <CloudFog className={"cursor-pointer"} size={16} onClick={getPayloadControl}/>
      <Camera className={"cursor-pointer"} onClick={onTakePhoto} size={16}/>
      <Video className={"cursor-pointer"} onClick={onRecording} size={16}/>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <RotateCw className={"cursor-pointer"} size={16}/>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-16">
          {gimbalResetMode.map(item =>
            <DropdownMenuItem onClick={() => onGimbalReset(item.value)}
                              key={item.value}>{item.name}</DropdownMenuItem>)}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default PayloadControl;

