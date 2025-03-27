import {useState} from "react";
import {useAjax} from "@/lib/http.ts";
import {ELocalStorageKey} from "@/types/enum.ts";
import {useToast} from "@/components/ui/use-toast.ts";
import {DEVICE_MODEL_KEY} from "@/types/device.ts";

const MEDIA_API = "/media/api/v1";

const workspaceId = localStorage.getItem(ELocalStorageKey.WorkspaceId)!;

export const useDirectory = (onSuccess?: () => void) => {
  const [name, setName] = useState("新建文件夹");
  const [updateName, setUpdateName] = useState("");
  const {toast} = useToast();
  const {post, delete: deleteClient} = useAjax();

  const createDir = async (params: {
    name: string
    parent: number
  }) => {
    try {
      await post(`${MEDIA_API}/files/${workspaceId}/createDir`, params);
      toast({
        description: "创建文件夹成功"
      });
      onSuccess?.();
    } catch (err: any) {
      toast({
        description: err.data.message,
        variant: "destructive"
      });
    }
  };

  const updateFile = async (params: {
    id: number,
    name: string
  }) => {
    return await post(`${MEDIA_API}/files/${workspaceId}/updateDir`, params);
  };

  const removeFile = async (params: {
    ids: number[],
  }) => {
    return await deleteClient(`${MEDIA_API}/files/${workspaceId}/delete`, undefined, params);
  };

  const moveFile = async (params: {
    ids: number[],
    target_dir_id: number
  }) => {
    return await post(`${MEDIA_API}/files/${workspaceId}/move`, params);
  };

  return {
    name,
    setName,
    updateName,
    setUpdateName,
    createDir,
    removeFile,
    moveFile,
    updateFile
  };
};

export enum MediaFileType {
  WIDE_PHOTO = 0,
  ZOOM_PHOTO = 1,
  INFRARED_PHOTO = 2,
  PANORAMA_PHOTO = 3,
  STREAM_CUT_PHOTO = 4,
  VIDEO = 5,
  DIR = 6,
  ZIP = 7,
  MANUAL = 8
}

export const MediaFileMap = {
  [MediaFileType.WIDE_PHOTO]: "广角照片",
  [MediaFileType.ZOOM_PHOTO]: "变焦照片",
  [MediaFileType.INFRARED_PHOTO]: "红外照片",
  [MediaFileType.PANORAMA_PHOTO]: "全景照片",
  [MediaFileType.STREAM_CUT_PHOTO]: "码流照片",
  [MediaFileType.VIDEO]: "视频",
  [MediaFileType.DIR]: "文件夹",
  [MediaFileType.MANUAL]: "外部导入",
};

export const CameraType = {
  // payload
  [DEVICE_MODEL_KEY.FPV]: "FPV",
  [DEVICE_MODEL_KEY.H20]: "H20",
  [DEVICE_MODEL_KEY.H20T]: "H20T",
  [DEVICE_MODEL_KEY.H20N]: "H20N",
  [DEVICE_MODEL_KEY.EP600]: "P1",
  [DEVICE_MODEL_KEY.EP800]: "L1",
  [DEVICE_MODEL_KEY.M30Camera]: "M30 Camera",
  [DEVICE_MODEL_KEY.M30TCamera]: "M30T Camera",
  [DEVICE_MODEL_KEY.M3ECamera]: "Mavic 3E",
  [DEVICE_MODEL_KEY.M3TCamera]: "Mavic 3T",
  // [DEVICE_MODEL_KEY.M3MCamera]: 'Mavic 3M',
  [DEVICE_MODEL_KEY.XT2]: "XT2",
  [DEVICE_MODEL_KEY.XTS]: "XTS",
  [DEVICE_MODEL_KEY.Z30]: "Z30",
  [DEVICE_MODEL_KEY.DockTopCamera]: "Dock Camera",
  [DEVICE_MODEL_KEY.M3DCamera]: "M3D Camera",
  [DEVICE_MODEL_KEY.M3TDCamera]: "M3TD Camera",
};

export function copyToClipboard(textToCopy: string) {
  // navigator clipboard 需要https等安全上下文
  if (navigator.clipboard && window.isSecureContext) {
    // navigator clipboard 向剪贴板写文本
    return navigator.clipboard.writeText(textToCopy);
  } else {
    // 创建text area
    const textArea = document.createElement("textarea");
    textArea.value = textToCopy;
    // 使text area不在viewport，同时设置不可见
    textArea.style.position = "absolute";
    textArea.style.opacity = "0";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    return new Promise((res, rej) => {
      // 执行复制命令并移除文本框
      document.execCommand("copy") ? res() : rej();
      textArea.remove();
    });
  }
}
