import {Http, useAjax} from "@/lib/http.ts";
import useSWR from "swr";
import {client} from "@/hooks/bicycles/api.ts";

export const iPortalClient = new Http("iPortal");

export const login = (data: {
  username: string,
  password: string
}) => iPortalClient.post<{
  succeed: boolean
}>("iportal/web/login.rjson", data);

export interface Role {
  description: string;
  name: string;
}

export const useRoles = () => {
  const {get} = useAjax();

  return useSWR("iportal/manager/security/roles.json", async (path) => (await get<Role[]>(path)).data);
};

export interface Log {
  date: string;
  logLevel: {
    name: string
    priority: number
  };
  message: string;
}

export const useLogs = () => {
  const {get} = useAjax();
  return useSWR("iportal/manager/logsOperation.json?logLevel=ALL&count=1000", async (path) => (await get<Log[]>(path)).data);
};

export interface Content {
  name: string;
  nickname: string;
  ownRoles: string[];
  maxDataCapacity: number;
  isLocked: boolean;
}

export interface User {
  // content: Content[];
  userName: string;
}

export const useUsers = () => {
  const {get} = useAjax();
  return useSWR("iportal/manager/security/v811/portalusers.json", async (path) => (await get<User>(path, {
    orderType: "ASC",
    orderBy: "USERNAME",
    pageSize: 1000,
    currentPage: 1,
  })).data);
};

export interface ServiceContent {
  linkPage: string;
  resTitle: string;
  enable: boolean;
  userName: string;
  createTime: number;
  isBatch: boolean;
  type: string;
  id: number;
}

interface Service {
  content: ServiceContent[];
}

export const useServices = () => {
  const {get} = useAjax();
  return useSWR("iportal/manager/iportalconfig/servicesmanage.json", async (path) => (await get<Service>(path, {
    checkStatus: "SUCCESSFUL",
    currentPage: "1",
    pageSize: 1000,
    orderBy: "UPDATETIME",
    orderType: "DESC"
  })).data);
};

export const useUserProfile = () => {
  const {get} = useAjax();
  return useSWR("iportal/web/config/userprofile.json", async (path) => (await get<User>(path)).data);
};

export const useUrlResource = (url: string) => {
  const {get} = useAjax();
  return useSWR("iportal/apps/viewer/getUrlResource.json", async (path) => (await get<User>(path, {url})).data);
};

export const useUserCounts = () => {
  const {get} = useAjax();
  return useSWR("iportal/manager/portalstatistics/user/distributionbytype.json", async (path) => (await get<{
    CREATOR: number
    VIEWER: number
  }>(path)).data);
};

export const useOnlineUserCounts = () => {
  const {get} = useAjax();
  return useSWR("iportal/manager/portalstatistics/user/onlinelist/count.json", async (path) => (await get<number>(path)).data);
};

export interface WorkOrder {
  id: string;
  lxr: string;
  lxrPhone: string;
  problemDiscoveryTime: string;
  problemDiscoveryPosition: string;
  problemHandlingDept: string;
  problemContent: string;
}

export const useWorkOrderList = (pageNum: number, pageSize: number) => {
  return useSWR(`workOrder/page/${pageNum}/${pageSize}`, async (path) => (await client.post<Resource<{
    records: WorkOrder[]
    total: number
    current: number;
    pages: number
  }>>(path, {})).data.data);
};

export interface AddressBook {
  id: string;
  name: string;
  dept: string;
  gender: string;
  phone: string;
  email: string;
  createTime: string;
  updateTime: string;
}

// 通讯录
export const useAddressBookList = (pageNum: number, pageSize: number) => {
  return useSWR(`fpAddressBook/page/${pageNum}/${pageSize}`,
    async (path) => (await client.post<Resource<{
      items: AddressBook[]
      total: number
    }>>(path, {})).data.data);
};

// 获取所有传感器的设备类型
export const useDeviceList = () => {
  return useSWR("fpInfoTemplates/getDeviceList", async (path) => (await client.get<Resource<string[]>>(path)).data.data);
};

// 获取用户信息
export const useTemplateUserList = () => {
  return useSWR("fpInfoTemplates/getUserList", async (path) => (await client.get<Resource<{
    id: string,
    userName: string
  }[]>>(path)).data.data);
};

export interface Template {
  id: string;
  templateId: string;
  templateName: string;
  deviceMatch: string;
  sendContent: string;
  receiveLetters: string;
}

// 获取所有模板信息
export const useTemplateList = () => {
  return useSWR("fpInfoTemplates/queryAll", async (path) => (await client.get<Resource<Template[]>>(path)).data.data);
};

// 获取消息列表
export const useUserAlertsByUserName = (userName: string) => {
  return useSWR(`fpInfoTemplates/getUserAlertsByUserName?userName=${userName}`,
    async (path) => (await client.get<Resource<Template[]>>(path)).data.data);
};
