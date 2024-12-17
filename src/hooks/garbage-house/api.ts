import useSWR from "swr";
import {client} from "@/hooks/bicycles/api.ts";

export interface TrashCan {
  id: string;
  name: string;
  type: string;
  capacity: string;
  status: string;
  belongTo: string;
}

// 查询垃圾桶信息
export const useTrashCanList = () => useSWR("fpTrashCan/queryAll",
  async (path) => (await client.get<Resource<TrashCan[]>>(path)).data.data);

export interface GarbageRoom {
  id: string;
  name: string;
  address: string;
  lxr: string;
  lxrPhone: string;
  lontitude: string;
  latitude: string;
  type?: string;
}

// 查询垃圾厢房信息
export const useGarbageRoomList = () => useSWR("fpGarbageRoom/queryAll",
  async (path) => (await client.get<Resource<GarbageRoom[]>>(path)).data.data);

interface AlarmInfo {
  id: string;
  name: string;
  canName: string;
  type: string;
  longitude: string;
  latitude: string;
  remark: string;
  state: string;
  createTime: string;
  updateTime: string;
}

// 查询告警信息
export const useFpGarbageAlarmInfo = () => useSWR("fpproject/fp-garbage-alarm/queryAll",
  async (path) => (await client.get<Resource<AlarmInfo[]>>(path)).data.data)
