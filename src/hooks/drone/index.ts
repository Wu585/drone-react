import useSWR from "swr";
import {HTTP_PREFIX} from "@/api/manage.ts";
import {useAjax} from "@/lib/http.ts";
import {ELocalStorageKey} from "@/types/enum.ts";
import {useEffect, useState} from "react";
import {EDeviceTypeName, EModeCode, OnlineDevice} from "@/hooks/drone/device.ts";
import {useToast} from "@/components/ui/use-toast.ts";
import {OutOfControlAction, TaskStatus, TaskType} from "@/types/task.ts";
import {WaylineType} from "@/types/wayline.ts";

export const useDeviceTopo = (workspace_id: string) => {
  const {get} = useAjax();
  const url = `${HTTP_PREFIX}/devices/${workspace_id}/devices`;
  return useSWR(url, async (path) => (await get<Resource<any[]>>(path)).data.data);
};

export const useOnlineDocks = () => {
  const workspaceId = localStorage.getItem(ELocalStorageKey.WorkspaceId)!;
  const {data: deviceTopo} = useDeviceTopo(workspaceId);
  const [onlineDocks, setOnlineDocks] = useState<OnlineDevice[]>([]);

  useEffect(() => {
    if (!deviceTopo) return;

    const deviceList: OnlineDevice[] = deviceTopo.map((gateway: any) => {
      const child = gateway.children;
      return {
        model: child?.device_name,
        callsign: child?.nickname,
        sn: child?.device_sn,
        mode: EModeCode.Disconnected,
        gateway: {
          model: gateway?.device_name,
          callsign: gateway?.nickname,
          sn: gateway?.device_sn,
          domain: gateway?.domain
        },
        payload: child?.payloads_list.map((payload: any) => ({
          index: payload.index,
          model: payload.model,
          payload_name: payload.payload_name,
          payload_sn: payload.payload_sn,
          control_source: payload.control_source,
          payload_index: payload.payload_index
        }))
      };
    }).filter((gateway: any) => gateway.gateway.domain === EDeviceTypeName.Dock);

    setOnlineDocks(deviceList);
  }, [deviceTopo]);

  return {onlineDocks};
};

export interface Pagination {
  page: number;
  total: number;
  page_size: number;
}

export interface WaylineItem {
  name: string;
  id: string;
  sign: string;
  favorited: boolean;
  drone_model_key: string;
  payload_model_keys: string[];
  template_types: number[];
  object_key: string;
  user_name: string;
  update_time: number;
  create_time: number;
}

interface Wayline {
  list: WaylineItem[];
  pagination: Pagination;
}

export const HTTP_PREFIX_Wayline = "/wayline/api/v1";

// 获取航线列表
export const useWaylines = (workspace_id: string, body: {
  order_by: string
  page: number
  page_size: number
}) => {
  const {get} = useAjax();
  const url = `${HTTP_PREFIX_Wayline}/workspaces/${workspace_id}/waylines`;
  return useSWR(url, async (path) => (await get<Resource<Wayline>>(path, body)).data.data);
};

export interface Device {
  device_sn: string;
  device_name: string;
  workspace_id: string;
  control_source: string;
  device_desc: string;
  child_device_sn: string;
  domain: number;
  type: number;
  sub_type: number;
  icon_url: {
    normal_icon_url: string;
    selected_icon_url: string;
  };
  status: boolean;
  bound_status: boolean;
  login_time: string;
  bound_time: string;
  nickname: string;
  firmware_version: string;
  workspace_name: string;
  children: ChildDevice;
  firmware_status: number;
  thing_version: string;
}

interface ChildDevice {
  device_sn: string;
  device_name: string;
  workspace_id: string;
  control_source: string;
  device_desc: string;
  child_device_sn: string;
  domain: number;
  type: number;
  sub_type: number;
  icon_url: {
    normal_icon_url: string;
    selected_icon_url: string;
  };
  status: boolean;
  bound_status: boolean;
  login_time: string;
  nickname: string;
  firmware_version: string;
  workspace_name: string;
  firmware_status: number;
  thing_version: string;
}

interface BindingDevice {
  list: Device[];
  pagination: Pagination;
}

// 获取绑定设备列表
export const useBindingDevice = (workspace_id: string, body: Pagination & {
  domain: number
}) => {
  const {get} = useAjax();
  const url = `${HTTP_PREFIX}/devices/${workspace_id}/devices/bound`;
  return useSWR(url, async (path) => (await get<Resource<BindingDevice>>(path, {
    ...body
  })).data.data);
};


/**
 * 下载文件
 * @param data
 * @param fileName
 */
export function downloadFile(data: Blob, fileName: string) {
  const lable = document.createElement("a");
  lable.href = window.URL.createObjectURL(data);
  lable.download = fileName;
  lable.click();
  URL.revokeObjectURL(lable.href);
}

export const useDownloadWayline = (workspaceId: string) => {
  const {get} = useAjax();
  const {toast} = useToast();
  const downloadWayline = async (waylineId: string, fileName: string) => {
    const url = `${HTTP_PREFIX_Wayline}/workspaces/${workspaceId}/waylines/${waylineId}/url`;
    const result: any = await get(url, {}, {responseType: "blob"});
    if ((result.data as any).type === "application/json") {
      const reader = new FileReader();
      reader.onload = function () {
        const text = reader.result as string;
        const result = JSON.parse(text);
        toast({
          description: result.message,
          variant: "destructive"
        });
      };
      reader.readAsText(result.data as any, "utf-8");
    } else {
      const data = new Blob([result.data], {type: "application/zip"});
      downloadFile(data, fileName + ".kmz");
    }
  };
  return {downloadWayline};
};

export const useDeleteWalineFile = (workspaceId: string) => {
  const {delete: deleteClient} = useAjax();
  const {toast} = useToast();
  const deleteWaylineFile = async (waylineId: string) => {
    const url = `${HTTP_PREFIX_Wayline}/workspaces/${workspaceId}/waylines/${waylineId}`;
    await deleteClient(url);
    toast({
      description: "删除航线成功"
    });
  };
  return {deleteWaylineFile};
};

export interface CreatePlan {
  name: string,
  file_id: string,
  dock_sn: string,
  task_type: TaskType, // 任务类型
  wayline_type: WaylineType, // 航线类型
  task_days: number[] // 执行任务的日期（秒）
  task_periods: number[][] // 执行任务的时间点（秒）
  rth_altitude: number // 相对机场返航高度 20 - 500
  out_of_control_action: OutOfControlAction // 失控动作
  min_battery_capacity?: number, // The minimum battery capacity of aircraft.
  min_storage_capacity?: number, // The minimum storage capacity of dock and aircraft.
  select_execute_date: string[]
  select_time: string[][]
}

export interface Task {
  job_id: string,
  job_name: string,
  task_type: TaskType, // 任务类型
  file_id: string, // 航线文件id
  file_name: string, // 航线名称
  wayline_type: WaylineType, // 航线类型
  dock_sn: string,
  dock_name: string,
  workspace_id: string,
  username: string,
  begin_time: string,
  end_time: string,
  execute_time: string,
  completed_time: string,
  status: TaskStatus, // 任务状态
  progress: number, // 执行进度
  code: number, // 错误码
  rth_altitude: number // 相对机场返航高度 20 - 500
  out_of_control_action: OutOfControlAction // 失控动作
  media_count: number // 媒体数量
  uploading: boolean // 是否正在上传媒体
  uploaded_count: number // 已上传媒体数量
}

export const useWaylinJobs = (workspaceId: string, body: Pagination) => {
  const {get} = useAjax();
  const url = `${HTTP_PREFIX_Wayline}/workspaces/${workspaceId}/jobs`;
  const key = body ? [url, body] as const : null;
  return useSWR(key, async ([path, body]) => (await get<Resource<{
    list: Task[]
    pagination: Pagination
  }>>(path, {
    ...body
  })).data.data);
};
