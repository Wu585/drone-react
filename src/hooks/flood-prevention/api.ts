import useSWR from "swr";
import {client} from "@/hooks/bicycles/api.ts";
import axios from "axios";
import EmergencyPlan from "@/components/flood-prevention/EmergencyPlan.tsx";

export interface AirDevice {
  address: string;
  device_id: string;
  device_name: string;
  device_type: string;
  is_online: string;
  items: string;
  last_data_time: string;
  location: [number, number];
  location_bd09: [number, number];
  register_time: string;
}

export const useAirDeviceList = (customerId: string) => {
  const key = customerId ? ["mis/getDeviceList", customerId] : false;
  return useSWR(key, async ([path, customerId]) =>
    (await client.get<Resource<AirDevice[]>>(path, {customerId})).data.data);
};

interface DeviceData {
  CreateTime: string;
  DeviceID: string;
  HUMI: number;
  ID: string;
  MPA: number;
  O3: number;
  PM10: number;
  PM25: number;
  TEMP: number;
  WD: number;
  WS: number;
  NOISE: number;
  TSP: number;
  LUX: number;
  WTANDAN: number;
  WTDDL: number;
  WTPH: number;
  WTRDO: number;
  WTTEMP: number;
  idx: string;
}

export const useDeviceRealData = (deviceId: string) => {
  const key = deviceId ? ["mis/getDeviceRealData", deviceId] : false;
  return useSWR(key, async ([path, deviceId]) =>
    (await client.get<Resource<DeviceData[]>>(path, {deviceId})).data.data);
};

export const useDeviceAverageData = (params: Partial<{
  deviceId: string;
  variable: string;
  benginTime: string;
  endTime: string
}>) => {
  return useSWR(params && params.deviceId && params.benginTime && params.endTime ? ["mis/getCustomerHourDataAVG", params] : null,
    async ([path, params]) => (await client.get<Resource<DeviceData[]>>(path, params)).data.data);
};

export interface FlowmetreData {
  id: string;
  deviceId: string;
  wellWaterLevel: string;
  flowRate: string;
  accumulatedWaterVolume: string;
  signalStrength: number;
  batteryVoltage: string;
  gprsCurrentStatus: number;
  reportStatusWord: string;
  alarmStatusWord: string;
  dischargeArea: string;
  instantaneousVelocity: string;
  averageVelocity: string;
  ambientTemperature: string;
  gaugeWaterStatus: string;
  pipelineWaterStatus: string;
  equipmentInWater: number;
  batteryLevel: string;
  sedimentationValue: string;
  radarWaterAltitude: string;
  radarWaterLevel: string;
  radarWaterLevelStatus: string;
  radarCommunicationStatus: string;
  createTime: string;
  beginTime: string;
  endTime: string;
}

// 根据时间段流量流速信息
export const useFlowmetreDataByInterval = (current: number, limit: number, data: Partial<FlowmetreData> = {}) => {
  return useSWR(data.beginTime && data.endTime ? [`flowmetreData/queryListTimeInterval/${current}/${limit}`, data] : null, async ([path, data]) =>
    (await client.post<Resource<{
      records: FlowmetreData[]
    }>>(path, data)).data.data);
};

// 查询最新流量流速信息
export const useFlowmetreData = (current: number, limit: number, data: Partial<FlowmetreData> = {}) => {
  return useSWR([`flowmetreData/page/${current}/${limit}`, data], async ([path, data]) =>
    (await client.post<Resource<{
      records: FlowmetreData[]
    }>>(path, data)).data.data);
};

interface AngleData {
  resultAngleList: {
    deviceCode: string;
    voltage: number
    xangle: number
    yangle: number
    createTime: string
  }[];
}

// 查询广告牌倾角
export const useAngleData = (data: Partial<{
  deviceCode: string,
  startDate: string,
  endDate: string,
  current: string,
  size: string
}>) => {
  return useSWR(data.startDate && data.endDate ? ["sensor/getAngleData", data] : null,
    async ([path, data]) => (await client.post<Resource<AngleData>>(path, data)).data.data);
};

// 查询所有应急物资信息
export const useFpMaterialReserves = () => useSWR("fp-material-reserves/queryAll",
  async (path) => (await client.get<Resource<{
    id: number;
    materialRusticate: string;
    materialType: string
    materialCount: number
  }[]>>(path)).data.data);

// 查询天气数据 ?cityIds=101021000
export const useWeatherInfo = (cityIds: string) => useSWR("weatherApi/app/weather/listWeather",
  async (path) => (await axios.get<any>(path, {params: {cityIds}})).data.value);

export interface EmergencyPlan {
  id: string;
  name: string;
  scene: string;
  people: string;
  time: string;
  content: string;
}

// 查询应急预案列表
export const useEmergencyPlan = () => useSWR("fpproject/emergency-plan/queryAll",
  async (path) => (await client.get<Resource<EmergencyPlan[]>>(path)).data.data);

interface LaLiLeData {
  deviceCode: string;
  signalStrength: number;
  liquidLevel: number;
  createTime: string;
}

// 液位信息
export const useLaLiLeData = (data: Partial<{
  deviceCode: string
  startDate: string
  endDate: string
  current: string
  size: string
}>) => useSWR(data.startDate && data.endDate ? ["sensor/getLaLiLeData", data] : null,
  async ([path, data]) => (await client.post<Resource<{
    resultLaLiLeList: LaLiLeData[]
  }>>(path, data)).data.data);
