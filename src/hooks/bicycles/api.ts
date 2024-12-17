import {Http} from "@/lib/http.ts";
import useSWR from "swr";
import {BicycleRideStateEnum, BicycleTypeEnum, BikeStatusEnum} from "@/assets/datas/enum.ts";
import useSWRImmutable from "swr/immutable";

export const client = new Http("http://36.152.38.220:8888/");

export interface BicyclesInfo {
  bikeId: string;
  bikeType: BicycleTypeEnum;
  orderNum: string;
  bikeStatus: BikeStatusEnum;
  longitude: number;
  latitude: number;
  rideState: BicycleRideStateEnum;
  areaId: number;
  locateTime: string;
}

// 获取单车列表-分页
export const useBicyclesInfo = (page: number, limit: number, data: Partial<BicyclesInfo> = {}) => {
  return useSWR([`fpBick/page/${page}/${limit}`, data], async ([path, data]) => (await client.post<Resource<{
    items: BicyclesInfo[],
    total: number
  }>>(path, data)).data.data);
};

// 获取所有单车信息
export const useBicycleAllInfo = () => {
  return useSWRImmutable(`fpBick/queryAll`, async (path) =>
    (await client.get<Resource<BicyclesInfo[]>>(path)).data.data);
};

export interface BicycleOrder {
  orderId: string;
  bikeId: string;
  bikeType: number;
  startTime: string;
  endTime: string;
  borrowAddressLon: string;
  returnAddressLon: string;
  borrowAddressLat: string;
  returnAddressLat: string;
  borrowAreaId: number;
  returnAreaId: number;
  rideState: number;
  rideTime: string;
  rideDistance: number;
  returnNormal: number;
  areaId: number;
  tracks: string;
}

export const useBicyclesOrders = (page: number, limit: number) => {
  return useSWR(`fpOrder/page/${page}/${limit}`, async (path) => (await client.post<Resource<{
    items: BicycleOrder[],
    total: number
  }>>(path, {})).data.data);
};

export const useBicyclesAllOrders = () => {
  return useSWR(`fpOrder/queryAll`, async (path) => (await client.get<Resource<BicycleOrder[]>>(path)).data.data);
};

// 获取不同状态的单车数量
export const useBicyclesStatus = (rideState: number) => {
  const key = ["fpBick/getCount", rideState] as const;

  return useSWR(key, async ([path, rideState]) => (await client.get<Resource<number>>(path, {
    rideState
  })).data.data);
};

// 根据单车id获取单车订单信息
export const useOrderInfoByBicycleId = (id?: string) => {
  const key = id ? ["fpOrder/getByBikeId", id] : false;
  return useSWR(key, async ([path, id]) => (await client.get<Resource<BicycleOrder[]>>(path, {
    id
  })).data.data);
};

export const useOrderInfoByOrderId = (id?: string) => {
  const key = id ? ["fpOrder/get", id] : false;
  return useSWR(key, async ([path, id]) =>
    (await client.get<Resource<BicycleOrder[]>>(path, {id})).data.data);
};

// 单车区域分布信息
export const useBicycleDistributedInfo = () => {
  return useSWR(`fpBick/getAreaCount`, async (path) =>
    (await client.get<Resource<Record<string, number>>>(path)).data.data);
};

export interface DateRangeAmount {
  bike_count: number;
  active_bikes: number;
  time_interval: string;
  inactive_bikes: number;
}

// 重点区域单车数量统计，按日期折线图数据展示
export const useQueryByDateRange = (data?: {
  startTime: string
  endTime: string
  interval: number
  areaId: number
}) => {
  const key = data ? [`fpBick/queryData`, data] as const : null;
  return useSWR(key, async ([path, data]) =>
    (await client.post<Resource<DateRangeAmount[]>>(path, data)).data.data);
};
