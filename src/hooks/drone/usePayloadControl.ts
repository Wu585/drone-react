import {ControlSource} from "@/types/device.ts";
import {useToast} from "@/components/ui/use-toast.ts";
import {useAjax} from "@/lib/http.ts";
import {CameraMode, CameraType} from "@/types/live-stream.ts";
import {GimbalResetMode} from "@/types/drone-control.ts";

const API_PREFIX = "/control/api/v1";

export enum PayloadCommandsEnum {
  CameraModeSwitch = "camera_mode_switch",
  CameraPhotoTake = "camera_photo_take",
  CameraRecordingStart = "camera_recording_start",
  CameraRecordingStop = "camera_recording_stop",
  CameraFocalLengthSet = "camera_focal_length_set",
  GimbalReset = "gimbal_reset",
  CameraAim = "camera_aim"
}

export interface PostCameraModeBody {
  payload_index: string;
  camera_mode: CameraMode;
}

export interface PostCameraPhotoBody {
  payload_index: string;
}

export interface PostCameraRecordingBody {
  payload_index: string;
}

export interface DeleteCameraRecordingParams {
  payload_index: string;
}

export interface PostCameraFocalLengthBody {
  payload_index: string,
  camera_type: CameraType,
  zoom_factor: number
}

export interface PostGimbalResetBody {
  payload_index: string,
  reset_mode: GimbalResetMode,
}

export interface PostCameraAimBody {
  payload_index: string,
  camera_type: CameraType,
  locked: boolean,
  x: number,
  y: number,
}

export type PostPayloadCommandsBody = {
  cmd: PayloadCommandsEnum.CameraModeSwitch,
  data: PostCameraModeBody
} | {
  cmd: PayloadCommandsEnum.CameraPhotoTake,
  data: PostCameraPhotoBody
} | {
  cmd: PayloadCommandsEnum.CameraRecordingStart,
  data: PostCameraRecordingBody
} | {
  cmd: PayloadCommandsEnum.CameraRecordingStop,
  data: DeleteCameraRecordingParams
} | {
  cmd: PayloadCommandsEnum.CameraFocalLengthSet,
  data: PostCameraFocalLengthBody
} | {
  cmd: PayloadCommandsEnum.GimbalReset,
  data: PostGimbalResetBody
} | {
  cmd: PayloadCommandsEnum.CameraAim,
  data: PostCameraAimBody
}

export const usePayloadControl = () => {
  const {toast} = useToast();
  const {post} = useAjax();

  const postPayloadCommands = async (sn: string, body: PostPayloadCommandsBody) => {
    return await post(`${API_PREFIX}/devices/${sn}/payload/commands`, body as any);
  };

  const checkPayloadAuth = (controlSource?: ControlSource) => {
    if (controlSource !== ControlSource.A) {
      toast({
        description: "请先获取负载控制权！",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const authPayload = async (sn: string, payloadIndx: string) => {
    const result: any = await post(`${API_PREFIX}/devices/${sn}/authority/payload`, {
      payload_index: payloadIndx
    });
    if (result.data.code === 0) {
      toast({
        description: "成功获取负载控制权！"
      });
      return true;
    }
    return false;
  };

  const resetGimbal = async (sn: string, data: PostGimbalResetBody) => {
    const result: any = await postPayloadCommands(sn, {
      cmd: PayloadCommandsEnum.GimbalReset,
      data: data
    });
    if (result.data.code === 0) {
      toast({
        description: "Gimbal重置成功！"
      });
    }
  };

  const switchCameraMode = async (sn: string, data: PostCameraModeBody) => {
    const result: any = await postPayloadCommands(sn, {
      cmd: PayloadCommandsEnum.CameraModeSwitch,
      data: data
    });
    if (result.data.code === 0) {
      toast({
        description: "相机模式切换成功！"
      });
    }
  };

  const takeCameraPhoto = async (sn: string, payloadIndx: string) => {
    const result: any = await postPayloadCommands(sn, {
      cmd: PayloadCommandsEnum.CameraPhotoTake,
      data: {
        payload_index: payloadIndx
      }
    });
    if (result.data.code === 0) {
      toast({
        description: "拍照成功！"
      });
    }
  };

  const startCameraRecording = async (sn: string, payloadIndx: string) => {
    const result: any = await postPayloadCommands(sn, {
      cmd: PayloadCommandsEnum.CameraRecordingStart,
      data: {
        payload_index: payloadIndx
      }
    });
    if (result.data.code === 0) {
      toast({
        description: "开始录像！"
      });
    }
  };

  const stopCameraRecording = async (sn: string, payloadIndx: string) => {
    const result: any = await postPayloadCommands(sn, {
      cmd: PayloadCommandsEnum.CameraRecordingStop,
      data: {
        payload_index: payloadIndx
      }
    });
    if (result.data.code === 0) {
      toast({
        description: "停止录像！"
      });
    }
  };

  const changeCameraFocalLength = async (sn: string, data: PostCameraFocalLengthBody) => {
    const result: any = await postPayloadCommands(sn, {
      cmd: PayloadCommandsEnum.CameraFocalLengthSet,
      data: data
    });
    if (result.data.code === 0) {
      toast({
        description: "变焦成功！"
      });
    }
  };

  const cameraAim = async (sn: string, data: PostCameraAimBody) => {
    const result: any = await postPayloadCommands(sn, {
      cmd: PayloadCommandsEnum.CameraAim,
      data: data
    });
    if (result.data.code === 0) {
      toast({
        description: "相机瞄准成功！"
      });
    }
  };

  return {
    checkPayloadAuth,
    authPayload,
    resetGimbal,
    switchCameraMode,
    takeCameraPhoto,
    startCameraRecording,
    stopCameraRecording,
    changeCameraFocalLength,
    cameraAim,
  };
};
