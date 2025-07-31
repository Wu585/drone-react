import useSWR from "swr";
import {HTTP_PREFIX} from "@/api/manage.ts";
import {useAjax} from "@/lib/http.ts";
import {ELocalStorageKey} from "@/types/enum.ts";
import {useEffect, useState} from "react";
import {EDeviceTypeName, EModeCode, OnlineDevice} from "@/hooks/drone/device.ts";
import {useToast} from "@/components/ui/use-toast.ts";
import {OutOfControlAction, TaskStatus, TaskType} from "@/types/task.ts";
import {WaylineType} from "@/types/wayline.ts";
import {EFlightAreaType, FlightAreaContent, GetDeviceStatus} from "@/types/flight-area.ts";
import {MediaFileType} from "@/hooks/drone/media";
import useSWRImmutable from "swr/immutable";

export const useDeviceTopo = () => {
  const workspaceId = localStorage.getItem(ELocalStorageKey.WorkspaceId)!;
  const departId = localStorage.getItem("departId");
  const {get} = useAjax();
  const url = `${HTTP_PREFIX}/devices/${workspaceId}/devices?organ=${departId}`;
  return useSWR(url, async (path) => (await get<Resource<any[]>>(path)).data.data);
};

export const useOnlineDocks = () => {
  const {data: deviceTopo} = useDeviceTopo();
  const [onlineDocks, setOnlineDocks] = useState<OnlineDevice[]>([]);
  const departId = localStorage.getItem("departId");

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
  }, [deviceTopo, departId]);

  return {onlineDocks};
};

export interface Pagination {
  page: number;
  page_size: number;
  begin_time?: string;
  end_time?: string;
  types?: number[];
  payloads?: string[];
  labels?: number[];
  name?: string;
  parent?: number;
  total?: number;
  status?: 0 | 1 | 2 | TaskStatus;
  start_time?: string;
  type?: number;
  dock_sn?: string;
  keyword?: string;
  job_id?: string | null;
  reqWorkSpaceId?: string;
  role?: number;
  organs?: number[];
  task_type?: number;
  workspace_id?: string;
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
  page_size: number,
  organ?: number
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
  insurance: string;
  insurance_file_key: string;
  insurance_begin_time: number;
  insurance_end_time: number;
  maintenanceRecords: {
    device_sn: string
    maintenance_type: number
    maintenance_time: number
    flight_count: number
    maintenance_desc: string
  }[];
}

export interface ChildDevice {
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
  bound_time: string;
}

interface BindingDevice {
  list: Device[];
  pagination: Pagination;
}

// 获取绑定设备列表 不论组织 还是按部门查询的
export const useBindingDevice = (workspace_id: string, body: Pagination & {
  domain: number,
  organ?: number
}) => {
  const {get} = useAjax();
  const url = `${HTTP_PREFIX}/devices/${workspace_id}/devices/bound`;
  const key = body ? [url, body] as const : null;
  return useSWR(key, async ([path, body]) => (await get<Resource<BindingDevice>>(path, body)).data.data);
};

interface DeviceStatus {
  device_name: string;
  device_sn: string;
  flight_area_status: {
    sync_code: number
    sync_msg: string
    sync_status: string
  };
  nickname: string;
  online: boolean;
}

// 获取设备飞行区的状态
export const useDeviceStatus = (workspace_id: string) => {
  const {get} = useAjax();
  const url = `${MAP_API_PREFIX}/workspaces/${workspace_id}/device-status`;
  const key = workspace_id ? [url, workspace_id] as const : null;
  return useSWR(key, async ([path]) => (await get<Resource<GetDeviceStatus[]>>(path)).data.data);
};

// 获取文件地址
export const useFileUrl = (fileId: string) => {
  const {post} = useAjax();
  const key = fileId ? [`${OPERATION_HTTP_PREFIX}/file/getUrl?key=${fileId}`] : false;
  return useSWR(key, async ([path]) => (await post<Resource<string>>(path)).data.data);
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
  id?: number
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
  organ: number | string
}

export interface Task {
  id: number,
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
  contact: string,
  contactPhone: string
  organ_name: string
}

export const useWaylinJobs = (workspaceId: string, body: Pagination) => {
  const {post} = useAjax();
  const url = `${HTTP_PREFIX_Wayline}/workspaces/${workspaceId}/jobs`;
  const key = body ? [url, body] as const : null;
  return useSWR(key, async ([path, body]) => (await post<Resource<{
    list: Task[]
    pagination: Pagination
  }>>(path, {
    ...body
  })).data.data);
};

export const useApplyWaylinJobs = (body: Pagination) => {
  const {post} = useAjax();
  const url = `${HTTP_PREFIX_Wayline}/wayline-job-audit/page`;
  const key = body ? [url, body] as const : null;
  return useSWR(key, async ([path, body]) => (await post<Resource<{
    list: ApplyTask[]
    pagination: Pagination
  }>>(path, {
    ...body
  })).data.data);
};

export enum ApplyTaskStatus {
  PENDING_REVIEW,
  APPROVED,
  REJECTED
}

export const applyTaskStatusMap = {
  [ApplyTaskStatus.PENDING_REVIEW]: {
    name: "待审核",
    color: "text-yellow-500"
  },
  [ApplyTaskStatus.APPROVED]: {
    name: "已通过",
    color: "text-green-500"
  },
  [ApplyTaskStatus.REJECTED]: {
    name: "已驳回",
    color: "text-red-500"
  },
};

export interface ApplyTask {
  id: number;
  name: string;
  file_id: string;
  wayline_name: string;
  dock_sn: string;
  dock_name: string;
  workspace_id: string;
  wayline_type: WaylineType;
  task_type: TaskType;
  status: ApplyTaskStatus;
  username: string;
  rth_altitude: number;
  out_of_control_action: number;
  type: number;
  contact: string;
  contact_phone: string;
  min_battery_capacity: number;
  min_storage_capacity: number;
  task_days: number[];
  task_periods: [number, number][];
  create_time: number;
  organ_name: string;
}


export const useApplyWaylinJobById = (id: number | string | null) => {
  const {get} = useAjax();
  const key = id ? [`${HTTP_PREFIX_Wayline}/wayline-job-audit/${id}`] : null;
  return useSWR(key, async ([path]) => (await get<Resource<ApplyTask>>(path)).data.data);
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
  id: number;
  parent: number;
  size: string;
  type: MediaFileType;
  preview_url: string;
  longitude: string;
  latitude: string;
  thumbnail_url?: string;
  wayline_name?: string;
}

interface FileData {
  list: FileItem[];
  pagination: Pagination;
}

// Get Media files
export const useMediaList = (workspaceId: string, body?: Pagination) => {
  const {post} = useAjax();
  // const url = `${MEDIA_HTTP_PREFIX}/files/${workspaceId}/files`;
  const url = `${MEDIA_HTTP_PREFIX}/files/${workspaceId}/page`;
  const key = body ? [url, body] as const : null;
  return useSWR(key, async ([path, body]) => (await post<Resource<FileData>>(path, body)).data.data);
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
  workspace_id_primary_key: number;
  organs: number[];
  phone?: string;
  resources: {
    create_time: string;
    id: number
    name: string
    parent: number
    type: number
    uu_key: string
    url: string
  }[];
}

interface MembersData {
  list: UserItem[];
  pagination: Pagination;
}

// Get all uses
export const useMembers = (body: Pagination) => {
  const {get} = useAjax();
  const url = `${HTTP_PREFIX}/users/users`;
  const key = body ? [url, body] as const : null;
  return useSWR(key, async ([path, body]) => (await get<Resource<MembersData>>(path, {
    ...body
  })).data.data);
};

// Get all uses
export const useMembersPage = (body: Pagination) => {
  const {post} = useAjax();
  const url = `${HTTP_PREFIX}/users/page`;
  const key = body ? [url, body] as const : null;
  return useSWR(key, async ([path, body]) => (await post<Resource<MembersData>>(path, body)).data.data);
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
  logo?: string;
}

// 获取组织列表
export const useWorkspaceList = () => {
  const {get} = useAjax();
  const url = `${MANAGE_HTTP_PREFIX}/workspaces/list`;
  return useSWR(url, async (path) => (await get<Resource<WorkSpace[]>>(path)).data.data);
};

// 获取组织列表
export const useWorkspaceAllList = () => {
  const {get} = useAjax();
  const url = `${MANAGE_HTTP_PREFIX}/workspaces/queryAll`;
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
  menu_ids: number[];
  resource_ids: number[];
}

// 获取角色列表
export const useRoleList = () => {
  const {get} = useAjax();
  const url = `${OPERATION_HTTP_PREFIX}/role/list`;
  return useSWR(url, async (path) => (await get<Resource<Role[]>>(path)).data.data);
};

export interface RoleResource {
  id: number;
  url: string;
  createTime: string;
  updateTime: string;
  uuKey: string;
  parent: number;
  name: string;
  type: number;
  children?: RoleResource[];
}

// 获取资源列表
export const useResourceList = () => {
  const {get} = useAjax();
  const url = `${OPERATION_HTTP_PREFIX}/resource/list`;
  return useSWR(url, async (path) => (await get<Resource<RoleResource[]>>(path)).data.data);
};

export function buildTree(data?: RoleResource[]): RoleResource[] {
  if (!data) return [];
  const map: { [key: number]: RoleResource } = {};
  const roots: RoleResource[] = [];

  // Step 1: Create a map of all items
  for (const item of data) {
    map[item.id] = {...item, children: []};
  }

  // Step 2: Build the tree structure
  for (const item of data) {
    if (item.parent === 0) {
      roots.push(map[item.id]);
    } else {
      const parent = map[item.parent];
      if (parent) {
        parent.children?.push(map[item.id]);
      }
    }
  }

  return roots;
}

export interface Depart {
  id: number;
  name: string;
  lead_user: number;
  workspace: number;
  create_time: number;
  active: 0 | 1;
  lead_user_name: string;
  sort: number;
  parent: number;
  workspace_name: string;
  workspace_id: string;
  user_ids: number[];
}

export const useCurrentDepartList = () => {
  const workspaceId = localStorage.getItem(ELocalStorageKey.WorkspacePrimaryKey);
  return useDepartList(workspaceId ? +workspaceId : undefined);
};

// 获取部门列表
export const useDepartList = (id?: number) => {
  const {get} = useAjax();
  const url = `${OPERATION_HTTP_PREFIX}/organ/list`;
  const key = id ? [url, id] as const : undefined;
  return useSWR(key, async ([path, id]) => (await get<Resource<Depart[]>>(path, {id})).data.data);
};

export const useUserListByDepartId = (departId?: number) => {
  const workspaceId = localStorage.getItem(ELocalStorageKey.SelectedWorkspaceId) || localStorage.getItem(ELocalStorageKey.WorkspaceId)!;
  const {data: _userList} = useMembersPage({
    page: 1,
    page_size: 1000,
    workspace_id: workspaceId || ""
  });
  if (!departId) return [];
  return _userList?.list.filter(user => user.organs.includes(departId));
};

// 获取当前用户信息
export const useCurrentUser = () => {
  const {get} = useAjax();
  const url = `${MANAGE_HTTP_PREFIX}/users/current`;
  return useSWR(url, async (path) => (await get<Resource<UserItem>>(path)).data.data);
};

// 判断是否是组织管理员
export const useWorkspaceManager = () => {
  const {data: user} = useCurrentUser();
  const {data: workSpaceList} = useWorkspaceList();

  const currentWorkSpaceId = localStorage.getItem(ELocalStorageKey.SelectedWorkspaceId)!;
  if (!currentWorkSpaceId) return false;

  return workSpaceList?.find(item => item.workspace_id === currentWorkSpaceId)?.parent === user?.workspace_id_primary_key;
};

export const useDepartPermission = (departId: number, workSpaceId: string) => {
  const {data: user} = useCurrentUser();
  const {data: departData} = useDepartById(departId);
  if (!user || !departData) {
    return false; // 如果用户或部门数据不存在，直接返回 false
  }

  // 该部门是当前组织节点下，非子组织下的部门
  const isInCurrentWorkspace = workSpaceId === departData.workspace_id;

  // 如果不在当前工作区，返回 true；否则检查用户是否在部门用户列表中
  return !isInCurrentWorkspace || departData.users.includes(user.id);
};

export interface User {
  id: number;
  username: string;
  name: string;
  role: number;
  user_id: string;
  user_type: number;
  mqtt_username: string;
  mqtt_password: string;
  mqtt_addr: string;
}

interface Data {
  id: number;
  name: string;
  parent: number;
  sort: number;
  lead_user: number;
  active: number;
  create_time: number;
  update_time: number;
  workspace: number;
  users: number[] | User[];
  devices: Device[];
  workspace_id: string;
  longitude: string | null;
  latitude: string | null;
}

// 根据id获取部门详情
export const useDepartById = (id: number) => {
  const {get} = useAjax();
  const key = id !== 0 ? [`${OPERATION_HTTP_PREFIX}/organ/get`, id] : null;
  // return useSWR(id?[])
  return useSWR(key, async ([path, id]) => (await get<Resource<Data>>(path as string, {id})).data.data);
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
  found_time: string;
  street: string;
  street_code: string;
  address: string;
  contact: string;
  contact_phone: string;
  order_type: number;
  pic_list: string[];
  pic_list_origin: string[];
  longitude: number;
  latitude: number;
  description: string;
  status: OrderStatus; // Represents the order status (0-待分配, 1-已分配, etc.)
  operator: number;
  operator_name: string;
  warning_level: number;
  create_time: string; // ISO 8601 date string
  update_time: string; // ISO 8601 date string
  visual?: boolean;
}

export const eventMap = {
  0: "公共设施",
  1: "道路交通",
  2: "环卫环保",
  3: "园林绿化",
  4: "其它设施",
  5: "环卫市容",
  6: "设施管理",
  7: "突发事件",
  8: "街面秩序",
  9: "市场监管",
  10: "房屋管理",
  11: "农村管理",
  12: "街面治安",
  13: "重点保障",
  14: "其他事件",
} as const;

// 查询工单列表
export const useWorkOrderList = (body: {
  page: number
  tab: number
  page_size: number
  status?: number
  job?: number
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
  })).data.data, body.job ? {
    refreshInterval: 10 * 1000
  } : {});
};

// 根据id查询工单详情
export const useWorkOrderById = (id?: number) => {
  const {get} = useAjax();
  const key = id ? [`${OPERATION_HTTP_PREFIX}/order/get?id=${id}`] : null;
  return useSWR(key, async ([path]) => (await get<Resource<WorkOrder>>(path)).data.data);
};

export const useWorkOrderByRealTimeId = (id?: number) => {
  const {get} = useAjax();
  const key = id ? [`${OPERATION_HTTP_PREFIX}/order/get?id=${id}`] : null;
  return useSWRImmutable(key, async ([path]) => (await get<Resource<WorkOrder>>(path)).data.data);
};

// 查看图片url
export const useGetImageUrl = (fileKey?: string) => {
  const {post} = useAjax();
  const key = fileKey ? [`${OPERATION_HTTP_PREFIX}/file/getUrl?key=${fileKey}`] : null;
  return useSWR(key, async ([path]) => (await post<Resource<any>>(path)).data.data);
};

export interface OrderOperation {
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
  reason: string;
}

// 查看工单操作记录
export const useOperationList = (orderId?: number) => {
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

// 添加 ImageFormat 类型定义
export type ImageFormat = "wide" | "zoom" | "ir" | "visable";

// 修改 WaylineData 接口，添加 image_format 字段类型
export interface WaylineData {
  id: string;
  name: string;
  fly_to_wayline_mode: "safely" | "pointToPoint";
  take_off_security_height: number;
  global_transitional_speed: number;
  template_type: "waypoint";
  drone_type: number;
  sub_drone_type: number;
  payload_type: number;
  payload_position: number;
  image_format: string;  // 或者 string 如果后端返回的是逗号分隔的字符串
  finish_action: "goHome" | "noAction" | "autoLand" | "gotoFirstWaypoint";
  exit_on_rc_lost_action: "goHome" | "noAction" | "autoLand" | "gotoFirstWaypoint";
  global_height: number;
  auto_flight_speed: number;
  waypoint_heading_req: WaypointHeadingReq;
  waypoint_turn_req: WaypointTurnReq;
  gimbal_pitch_mode: "manual" | "usePointSetting";
  take_off_ref_point: string;
  route_point_list: RoutePoint[];
}

interface WaypointHeadingReq {
  waypoint_heading_mode: "followWayline" | "manually" | "fixed";
}

interface WaypointTurnReq {
  waypoint_turn_mode: "coordinateTurn" | "toPointAndStopWithDiscontinuityCurvature" |
    "toPointAndStopWithContinuityCurvature" | "toPointAndPassWithContinuityCurvature";
}

interface RoutePoint {
  route_point_index: number;
  longitude: number;
  latitude: number;
  height?: number;
  speed?: number;
  waypoint_heading_req: object; // Assuming this can be an empty object
  waypoint_turn_req: object; // Assuming this can be an empty object
  actions: Action[];
  action_trigger_req: ActionTriggerReq;
  ellipsoid_height?: number;
}

interface Action {
  action_index: number;
  action_actuator_func: string;
  use_global_image_format?: number; // Optional, as it may not be present in all actions
}

interface ActionTriggerReq {
  action_trigger_type: string;
}

// 查询航线参数
export const useWaylineById = (waylineId?: string) => {
  const {get} = useAjax();
  const key = waylineId ? [`/wayline/api/v1/common/get?waylineId=${waylineId}`] : null;
  return useSWR(key, async ([path]) => (await get<Resource<WaylineData>>(path)).data.data);
};

export const usePermission = () => {
  const {data: currentUser} = useCurrentUser();
  const permissions = currentUser?.resources.map(item => item.uu_key) || [];

  const hasPermission = (permissionKey: string) => {
    return permissions.includes(permissionKey);
  };

  return {hasPermission};
};

interface Maintenance {
  device_sn: string;
  maintenance_type: number;
  maintenance_time: number;
  flight_count: number;
  maintenance_desc: string;
}

interface MaintenanceListData {
  list: Maintenance[];
  pagination: Pagination;
}

// 查询保养记录
export const useMaintainanceList = (body: {
  workspace_id: string,
  device_sn: string,
  page: number,
  page_size: number
}) => {
  const {get} = useAjax();
  const key = body ? [`${HTTP_PREFIX}/devices/${body.workspace_id}/devices/${body.device_sn}/maintenance?page=${body.page}&page_size=${body.page_size}`] : null;
  return useSWR(key, async ([path]) => (await get<Resource<MaintenanceListData>>(path)).data.data);
};
