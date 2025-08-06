import {Aperture, Camera, CloudFog, RefreshCcw, Settings, Video, Maximize2, RotateCw} from "lucide-react";
import {FC} from "react";
import {
  DropdownMenu,
  DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup, DropdownMenuRadioItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {useAjax} from "@/lib/http.ts";
import {toast} from "@/components/ui/use-toast.ts";
import {useFullscreen} from "@/hooks/useFullscreen";
import {CameraMode} from "@/types/live-stream.ts";
import {useRealTimeDeviceInfo} from "@/hooks/drone/device.ts";
import {PayloadCommandsEnum} from "@/hooks/drone/usePayloadControl.ts";
import {clarityList, videoTypeLabel} from "@/hooks/drone/useDeviceLive.ts";
import {CommonTooltip} from "@/components/drone/public/CommonTooltip.tsx";
import {IconButton} from "@/components/drone/public/IconButton.tsx";

interface Props {
  onRefreshVideo: () => Promise<void>;
  updateVideo: (value: number) => Promise<void>;
  clarity?: number;
  deviceSn: string;
  dockSn: string;
  currentMode?: "ir" | "wide" | "zoom";
  onChangeMode: (mode?: Props["currentMode"]) => Promise<void>;
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
                                     deviceSn,
                                     dockSn,
                                     onChangeMode,
                                     playerId = "player2",
                                     clarity,
                                     currentMode
                                   }) => {
  const {post} = useAjax();

  const {toggleFullscreen} = useFullscreen(playerId);

  const realTimeDeviceInfo = useRealTimeDeviceInfo(dockSn, deviceSn);

  const currentCameraMode = realTimeDeviceInfo?.device?.cameras?.[0]?.camera_mode;
  const recordState = realTimeDeviceInfo?.device?.cameras?.[0]?.recording_state;
  const payload_index = realTimeDeviceInfo?.device?.cameras?.[0]?.payload_index;

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
    } catch (err: any) {
      toast({
        description: "拍照失败！",
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
    } catch (err: any) {
      toast({
        description: recordState ? "停止录像失败！" : "开始录像失败！",
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
        description: "云台重置失败！",
        variant: "destructive"
      });
    }

  };

  return (
    <div style={{
      background: "linear-gradient( 270deg, rgba(76,175,255,0) 0%, rgba(36,144,232,0.29) 16%, rgba(58,186,255,0.45) 51%, rgba(40,141,222,0.37) 84%, rgba(67,171,255,0) 100%)"
    }} className={"h-8 flex content-center space-x-4 z-50"}>
      <CommonTooltip
        trigger={<IconButton onClick={onRefreshVideo}>
          <RefreshCcw size={16}/>
        </IconButton>}
        contentProps={{
          side: "bottom"
        }}>
        <span className={"text-sm"}>刷新</span>
      </CommonTooltip>

      <CommonTooltip
        trigger={<IconButton onClick={toggleFullscreen}>
          <Maximize2 size={16}/>
        </IconButton>}
        contentProps={{
          side: "bottom"
        }}>
        <span className={"text-sm"}>全屏</span>
      </CommonTooltip>

      <DropdownMenu>
        <DropdownMenuTrigger>
          <CommonTooltip
            trigger={<IconButton className={"h-8"}>
              <Settings size={16}/>
            </IconButton>}
            contentProps={{
              side: "bottom",
            }}>
            <span className={"text-sm"}>清晰度</span>
          </CommonTooltip>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-16">
          <DropdownMenuLabel>清晰度</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={clarity?.toString() || ""}
            onValueChange={(value) => updateVideo(+value)}>
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
          <CommonTooltip
            trigger={<IconButton className={"h-8"}>
              <Aperture size={16}/>
            </IconButton>}
            contentProps={{
              side: "bottom",
            }}>
            <span className={"text-sm"}>视角</span>
          </CommonTooltip>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-16">
          <DropdownMenuLabel>视角</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={currentMode}
            onValueChange={(value) => onChangeMode(value as Props["currentMode"])}>
            {Object.entries(videoTypeLabel).map(([key, value]) =>
              <DropdownMenuRadioItem key={key}
                                     value={key}>{value}</DropdownMenuRadioItem>)}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      {/*<CloudFog size={16} onClick={getPayloadControl}/>
      <ArrowUpDown onClick={onCameraModeSwitch} size={16}/>
      <Camera onClick={onTakePhoto} size={16}/>
      <Video onClick={onRecording} size={16}/>*/}
      <CommonTooltip
        trigger={<IconButton onClick={getPayloadControl}>
          <CloudFog size={16} onClick={getPayloadControl}/>
        </IconButton>}
        contentProps={{
          side: "bottom"
        }}>
        <span className={"text-sm"}>获取云台控制权</span>
      </CommonTooltip>

      <CommonTooltip
        trigger={<IconButton onClick={onTakePhoto}>
          <Camera onClick={onTakePhoto} size={16}/>
        </IconButton>}
        contentProps={{
          side: "bottom"
        }}>
        <span className={"text-sm"}>拍照</span>
      </CommonTooltip>

      <CommonTooltip
        trigger={<IconButton onClick={onRecording}>
          <Video className={"cursor-pointer"} onClick={onRecording} size={16}/>
        </IconButton>}
        contentProps={{
          side: "bottom"
        }}>
        <span className={"text-sm"}>录像</span>
      </CommonTooltip>

      <DropdownMenu>
        <DropdownMenuTrigger>
          <CommonTooltip
            trigger={<IconButton className={"h-8"}>
              <RotateCw className={"cursor-pointer"} size={16}/>
            </IconButton>}
            contentProps={{
              side: "bottom",
            }}>
            <span className={"text-sm"}>云台复位</span>
          </CommonTooltip>
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

