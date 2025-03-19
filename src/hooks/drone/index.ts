import useSWR from "swr";
import {HTTP_PREFIX} from "@/api/manage.ts";
import {useAjax} from "@/lib/http.ts";
import {ELocalStorageKey} from "@/types/enum.ts";
import {useEffect, useState} from "react";
import {EDeviceTypeName, EModeCode, OnlineDevice} from "@/hooks/drone/device.ts";
import {useToast} from "@/components/ui/use-toast.ts";
import {OutOfControlAction, TaskStatus, TaskType} from "@/types/task.ts";
import {WaylineType} from "@/types/wayline.ts";
import {EFlightAreaType, FlightAreaContent} from "@/types/flight-area.ts";

export const useDeviceTopo = () => {
  const workspaceId = localStorage.getItem(ELocalStorageKey.WorkspaceId)!;
  const {get} = useAjax();
  const url = `${HTTP_PREFIX}/devices/${workspaceId}/devices`;
  return useSWR(url, async (path) => (await get<Resource<any[]>>(path)).data.data);
};


export const useOnlineDocks = () => {
  const {data: deviceTopo} = useDeviceTopo();
  const [onlineDocks, setOnlineDocks] = useState<OnlineDevice[]>([]);
  const departId = localStorage.getItem("departId");

  useEffect(() => {
    if (!deviceTopo) return;

    const deviceList: OnlineDevice[] = deviceTopo.filter(item => item.organ.toString() === departId).map((gateway: any) => {
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
  id: number;
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
  id: number;
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
  const key = body ? [url, body] as const : null;
  return useSWR(key, async ([path, body]) => (await get<Resource<BindingDevice>>(path, body)).data.data);
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

interface Video {
  id: string;
  index: string;
  type: string;
  switch_video_types: string[];
}

interface Camera {
  id: string;
  name: string;
  index: string;
  videos_list: Video[];
}

interface VideoDevice {
  sn: string;
  name: string;
  cameras_list: Camera[];
}

// Get Livestream Capacity
export const useCapacity = () => {
  const {get} = useAjax();
  const url = `${HTTP_PREFIX}/live/capacity`;
  return useSWR(url, async (path) => (await get<Resource<VideoDevice[]>>(path)).data.data);
};

export const MEDIA_HTTP_PREFIX = "/media/api/v1";

export interface FileItem {
  file_id: string;
  file_name: string;
  file_path: string;
  object_key: string;
  is_original: boolean;
  drone: string;
  payload: string;
  tinny_fingerprint: string;
  fingerprint: string;
  create_time: string;
  job_id: string;
}

interface FileData {
  list: FileItem[];
  pagination: Pagination;
}

// Get Media files
export const useMediaList = (workspaceId: string, body: Pagination) => {
  const {get} = useAjax();
  const url = `${MEDIA_HTTP_PREFIX}/files/${workspaceId}/files`;
  const key = body ? [url, body] as const : null;
  return useSWR(key, async ([path, body]) => (await get<Resource<FileData>>(path, {
    ...body
  })).data.data);
};

export interface UserItem {
  id: number;
  user_id: string;
  username: string;
  workspace_name: string;
  user_type: string;
  mqtt_username: string;
  mqtt_password: string;
  create_time: string;
  name: string;
  role: number;
  workspace_id: string;
  organs: number[];
}

interface MembersData {
  list: UserItem[];
  pagination: Pagination;
}

// Get all uses
export const useMembers = (workspaceId: string, body: Pagination) => {
  const {get} = useAjax();
  const url = `${HTTP_PREFIX}/users/${workspaceId}/users`;
  const key = body ? [url, body] as const : null;
  return useSWR(key, async ([path, body]) => (await get<Resource<MembersData>>(path, {
    ...body
  })).data.data);
};

interface Content {
  properties: Properties;
  geometry: Geometry;
}

interface Properties {
  color: string;
  clampToGround: boolean;
}

interface Geometry {
  type: string;
  coordinates: number[]; // 数组，包含经度和纬度
  radius: number; // 半径
}

export interface AreaItem {
  area_id: string;
  name: string;
  type: EFlightAreaType;
  content: FlightAreaContent;
  status: boolean;
  username: string;
  create_time: number; // 时间戳
  update_time: number; // 时间戳
}

export const MAP_API_PREFIX = "/map/api/v1";
// const workspaceId: string = localStorage.getItem(ELocalStorageKey.WorkspaceId) || ''
// Get all flight areas
export const useFlightAreas = (workspaceId: string) => {
  const {get} = useAjax();
  const url = `${MAP_API_PREFIX}/workspaces/${workspaceId}/flight-areas`;
  return useSWR(url, async (path) => (await get<Resource<AreaItem[]>>(path)).data.data);
};

// get all elements
interface Child {
  type: number; // Assuming type is a number based on the provided data
  content: {
    type: string; // "Feature"
    properties: {
      color: string; // Hex color code
      clampToGround: boolean; // true or false
    };
    geometry: {
      type: string; // "Polygon" or "Point"
      coordinates: Array<number[][] | number[]>; // Nested arrays for Polygon or single array for Point
    };
  };
  user_name: string; // Username associated with the resource
}

interface Element {
  id: string; // Unique identifier for the element
  name: string; // Name of the element
  resource: Child; // Resource associated with the element
  create_time: number; // Timestamp for creation
  update_time: number; // Timestamp for last update
}

interface Layer {
  id: string; // Unique identifier for the layer
  name: string; // Name of the layer
  type: number; // Type of the layer (0, 1, 2, etc.)
  elements: Element[]; // Array of elements in the layer
  is_lock: boolean; // Lock status of the layer
}

export const useElementsGroups = (workspaceId: string) => {
  const {get} = useAjax();
  const url = `${MAP_API_PREFIX}/workspaces/` + workspaceId + "/element-groups";
  return useSWR(url, async (path) => (await get<Resource<Layer[]>>(path)).data.data);
};

const MANAGE_HTTP_PREFIX = "/manage/api/v1";

export interface WorkSpace {
  id: number;
  workspace_id: string;
  workspace_name: string;
  workspace_desc: string;
  platform_name: string;
  bind_code: string;
  parent: number;
  lead_user: number;
  lead_user_name: string;
  workspace_code: string;
}

// 获取组织列表
export const useWorkspaceList = () => {
  const {get} = useAjax();
  const url = `${MANAGE_HTTP_PREFIX}/workspaces/list`;
  return useSWR(url, async (path) => (await get<Resource<WorkSpace[]>>(path)).data.data);
};

const OPERATION_HTTP_PREFIX = "/operation/api/v1";

interface CustomUser {
  id: number;
  uukey: string;
  phone: string;
  organ: number;
  name: string;
  role: number;
  password: string;
}

// 获取用户列表
export const useCustomUserList = () => {
  const {get} = useAjax();
  const url = `${OPERATION_HTTP_PREFIX}/custom-user/list`;
  return useSWR(url, async (path) => (await get<Resource<CustomUser[]>>(path)).data.data);
};

export interface Role {
  id: number;
  name: string;
  create_time: string;
}

// 获取角色列表
export const useRoleList = () => {
  const {get} = useAjax();
  const url = `${OPERATION_HTTP_PREFIX}/role/list`;
  return useSWR(url, async (path) => (await get<Resource<Role[]>>(path)).data.data);
};

export interface Depart {
  id: number;
  name: string;
  lead_user: number;
  workspace: number;
  create_time: number;
}

// 获取部门列表
export const useDepartList = () => {
  const {get} = useAjax();
  const url = `${OPERATION_HTTP_PREFIX}/organ/list`;
  return useSWR(url, async (path) => (await get<Resource<Depart[]>>(path)).data.data);
};

// 获取当前用户信息
export const useCurrentUser = () => {
  const {get} = useAjax();
  const url = `${MANAGE_HTTP_PREFIX}/users/current`;
  return useSWR(url, async (path) => (await get<Resource<UserItem>>(path)).data.data);
};

// 根据id获取部门详情
export const useDepartById = (id: number) => {
  const {get} = useAjax();
  const key = id !== 0 ? [`${OPERATION_HTTP_PREFIX}/organ/get`, id] : null;
  // return useSWR(id?[])
  return useSWR(key, async ([path, id]) => (await get<Resource<any>>(path as string, {id})).data.data);
};

export const useEditDepart = () => {
  const [departId, setDepartId] = useState(0);
  const swrResponse = useDepartById(departId);
  return {
    departId,
    setDepartId,
    ...swrResponse
  };
};

/*// Get all uses
export const useMembers = (workspaceId: string, body: Pagination) => {
  const {get} = useAjax();
  const url = `${HTTP_PREFIX}/users/${workspaceId}/users`;
  const key = body ? [url, body] as const : null;
  return useSWR(key, async ([path, body]) => (await get<Resource<MembersData>>(path, {
    ...body
  })).data.data);
};*/

type OrderStatus = 0 | 1 | 2 | 3 | 4;

export interface WorkOrder {
  id: number;
  name: string;
  workspaceId: string;
  uu_key: string;
  wayline: number;
  wayline_name: string;
  found_time: number;
  street: string;
  street_code: string;
  address: string;
  contact: string;
  contact_phone: string;
  order_type: number;
  pic_list: string[];
  longitude: number;
  latitude: number;
  description: string;
  status: OrderStatus; // Represents the order status (0-待分配, 1-已分配, etc.)
  operator: number;
  operator_name: string;
  warning_level: number;
  create_time: string; // ISO 8601 date string
  update_time: string; // ISO 8601 date string
}

// 查询工单列表
export const useWorkOrderList = (body: {
  page: number
  tab: number
  page_size: number
  status?: number
}, fix: string) => {
  const {post} = useAjax();
  const url = `${OPERATION_HTTP_PREFIX}/order/${fix}`;
  // const url = `${OPERATION_HTTP_PREFIX}/order/pageByOperator`;
  const key = fix && body ? [url, body] as const : null;
  return useSWR(key, async ([path, body]) => (await post<Resource<{
    list: WorkOrder[]
    pagination: {
      page: number;
      total: number;
      page_size: number;
    }
  }>>(path, {
    ...body
  })).data.data);
};

// 根据id查询工单详情
export const useWorkOrderById = (id?: number) => {
  const {get} = useAjax();
  const key = id ? [`${OPERATION_HTTP_PREFIX}/order/get?id=${id}`] : null;
  return useSWR(key, async ([path]) => (await get<Resource<WorkOrder>>(path)).data.data);
};

// 查看图片url
export const useGetImageUrl = (file: string) => {
  const {post} = useAjax();
  const key = file ? [`${OPERATION_HTTP_PREFIX}/file/getUrl?key=${file}`] : null;
  return useSWR(key, async ([path]) => (await post<Resource<any>>(path)).data.data);
};

interface OrderOperation {
  id: number;
  uu_key: string;
  status: number;
  order: number;
  order_uukey: string;
  result: string;
  operate_pic_list: string[];
  operator: number;
  operator_name: string;
  create_time: number;
  update_time: number;
}

// 查看工单操作记录
export const useOperationList = (orderId: number) => {
  const {post} = useAjax();
  const url = `${OPERATION_HTTP_PREFIX}/orderOperation/pageByOrder`;

  const key = orderId ? [url, orderId] as const : null;

  return useSWR(key, async ([path, orderId]) => (await post<Resource<{
    list: OrderOperation[]
    pagination: {
      page: number
      page_size: number
      total: number
    }
  }>>(path, {
    page: 1,
    page_size: 1000,
    order: orderId,
  })).data.data);
};

// 查询航线参数
export const useWaylineById = (waylineId: string) => {
  const {get} = useAjax();
  const key = waylineId ? [`/wayline/api/v1/common/get?waylineId=${waylineId}`] : null;
  return useSWR(key, async ([path]) => (await get<Resource<any>>(path)).data.data);
};
