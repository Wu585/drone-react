import {Http} from "@/lib/http.ts";
import useSWR from "swr";
import {client} from "@/hooks/bicycles/api.ts";

// 明厨亮灶
export const bkClient = new Http("http://36.152.38.220:9100/");

interface PageOffLine {
  id: string,
  type: string,
  imei: string,
  timestamp: number
}

export const usePageOffLine = (current: number, limit: number, data: Partial<PageOffLine> = {}) => {
  return useSWR([`flyOffline/pageOffline/${current}/${limit}`, data], async ([path, data]) =>
    (await bkClient.post<Resource<{
      records: PageOffLine[]
    }>>(path, data)).data.data);
};

interface WSZData {
  id: string;
  type: string;
  imei: string;
  rh: number;
  t: number;
  uv: number;
  lteCsq: number;
  wifiRssi: number;
  timestamp: number;
  beginTime: string;
  endTime: string;
}

// 温湿度及紫外线信息
export const useWSZPageInfo = (current: number, limit: number, data: Partial<WSZData> = {}) => {
  return useSWR(data.beginTime && data.endTime ? [`flySensorData/queuySensorDataByTimeInterval/${current}/${limit}`, data] : null, async ([path, data]) =>
    (await bkClient.post<Resource<{
      records: WSZData[]
    }>>(path, data)).data.data);
};

export interface BugData {
  id: string;
  type: string;
  imei: string;
  path: string;
  smallInsect: number;
  bigInsect: number;
  timestamp: number;
  beginTime: string;
  endTime: string;
}

// 粘板信息
export const useBugsInfo = (current: number, limit: number, data: Partial<BugData> = {}) => {
  return useSWR(data.beginTime && data.endTime && data.type === "0" ? [`flyPicture/queuyPictureByTimeInterval/${current}/${limit}`, data] : null, async ([path, data]) =>
    (await bkClient.post<Resource<{
      records: BugData[]
    }>>(path, data)).data.data);
};

interface MouseData {
  id: string;
  type: string;
  imei: string;
  side: number;
  t: number;
  triggleTime: number;
  csq: string;
  bat: number;
  timestamp: number;
  createTime: string;
  beginTime: string;
  endTime: string;
}

// 毒鼠信息
export const useMouseInfo = (current: number, limit: number, {type, ...restData}: Partial<MouseData>) => {
  return useSWR(restData.beginTime && restData.endTime && type === "1" ? [`nbMouseFirstTriggle/queuyMouseFirstTriggleByInterval/${current}/${limit}`, restData] : null, async ([path, data]) =>
    (await bkClient.post<Resource<{
      records: MouseData[]
    }>>(path, data)).data.data);
};

// 人员-图片信息
export const useLandmarkList = () => {
  return useSWR("fpLandmark/queryAll", async (path) => (await client.get<Resource<{
    zzr: string,
    picture: string
  }[]>>(path)).data.data)
};
