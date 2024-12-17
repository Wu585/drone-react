import useSWR from "swr";
import {client} from "@/hooks/bicycles/api.ts";

export interface ParkingSpace {
  id: string;
  batteryLevel: null | number; //电池电压,单位mv
  parkingspotState: null | any;  //是否有车,0无车；1有车
  temperature: number; //环境温度
  version: string; //版本号
  error_message: null | string; //模块出现异常
  armingState: null | any; //布防状态
  imei: string;  //设备编号
  iccid: string; //设备卡号
  radarefficary: number; //雷达是否有效
  csq: number; //信号量
  deviceName: string;
}

export const useQueryAllParkingSpace = () => {
  return useSWR(`/mgttGeoMessage/page/1/43`, async (path) => (await client.post<Resource<{
    records: ParkingSpace[]
  }>>(path, {})).data.data);
};

export interface ElectricityMeterInfo {
  id: string;
  deviceNo: string;
  deviceName: string;
  password: string;
  location: string;
  productId: string;
  userId: string;
  status: number;
  lastOnlineTime: string;
  lastOfflineTime: string;
  paramId: string;
  priceId: string;
  isAlarm: number;
  loadId: string;
  constantId: string;
  checkMeterId: string;
  valve: number;
  surplus: number;
  retryCheckMeterNum: number;
  createTime: string;
  createUserId: string;
  createUserName: string;
  createUserHost: string;
  updateTime: string;
  updateUserId: string;
  updateUserName: string;
  updateUserHost: string;
  imei: string;
  isShare: number;
  signal11: string;
  iccid: string;
  price: string;
  concentratorId: string;
  constantNum: string;
  deviceTypeName: string;
  username: string;
  priceName: string;
  checkMeterName: string;
  paramName: string;
  loadName: string;
  isWifi: number;
  valve1: boolean;
  adminUserName: string;
  surplusAmount: number;
  checkStatus: number;
  checkTime: string;
  areaCode: string;
  isPrepayment: number;
  useType: string;
  isPublicShare: number;
  isOpenAccount: number;
  useTypeName: string;
  isUseScale: number;
  scale: string;
  adminUserId: string;
  closeWater: number;
}

export const useElectricityMeterInfo = (deviceNo:string) => useSWR(`/sensor/getElectricityMeterInfo?page=1&limit=25&deviceNo=${deviceNo}`,
  async (path) => (await client.post<Resource<{ list: ElectricityMeterInfo[] }>>(path, {})).data.data);

export const useAllElectricityMeterInfo = () => {
  const deviceNos = ["202407160006", "202407160007", "202407160010"];

  const results = deviceNos.map(deviceNo => useElectricityMeterInfo(deviceNo));

  const data = results.map(result => result.data?.list || []);

  return { data: ([] as ElectricityMeterInfo[]).concat(...data) }; // 合并所有数据
};
